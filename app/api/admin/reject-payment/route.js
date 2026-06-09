import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const { orderId, reason, message, adminNote } = body;
    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Customer message is required" },
        { status: 400 },
      );
    }

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    if (!reason) {
      return NextResponse.json(
        { error: "Missing rejection reason" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    /* 1️⃣ Fetch order */
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    /* 2️⃣ Record rejection */
    const { data: rejection, error: rejectionError } = await supabase
      .from("payment_rejections")
      .insert({
        order_id: order.id,
        user_id: order.user_id,
        rejected_by: session.user.id,
        rejection_reason: reason,
        customer_message: message,
        admin_note: adminNote || null,
      })
      .select()
      .single();

    if (rejectionError) {
      console.error(
        "Rejection insert error:",
        JSON.stringify(rejectionError, null, 2),
      );

      return NextResponse.json(
        {
          error: rejectionError.message,
          details: rejectionError,
        },
        { status: 500 },
      );
    }

    /* 3️⃣ Update order */
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "rejected",
        rejection_id: rejection.id,
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Order update error:", updateError);

      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 },
      );
    }

    /* 4️⃣ Mark notification read */
    const { error: notificationError } = await supabase
      .from("admin_notifications")
      .update({
        is_read: true,
      })
      .eq("order_id", orderId)
      .eq("type", "receipt_uploaded");

    if (notificationError) {
      console.error("Notification update error:", notificationError);
    }

    return NextResponse.json({
      success: true,
      rejection,
    });
  } catch (error) {
    console.error("Reject payment error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
