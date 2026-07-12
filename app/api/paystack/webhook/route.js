import crypto from "crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

import { finalizePaystackAppointmentPayment } from "@/lib/payments/appointments";
import {
  finalizePaystackInstalmentPayment,
  finalizePaystackOrderPayment,
} from "@/lib/payments/orders";
import { confirmInstalmentPayment } from "@/lib/payments/orders";

const SECRET = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req) {
  try {
    /*
    =====================================================
    Verify Paystack Signature
    =====================================================
    */

    const rawBody = await req.text();

    const signature = req.headers.get("x-paystack-signature");

    const expectedSignature = crypto
      .createHmac("sha512", SECRET)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json(
        {
          error: "Invalid Paystack signature.",
        },
        {
          status: 401,
        },
      );
    }

    /*
    =====================================================
    Parse Event
    =====================================================
    */

    const event = JSON.parse(rawBody);

    if (
      event.event !== "charge.success" &&
      event.event !== "charge.completed"
    ) {
      return NextResponse.json({ received: true });
    }

    const paystack = event.data;

    const reference = paystack.reference;

    const supabase = createSupabaseAdmin();

    /*
    =====================================================
    Load Transaction
    =====================================================
    */

    const { data: transaction, error } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("reference", reference)
      .single();

    if (error || !transaction) {
      console.error("Unknown Paystack reference:", reference);

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
    =====================================================
    Idempotency
    =====================================================
    */

    if (transaction.status === "verified") {
      return NextResponse.json({
        received: true,
      });
    }

    /*
    =====================================================
    Validate Amount
    =====================================================
    */

    const gatewayAmount = Number(paystack.amount) / 100;

    if (gatewayAmount !== Number(transaction.amount)) {
      throw new Error("Payment amount mismatch.");
    }

    /*
    =====================================================
    Save Gateway Response
    =====================================================
    */

    await supabase
      .from("payment_transactions")
      .update({
        gateway_response: paystack,
        gateway_transaction_id: String(paystack.id),
        provider_reference: paystack.reference,
        paid_at: paystack.paid_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction.id);

    /*
    =====================================================
    Finalize Business Transaction
    =====================================================
    */

    switch (transaction.entity_type) {
      /*
      ---------------------------------------------
      Orders
      ---------------------------------------------
      */

      case "order":
        await finalizePaystackOrderPayment({
          supabase,
          orderId: transaction.entity_id,
          transactionId: transaction.id,
        });
        break;

      /*
      ---------------------------------------------
      Appointments
      ---------------------------------------------
      */

      case "appointment":
        await finalizePaystackAppointmentPayment({
          supabase,
          paymentId: transaction.source_record_id,
          transactionId: transaction.id,
        });
        break;

      /*
      ---------------------------------------------
      Instalments
      ---------------------------------------------
      */

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
    =====================================================
    Mark Transaction Verified
    =====================================================
    */

    await supabase
      .from("payment_transactions")
      .update({
        status: "verified",
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction.id);

    /*
    =====================================================
    Success
    =====================================================
    */

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error("Paystack webhook:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
