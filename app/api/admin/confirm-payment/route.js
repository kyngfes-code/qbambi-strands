import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { orderId } = await req.json();
  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();

  // 1️⃣ Mark order as paid
  const { error: orderError } = await supabase
    .from("orders")
    .update({
      status: "paid",
      confirmed_at: new Date().toISOString(),
      confirmed_by: session.user.id,
    })
    .eq("id", orderId)
    .eq("status", "awaiting_confirmation");

  if (orderError) {
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }

  // 2️⃣ Mark earliest unpaid instalment as paid
  const { data: instalment, error: instErr } = await supabase
    .from("instalments")
    .select("id")
    .eq("order_id", orderId)
    .eq("paid", false)
    .order("due_date", { ascending: true })
    .limit(1)
    .single();

  if (!instErr && instalment) {
    await supabase
      .from("instalments")
      .update({
        paid: true,
        paid_at: new Date().toISOString(),
        amount_paid: supabase.rpc ? undefined : undefined, // amount already known
      })
      .eq("id", instalment.id);
  }

  // 3️⃣ Mark admin notification as read
  await supabase
    .from("admin_notifications")
    .update({ is_read: true })
    .eq("order_id", orderId)
    .eq("type", "receipt_uploaded");

  return NextResponse.json({ success: true });
}
