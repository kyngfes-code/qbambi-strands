import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

import { verifyPaystackTransaction } from "@/lib/payments/paystack";

import {
  finalizePaystackInstalmentPayment,
  finalizePaystackOrderPayment,
} from "@/lib/payments/orders";

import { finalizeOnlineAppointmentPayment } from "@/lib/payments/appointments";

export async function GET(req) {
  try {
    /*
    ==================================================
    Authenticate User
    ==================================================
    */

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    /*
    ==================================================
    Read Reference
    ==================================================
    */

    const { searchParams } = new URL(req.url);

    const reference = searchParams.get("reference");

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

    const supabase = createSupabaseAdmin();

    /*
    ==================================================
    Load Transaction
    ==================================================
    */

    const { data: transaction, error: transactionError } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("reference", reference)
      .single();

    if (transactionError || !transaction) {
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
    ==================================================
    Ensure ownership
    ==================================================
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
    ==================================================
    Already verified
    ==================================================
    */

    if (transaction.status === "verified") {
      return NextResponse.json({
        success: true,
        verified: true,
        alreadyVerified: true,
        transaction,
      });
    }

    /*
    ==================================================
    Verify with Paystack
    ==================================================
    */

    const paystack = await verifyPaystackTransaction(reference);

    /*
    ==================================================
    Verify gateway response
    ==================================================
    */

    if (
      paystack.status !== "success" ||
      paystack.gateway_response !== "Successful"
    ) {
      await supabase
        .from("payment_transactions")
        .update({
          status: "failed",
          gateway_response: paystack,
          gateway_transaction_id: String(paystack.id),
          paid_at: paystack.paid_at,
          updated_at: new Date().toISOString(),
        })
        .eq("id", transaction.id);

      return NextResponse.json({
        success: false,
        verified: false,
      });
    }

    /*
    ==================================================
    Amount validation
    ==================================================
    */

    const gatewayAmount = Number(paystack.amount) / 100;

    if (gatewayAmount !== Number(transaction.amount)) {
      throw new Error("Payment amount mismatch.");
    }

    /*
    ==================================================
    Reference validation
    ==================================================
    */

    if (paystack.reference !== transaction.reference) {
      throw new Error("Reference mismatch.");
    }

    /*
    ==================================================
    Save gateway payload
    ==================================================
    */

    const { error: updateGatewayError } = await supabase
      .from("payment_transactions")
      .update({
        gateway_response: paystack,
        gateway_transaction_id: String(paystack.id),
        paid_at: paystack.paid_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction.id);

    if (updateGatewayError) {
      throw updateGatewayError;
    }

    /*
    ==================================================
    Finalize business transaction
    ==================================================
    */

    switch (transaction.entity_type) {
      case "order":
        await finalizePaystackOrderPayment({
          supabase,
          orderId: transaction.entity_id,
          transactionId: transaction.id,
        });
        break;

      case "appointment":
        await finalizeOnlineAppointmentPayment({
          supabase,
          paymentId: transaction.source_record_id,
          transactionId: transaction.id,
        });
        break;

      case "instalment":
        await finalizePaystackInstalmentPayment({
          supabase,
          instalmentId: transaction.entity_id,
          transactionId: transaction.id,
        });
        break;

      default:
        throw new Error(`Unsupported entity type: ${transaction.entity_type}`);
    }

    /*
    ==================================================
    Reload transaction
    ==================================================
    */

    const { data: updatedTransaction, error: reloadError } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("id", transaction.id)
      .single();

    if (reloadError) {
      throw reloadError;
    }

    /*
    ==================================================
    Success
    ==================================================
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
        error: error.message || "Verification failed.",
      },
      {
        status: 500,
      },
    );
  }
}
