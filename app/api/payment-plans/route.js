import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId, months } = await req.json();

  if (!orderId || !months) {
    return NextResponse.json(
      { error: "Missing orderId or months" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdmin();

  // 1️⃣ Fetch order
  const { data: order } = await supabase
    .from("orders")
    .select("id, total_amount")
    .eq("id", orderId)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // 2️⃣ Create payment plan
  const { data: plan } = await supabase
    .from("payment_plans")
    .insert({
      order_id: order.id,
      user_id: session.user.id,
      total_amount: order.total_amount,
      instalments_count: months,
      status: "active",
    })
    .select()
    .single();

  // 3️⃣ Create instalments
  const amountPerInstalment = order.total_amount / months;
  const start = new Date();

  const instalments = Array.from({ length: months }).map((_, i) => {
    const due = new Date(start);
    due.setMonth(due.getMonth() + i + 1);

    return {
      payment_plan_id: plan.id,
      due_date: due.toISOString().split("T")[0],
      amount: amountPerInstalment,
    };
  });

  await supabase.from("instalments").insert(instalments);

  // 4️⃣ Update order status
  await supabase
    .from("orders")
    .update({ status: "payment_plan_active" })
    .eq("id", orderId);

  return NextResponse.json(plan);
}
