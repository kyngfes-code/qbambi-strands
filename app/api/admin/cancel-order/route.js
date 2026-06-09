import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { orderId, reason, message, adminNote } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 },
      );
    }

    if (!reason) {
      return NextResponse.json(
        { error: "Cancellation reason is required" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    // Verify order exists
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id,status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "cancelled") {
      return NextResponse.json(
        { error: "Order already cancelled" },
        { status: 400 },
      );
    }

    if (order.status === "delivered") {
      return NextResponse.json(
        { error: "Delivered orders cannot be cancelled" },
        { status: 400 },
      );
    }

    // Create cancellation record
    const { data: cancellation, error: cancellationError } = await supabase
      .from("order_cancellations")
      .insert({
        order_id: orderId,
        cancellation_reason: reason,
        customer_message: message,
        admin_note: adminNote,
        cancelled_by: session.user.id,
      })
      .select()
      .single();

    if (cancellationError) {
      console.error(cancellationError);

      return NextResponse.json(
        {
          error: "Failed to create cancellation record",
          details: cancellationError,
        },
        { status: 500 },
      );
    }

    // Update order
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "cancelled",
        cancellation_id: cancellation.id,
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      console.error(updateError);

      return NextResponse.json(
        {
          error: "Failed to update order",
          details: updateError,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      cancellation,
    });
  } catch (error) {
    console.error("Cancel order error:", error);

    return NextResponse.json(
      {
        error: error.message || "Internal server error",
      },
      { status: 500 },
    );
  }
}
