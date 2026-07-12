import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseWithAuth } from "@/lib/supabase";

/* =========================
   CREATE ORDER (CHECKOUT)
========================= */
export async function POST() {
  const session = await auth();

  if (!session?.user?.id || !session?.supabaseAccessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = supabaseWithAuth(session.supabaseAccessToken);

  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("store_id, quantity, store(price)")
    .eq("user_id", session.user.id);

  if (cartError || !cart?.length) {
    return NextResponse.json({ error: "Cart empty" }, { status: 400 });
  }

  const total = cart.reduce(
    (sum, item) => sum + item.store.price * item.quantity,
    0,
  );

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: session.user.id,
      total_amount: total,
      status: "pending",
      payment_plan_id: null,
    })
    .select()
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 400 });
  }

  const orderItems = cart.map((item) => ({
    order_id: order.id,
    store_id: item.store_id,
    quantity: item.quantity,
    price: item.store.price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 400 });
  }

  const { error: clearCartError } = await supabase
    .from("carts")
    .delete()
    .eq("user_id", session.user.id);

  if (clearCartError) {
    console.error("Failed to clear cart:", clearCartError);
  }

  return NextResponse.json(order);
}

/* =========================
   FETCH USER ORDERS
========================= */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id || !session?.supabaseAccessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = supabaseWithAuth(session.supabaseAccessToken);

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
       order_items(
      id,
      quantity,
      price,
      store(
        id,
        title,
        image
      )
    ),
      payment_plan:payment_plans!orders_payment_plan_id_fkey (
        id,
        status,
        outstanding_balance,
        instalments (
          id,
          amount,
          paid,
          due_date
        )
      ),

      rejection:payment_rejections!orders_rejection_id_fkey (
        id,
        rejection_reason,
        customer_message,
        created_at
      ),

      cancellation:order_cancellations!orders_cancellation_id_fkey (
        id,
        cancellation_reason,
        customer_message,
        created_at
      ),

        order_payment_adjustments (
        id,
        adjustment_type,
        amount,
        reason,
        customer_message,
        created_at
      )
    `,
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message,
        details: error,
      },
      { status: 400 },
    );
  }

  const orderIds = (data ?? []).map((o) => o.id);

  let transactions = [];

  if (orderIds.length) {
    const { data: txs, error: transactionsError } = await supabase
      .from("payment_transactions")
      .select(
        `
      id,
      entity_id,
      entity_type,
      amount,
      payment_method,
      payment_type,
      provider,
      provider_reference,
      status,
      verified_at,
      paid_at,
      created_at
    `,
      )
      .eq("entity_type", "order")
      .in("entity_id", orderIds);

    if (transactionsError) {
      console.error(transactionsError);

      return NextResponse.json(
        { error: transactionsError.message },
        { status: 400 },
      );
    }

    transactions = txs ?? [];
  }

  const txMap = {};

  for (const tx of transactions ?? []) {
    if (!txMap[tx.entity_id]) {
      txMap[tx.entity_id] = [];
    }

    txMap[tx.entity_id].push(tx);
  }

  const enriched = (data || []).map((order) => {
    /* ----------------------------
       Payment Plan
    ----------------------------- */

    let paymentPlan = null;

    if (order.payment_plan) {
      const next = order.payment_plan.instalments
        ?.filter((i) => !i.paid)
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];

      paymentPlan = {
        id: order.payment_plan.id,
        status: order.payment_plan.status,
        outstanding_balance: order.payment_plan.outstanding_balance ?? null,
        next_instalment_id: next?.id ?? null,
        next_instalment_amount: next?.amount ?? null,
        next_instalment_due_date: next?.due_date ?? null,
      };
    }

    /* ----------------------------
       Payments
    ----------------------------- */

    const paymentHistory = (txMap[order.id] ?? [])
      .filter((tx) => tx.status === "verified")
      .sort(
        (a, b) =>
          new Date(a.verified_at || a.created_at) -
          new Date(b.verified_at || b.created_at),
      );

    const totalPaid = paymentHistory.reduce((sum, tx) => {
      return sum + Number(tx.amount || 0);
    }, 0);

    /* ----------------------------
       Refunds
    ----------------------------- */

    const refunds = (order.order_payment_adjustments || [])
      .filter((adjustment) =>
        ["refund", "partial_refund"].includes(adjustment.adjustment_type),
      )
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // Source of truth
    const refundedAmount = Number(order.refunded_amount || 0);

    const refundableBalance = totalPaid - refundedAmount;

    const netReceived = totalPaid - refundedAmount;

    const totalAmount = Number(order.total_amount || 0);

    const balanceDue = Math.max(totalAmount - totalPaid, 0);

    /* ----------------------------
       Timeline
    ----------------------------- */

    const timeline = [
      {
        type: "order_created",
        created_at: order.created_at,
      },

      ...paymentHistory.map((tx) => ({
        type: "payment",
        amount: tx.amount,
        payment_method: tx.payment_method,
        payment_type: tx.payment_type,
        provider: tx.provider,
        reference: tx.provider_reference,
        created_at: tx.verified_at || tx.created_at,
      })),

      ...refunds.map((refund) => ({
        type: "refund",
        amount: refund.amount,
        reason: refund.reason,
        created_at: refund.created_at,
      })),
    ].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return {
      ...order,

      payment_plan: paymentPlan,

      paymentHistory,

      refunds,

      timeline,

      financialSummary: {
        totalAmount: Number(order.total_amount || 0),
        totalPaid,
        balanceDue,
        refundedAmount,
        refundableBalance,
        netReceived,
      },
    };
  });

  return NextResponse.json(enriched);
}
