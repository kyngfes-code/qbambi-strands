import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

import { verifyPaystackTransaction } from "@/lib/payments/paystack";

import {
  finalizePaystackInstalmentPayment,
  finalizePaystackOrderPayment,
} from "@/lib/payments/orders";

import { finalizeOnlineAppointmentPayment } from "@/lib/payments/appointments";

import { finalizePaystackAcademyPayment } from "@/lib/payments/academy";

/**
 * ==========================================================
 * Paystack Verification Route
 * ==========================================================
 *
 * Flow:
 *
 * Paystack
 *    ↓
 * verify transaction with Paystack
 *    ↓
 * validate reference
 *    ↓
 * validate amount
 *    ↓
 * payment_transactions.status = verified
 *    ↓
 * finalize business payment
 *
 * payment_transactions is the central gateway ledger.
 *
 * Business-specific finalizers then update:
 *
 * appointment_payments
 * orders
 * instalments
 * academy_enrollment_payments
 *
 * IMPORTANT:
 *
 * We mark the central transaction VERIFIED before calling
 * the business finalizer.
 *
 * This is required because Academy finalization explicitly
 * requires payment_transactions.status === "verified".
 */

export async function GET(req) {
  try {
    /*
    ==========================================================
    1. Authenticate User
    ==========================================================
    */

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    /*
    ==========================================================
    2. Read Paystack Reference
    ==========================================================
    *
    * Paystack can return either:
    *
    * reference
    * trxref
    *
    * We support both.
    */

    const { searchParams } = new URL(req.url);

    const reference =
      searchParams.get("reference") || searchParams.get("trxref");

    if (!reference) {
      return NextResponse.json(
        {
          error: "Missing payment reference.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    ==========================================================
    3. Create Admin Supabase Client
    ==========================================================
    */

    const supabase = createSupabaseAdmin();

    /*
    ==========================================================
    4. Load Central Payment Transaction
    ==========================================================
    */

    const { data: transaction, error: transactionError } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("reference", reference)
      .maybeSingle();

    if (transactionError) {
      console.error("Paystack transaction lookup error:", transactionError);

      return NextResponse.json(
        {
          error: "Unable to load payment transaction.",
        },
        {
          status: 500,
        },
      );
    }

    if (!transaction) {
      return NextResponse.json(
        {
          error: "Transaction not found.",
        },
        {
          status: 404,
        },
      );
    }

    /*
    ==========================================================
    5. Ownership Validation
    ==========================================================
    */

    if (transaction.user_id !== session.user.id) {
      return NextResponse.json(
        {
          error: "Forbidden.",
        },
        {
          status: 403,
        },
      );
    }

    /*
    ==========================================================
    6. Basic Transaction Validation
    ==========================================================
    */

    if (!transaction.reference) {
      return NextResponse.json(
        {
          error: "Payment transaction has no reference.",
        },
        {
          status: 400,
        },
      );
    }

    if (!transaction.entity_type) {
      return NextResponse.json(
        {
          error: "Payment transaction has no entity type.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    ==========================================================
    7. Verify With Paystack
    ==========================================================
    *
    * We still verify with Paystack even if our local
    * transaction was previously marked verified.
    *
    * This gives us a reliable gateway source of truth.
    */

    const paystack = await verifyPaystackTransaction(reference);

    if (!paystack) {
      throw new Error("Paystack returned an empty verification response.");
    }

    /*
    ==========================================================
    8. Validate Paystack Payment Status
    ==========================================================
    */

    const gatewayStatus = String(paystack.status || "").toLowerCase();

    const gatewayResponse = String(
      paystack.gateway_response || "",
    ).toLowerCase();

    const paymentSuccessful =
      gatewayStatus === "success" &&
      (!gatewayResponse || gatewayResponse === "successful");

    /*
    ==========================================================
    9. Failed Gateway Payment
    ==========================================================
    */

    if (!paymentSuccessful) {
      const { data: failedTransaction, error: failedUpdateError } =
        await supabase
          .from("payment_transactions")
          .update({
            status: "failed",

            gateway_response: paystack,

            gateway_transaction_id:
              paystack.id != null ? String(paystack.id) : null,

            paid_at: paystack.paid_at || null,

            updated_at: new Date().toISOString(),
          })
          .eq("id", transaction.id)
          .select("*")
          .single();

      if (failedUpdateError) {
        console.error("Failed transaction update error:", failedUpdateError);

        throw failedUpdateError;
      }

      return NextResponse.json({
        success: false,
        verified: false,
        transaction: failedTransaction,
      });
    }

    /*
    ==========================================================
    10. Validate Gateway Reference
    ==========================================================
    *
    * Never finalize a payment if Paystack returned a
    * different reference from our internal transaction.
    */

    if (paystack.reference !== transaction.reference) {
      throw new Error("Payment reference mismatch.");
    }

    /*
    ==========================================================
    11. Validate Gateway Amount
    ==========================================================
    *
    * Paystack amount is Kobo.
    *
    * Database amount is Naira.
    */

    const gatewayAmount = Number(paystack.amount) / 100;

    const transactionAmount = Number(transaction.amount);

    if (
      !Number.isFinite(gatewayAmount) ||
      !Number.isFinite(transactionAmount)
    ) {
      throw new Error("Invalid payment amount.");
    }

    if (Math.abs(gatewayAmount - transactionAmount) > 0.01) {
      console.error("Paystack amount mismatch:", {
        reference,
        gatewayAmount,
        transactionAmount,
      });

      throw new Error("Payment amount mismatch.");
    }

    /*
    ==========================================================
    12. Mark Central Transaction VERIFIED
    ==========================================================
    *
    * THIS IS THE IMPORTANT FIX.
    *
    * Academy finalization checks:
    *
    * transaction.status === "verified"
    *
    * Therefore this update MUST happen before:
    *
    * finalizePaystackAcademyPayment()
    */

    const { data: verifiedTransaction, error: verifyUpdateError } =
      await supabase
        .from("payment_transactions")
        .update({
          status: "verified",

          gateway_response: paystack,

          gateway_transaction_id:
            paystack.id != null ? String(paystack.id) : null,

          paid_at: paystack.paid_at || new Date().toISOString(),

          verified_at: new Date().toISOString(),

          updated_at: new Date().toISOString(),
        })
        .eq("id", transaction.id)
        .select("*")
        .single();

    if (verifyUpdateError) {
      console.error(
        "Payment transaction verification update error:",
        verifyUpdateError,
      );

      throw verifyUpdateError;
    }

    /*
    ==========================================================
    13. Finalize Business Payment
    ==========================================================
    *
    * The central transaction is now VERIFIED.
    *
    * Each business domain handles its own accounting.
    */

    switch (verifiedTransaction.entity_type) {
      /*
      ========================================================
      ORDER
      ========================================================
      */

      case "order": {
        await finalizePaystackOrderPayment({
          supabase,

          orderId: verifiedTransaction.entity_id,

          transactionId: verifiedTransaction.id,
        });

        break;
      }

      /*
      ========================================================
      APPOINTMENT
      ========================================================
      *
      * IMPORTANT:
      *
      * finalizeOnlineAppointmentPayment() expects:
      *
      * paymentId
      * transactionReference
      *
      * NOT transactionId.
      */

      case "appointment": {
        if (!verifiedTransaction.source_record_id) {
          throw new Error(
            "Appointment payment transaction is missing source_record_id.",
          );
        }

        await finalizeOnlineAppointmentPayment({
          supabase,

          paymentId: verifiedTransaction.source_record_id,

          transactionReference: verifiedTransaction.reference,
        });

        break;
      }

      /*
      ========================================================
      INSTALMENT
      ========================================================
      */

      case "instalment": {
        await finalizePaystackInstalmentPayment({
          supabase,

          instalmentId: verifiedTransaction.entity_id,

          transactionId: verifiedTransaction.id,
        });

        break;
      }

      /*
      ========================================================
      ACADEMY ENROLLMENT
      ========================================================
      *
      * Academy finalizer expects:
      *
      * enrollmentId
      * transactionId
      *
      * It will locate the academy payment using:
      *
      * payment_transaction_id
      */

      case "academy_enrollment": {
        await finalizePaystackAcademyPayment({
          supabase,

          enrollmentId: verifiedTransaction.entity_id,

          transactionId: verifiedTransaction.id,
        });

        break;
      }

      /*
      ========================================================
      UNSUPPORTED ENTITY
      ========================================================
      */

      default: {
        throw new Error(
          `Unsupported payment entity type: ${verifiedTransaction.entity_type}`,
        );
      }
    }

    /*
    ==========================================================
    14. Reload Central Transaction
    ==========================================================
    */

    const { data: updatedTransaction, error: reloadError } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("id", verifiedTransaction.id)
      .single();

    if (reloadError) {
      throw reloadError;
    }

    /*
    ==========================================================
    15. Success
    ==========================================================
    */

    return NextResponse.json({
      success: true,

      verified: true,

      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error("Paystack verification error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Verification failed.",
      },
      {
        status: 500,
      },
    );
  }
}
