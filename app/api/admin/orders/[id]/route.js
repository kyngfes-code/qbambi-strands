import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req, { params }) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const supabase = createSupabaseAdmin();

  // ==========================
  // Order
  // ==========================

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      customer:users!orders_user_id_fkey (
        id,
        name,
        email,
        phone
      ),
      delivered_admin:users!orders_delivered_by_fkey (
        id,
        name,
        email
      ),
      confirmed_admin:users!orders_confirmed_by_fkey (
        id,
        name,
        email
      ),
      payment_rejections:payment_rejections!payment_rejections_order_id_fkey (
        id,
        rejection_reason,
        customer_message,
        created_at,
        rejected_by
      ),
      order_items (
        id,
        quantity,
        price,
        store (
          id,
          title,
          image,
          price
        )
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ==========================
  // Payment History
  // ==========================

  const { data: paymentHistory, error: paymentError } = await supabase
    .from("payment_history")
    .select("*")
    .eq("order_id", id)
    .eq("status", "confirmed")
    .order("created_at", { ascending: false });

  if (paymentError) {
    console.error(paymentError);

    return NextResponse.json({ error: paymentError.message }, { status: 500 });
  }

  // ==========================
  // Refund History
  // ==========================

  const { data: refunds, error: refundError } = await supabase
    .from("order_payment_adjustments")
    .select(
      `
      id,
      adjustment_type,
      amount,
      reason,
      customer_message,
      admin_note,
      created_at,
      created_by
    `,
    )
    .eq("order_id", id)
    .order("created_at", { ascending: false });

  if (refundError) {
    console.error(refundError);

    return NextResponse.json({ error: refundError.message }, { status: 500 });
  }

  // ==========================
  // Financial Summary
  // ==========================

  const totalPaid = paymentHistory.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0,
  );

  const refundedAmount = Number(order.refunded_amount || 0);

  const refundableBalance = Math.max(0, totalPaid - refundedAmount);

  const netReceived = Math.max(0, totalPaid - refundedAmount);

  return NextResponse.json({
    ...order,
    paymentHistory,
    refunds,
    financialSummary: {
      totalAmount: Number(order.total_amount || 0),
      totalPaid,
      refundableBalance,
      refundedAmount,
      netReceived,
    },
  });
}
