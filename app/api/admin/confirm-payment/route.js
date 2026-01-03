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

    const { orderId } = body;
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();

    /* 3️⃣ Fetch order */
    console.log("➡️ Fetching order:", orderId);
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, status, payment_plan_id")
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
        { status: 400 }
      );
    }

    if (order.status !== "awaiting_confirmation") {
      console.log("⛔ Invalid order status:", order.status);
      return NextResponse.json(
        { error: "Order not awaiting confirmation" },
        { status: 400 }
      );
    }

    /* 4️⃣ Update order */
    console.log("➡️ Confirming order...");
    const { data: updated, error: updateErr } = await supabase
      .from("orders")
      .update({
        status: "paid",
        confirmed_at: new Date().toISOString(),
        confirmed_by: session.user.id,
      })
      .eq("id", orderId)
      .select()
      .single();

    console.log("UPDATED ORDER:", updated);
    console.log("UPDATE ERROR:", updateErr);

    if (updateErr || !updated) {
      console.log("⛔ Failed to confirm order");
      return NextResponse.json(
        { error: "Failed to confirm order" },
        { status: 500 }
      );
    }

    /* 5️⃣ Mark notification read */
    console.log("➡️ Marking admin notification as read...");
    await supabase
      .from("admin_notifications")
      .update({ is_read: true })
      .eq("order_id", orderId)
      .eq("type", "receipt_uploaded");

    console.log("✅ Order confirmed successfully");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("🔥 Confirm payment error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
