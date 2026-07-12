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

    const amount = Number(requestedAmount);

    if (!orderId) {
      return NextResponse.json(
        { error: "Order is required." },
        { status: 400 },
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid refund amount." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase.rpc(
      "validate_order_refund_request",
      {
        p_order_id: orderId,
        p_user_id: session.user.id,
        p_requested_amount: amount,
      },
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

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
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      refundableBalance: data[0].refundable_balance,
      totalPaid: data[0].total_paid,
      totalRefunded: data[0].total_refunded,
      message: "Refund request submitted successfully.",
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
