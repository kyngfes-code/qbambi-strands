import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, requestedAmount, reason, customerMessage } =
      await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order is required." },
        { status: 400 },
      );
    }

    const amount = Number(requestedAmount);

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid refund amount." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    /*
    =====================================
    Verify Order
    =====================================
    */

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
        id,
        user_id,
        status,
        total_amount,
        refunded_amount
      `,
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    /*
    =====================================
    Order must be paid or delivered
    =====================================
    */

    if (!["paid", "delivered"].includes(order.status)) {
      return NextResponse.json(
        {
          error: "This order cannot be refunded.",
        },
        { status: 400 },
      );
    }

    const { data: payments, error: paymentsError } = await supabase
      .from("payment_history")
      .select("amount")
      .eq("order_id", orderId)
      .eq("status", "confirmed");

    if (paymentsError) {
      return NextResponse.json(
        { error: paymentsError.message },
        { status: 500 },
      );
    }

    /*
    =====================================
    Calculate refundable balance
    =====================================
    */

    const totalPaid = payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    const refundedAmount = Number(order.refunded_amount || 0);

    const refundableBalance = totalPaid - refundedAmount;

    if (amount > refundableBalance) {
      return NextResponse.json(
        {
          error: `Maximum refundable amount is ₦${refundableBalance.toLocaleString()}.`,
        },
        { status: 400 },
      );
    }

    /*
    =====================================
    Prevent duplicate pending request
    =====================================
    */

    const { data: existingRequest } = await supabase
      .from("order_refund_requests")
      .select("id")
      .eq("order_id", orderId)
      .eq("status", "pending")
      .maybeSingle();

    if (existingRequest) {
      return NextResponse.json(
        {
          error: "A refund request is already under review.",
        },
        { status: 409 },
      );
    }

    /*
    =====================================
    Create Request
    =====================================
    */

    const { error: insertError } = await supabase
      .from("order_refund_requests")
      .insert({
        order_id: orderId,
        requested_by: session.user.id,
        requested_amount: amount,
        reason,
        customer_message: customerMessage,
      });

    if (insertError) {
      return NextResponse.json(
        {
          error: insertError.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Refund request submitted successfully.",
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Internal server error.",
      },
      { status: 500 },
    );
  }
}
