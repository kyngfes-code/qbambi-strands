import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { orderId, amount, reason, customerMessage, adminNote } =
      await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required." },
        { status: 400 },
      );
    }

    const refundAmount = Number(amount);

    if (!refundAmount || refundAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid refund amount." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    /*
    ---------------------------------------
    Get total confirmed payments
    ---------------------------------------
    */

    const { data: payments, error: paymentError } = await supabase
      .from("payment_history")
      .select("id, amount")
      .eq("order_id", orderId)
      .eq("status", "confirmed");

    if (paymentError) {
      return NextResponse.json(
        { error: paymentError.message },
        { status: 500 },
      );
    }

    if (!payments.length) {
      return NextResponse.json(
        { error: "No confirmed payments found." },
        { status: 400 },
      );
    }

    /*
    ---------------------------------------
    Already refunded
    ---------------------------------------
    */

    const { data: refunds, error: refundError } = await supabase
      .from("order_payment_adjustments")
      .select("amount")
      .in("adjustment_type", ["refund", "partial_refund"])
      .eq("order_id", orderId);

    if (refundError) {
      return NextResponse.json({ error: refundError.message }, { status: 500 });
    }

    const totalPaid = payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    const totalRefunded = refunds.reduce(
      (sum, refund) => sum + Number(refund.amount),
      0,
    );

    const refundable = totalPaid - totalRefunded;

    if (refundAmount > refundable) {
      return NextResponse.json(
        {
          error: `Maximum refundable amount is ₦${refundable.toLocaleString()}.`,
        },
        { status: 400 },
      );
    }

    /*
    ---------------------------------------
    Determine adjustment type
    ---------------------------------------
    */

    const adjustmentType =
      refundAmount === refundable ? "refund" : "partial_refund";

    /*
    ---------------------------------------
    Insert adjustment
    ---------------------------------------
    */

    const { error: insertError } = await supabase
      .from("order_payment_adjustments")
      .insert({
        order_id: orderId,
        adjustment_type: adjustmentType,
        amount: refundAmount,
        reason,
        customer_message: customerMessage,
        admin_note: adminNote,
        created_by: session.user.id,
      });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      refunded: refundAmount,
      remainingRefundable: refundable - refundAmount,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
