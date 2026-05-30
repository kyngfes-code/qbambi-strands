import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req) {
  try {
    /* 1️⃣ Auth check */
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* 2️⃣ Parse body */
    const body = await req.json();

    const { orderId, paymentMethod } = body;

    if (!["bank_transfer", "paystack"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 },
      );
    }

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();

    /* 3️⃣ Fetch order */
    console.log("➡️ Fetching order:", orderId);
    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `
    id,
    user_id,
    total_amount,
    receipt_url,
    status,
    payment_plan_id
  `,
      )
      .eq("id", orderId)
      .single();

    if (error) {
      console.error("Fetch order error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    /* 🚫 Block instalment orders */
    if (order.payment_plan_id) {
      console.log("⛔ Instalment order blocked");
      return NextResponse.json(
        { error: "Instalment orders must be confirmed per instalment." },
        { status: 400 },
      );
    }

    if (order.status !== "awaiting_confirmation") {
      console.log("⛔ Invalid order status:", order.status);
      return NextResponse.json(
        { error: "Order not awaiting confirmation" },
        { status: 400 },
      );
    }

    /* 4️⃣ Update order */

    const { data: updated, error: updateErr } = await supabase
      .from("orders")
      .update({
        status: "paid",
        payment_method: "bank_transfer",
        confirmed_at: new Date().toISOString(),
        confirmed_by: session.user.id,
      })
      .eq("id", orderId)
      .select()
      .single();

    if (updateErr || !updated) {
      console.log("⛔ Failed to confirm order");
      return NextResponse.json(
        { error: "Failed to confirm order" },
        { status: 500 },
      );
    }

    const { error: historyError } = await supabase
      .from("payment_history")
      .insert({
        user_id: updated.user_id, // customer
        order_id: updated.id,
        payment_plan_id: null,
        amount: updated.total_amount,
        payment_method: updated.payment_method,
        payment_type: "deposit",
        status: "confirmed",
        confirmed_by: session.user.id, // admin
        confirmed_at: new Date().toISOString(),
        note: "Full payment confirmed by admin",
      });

    if (historyError) {
      console.error("Payment history insert failed:", historyError);
    }

    /* 5️⃣ Mark notification read */

    await supabase
      .from("admin_notifications")
      .update({ is_read: true })
      .eq("order_id", orderId)
      .eq("type", "receipt_uploaded");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("🔥 Confirm payment error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
