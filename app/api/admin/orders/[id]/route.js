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

  // =====================================================
  // Order
  // =====================================================

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      customer:users!orders_user_id_fkey(
        id,
        name,
        email,
        phone
      ),
      delivered_admin:users!orders_delivered_by_fkey(
        id,
        name,
        email
      ),
      confirmed_admin:users!orders_confirmed_by_fkey(
        id,
        name,
        email
      ),
      payment_rejections:payment_rejections!payment_rejections_order_id_fkey(
        id,
        rejection_reason,
        customer_message,
        created_at,
        rejected_by
      ),
      order_items(
        id,
        quantity,
        price,
        store(
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

  // =====================================================
  // Payment Transactions
  // =====================================================

  const { data: paymentTransactions, error: paymentError } = await supabase
    .from("payment_transactions")
    .select(
      `
      id,
      provider,
      provider_reference,
      payment_type,
      payment_method,
      amount,
      currency,
      status,
      verified_at,
      paid_at,
      created_at,
      metadata
    `,
    )
    .eq("entity_type", "order")
    .eq("entity_id", id)
    .order("created_at", { ascending: false });

  if (paymentError) {
    console.error(paymentError);

    return NextResponse.json({ error: paymentError.message }, { status: 500 });
  }

  // =====================================================
  // Refunds / Adjustments
  // =====================================================

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
  refund_method,
  refund_reference,
  created_by,
  admin:users!order_payment_adjustments_created_by_fkey(
    id,
    name,
    email
  )
`,
    )
    .eq("order_id", id)
    .order("created_at", { ascending: false });

  if (refundError) {
    console.error(refundError);

    return NextResponse.json({ error: refundError.message }, { status: 500 });
  }

  // =====================================================
  // Financial Summary
  // =====================================================

  // =====================================================
  // Financial Summary
  // =====================================================

  const verifiedPayments = paymentTransactions.filter(
    (tx) => tx.status === "verified",
  );

  const totalPaid = verifiedPayments.reduce(
    (sum, tx) => sum + Number(tx.amount || 0),
    0,
  );

  const totalRefunded = (refunds ?? [])
    .filter((r) =>
      ["refund", "partial_refund", "overpayment_refund"].includes(
        r.adjustment_type,
      ),
    )
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const refundableBalance = Math.max(0, totalPaid - totalRefunded);

  const netReceived = Math.max(0, totalPaid - totalRefunded);

  return NextResponse.json({
    ...order,

    paymentTransactions,

    refunds,

    financialSummary: {
      totalAmount: Number(order.total_amount || 0),
      totalPaid,
      totalRefunded,
      refundableBalance,
      netReceived,
    },
  });
}
