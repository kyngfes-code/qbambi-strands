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
    0
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
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { error: error.message, details: error },
      { status: 400 }
    );
  }

  //compute next instalments
  const enriched = data.map((order) => {
    if (!order.payment_plan) return order;

    const plan = order.payment_plan;

    const next = plan.instalments
      ?.filter((i) => !i.paid)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];

    return {
      ...order,
      payment_plan: {
        id: plan.id,
        status: plan.status,
        outstanding_balance: plan.outstanding_balance ?? null,
        next_instalment_id: next?.id ?? null,
        next_instalment_amount: next?.amount ?? null,
        next_instalment_due_date: next?.due_date ?? null,
      },
    };
  });

  return NextResponse.json(enriched);
}
