import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { auth } from "@/lib/auth";

export async function POST(req) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await req.json();
  const supabase = createSupabaseAdmin();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: session.user.email,
      amount: order.total_amount * 100,
      reference: `order_${order.id}`,
    }),
  });

  const data = await res.json();

  // Save payment reference
  await supabase
    .from("orders")
    .update({ payment_ref: data.data.reference })
    .eq("id", order.id);

  return NextResponse.json(data);
}
