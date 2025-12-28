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
    .select("store_id, quantity, store(price)");

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

  await supabase.from("carts").delete();

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
      payment_plans (
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
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Compute next instalment
  const enriched = data.map((order) => {
    if (!order.payment_plans?.length) return order;

    const plan = order.payment_plans[0];
    const next = plan.instalments
      .filter((i) => !i.paid)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];

    return {
      ...order,
      payment_plan: {
        id: plan.id,
        status: plan.status,
        next_instalment_id: next?.id ?? null,
        next_instalment_amount: next?.amount ?? null,
      },
    };
  });

  return NextResponse.json(enriched);
}
