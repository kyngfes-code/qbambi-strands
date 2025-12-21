import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { auth } from "@/lib/auth";

/* =========================
   CREATE ORDER (CHECKOUT)
========================= */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdmin();

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
    })
    .select()
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError }, { status: 400 });
  }

  const orderItems = cart.map((item) => ({
    order_id: order.id,
    store_id: item.store_id,
    quantity: item.quantity,
    price: item.store.price,
  }));

  await supabase.from("order_items").insert(orderItems);
  await supabase.from("carts").delete().eq("user_id", session.user.id);

  return NextResponse.json(order);
}

/* =========================
   FETCH USER ORDERS
========================= */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json(data);
}
