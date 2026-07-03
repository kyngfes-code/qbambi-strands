import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseAdmin();

    /*
    ==============================
    Pending Refund Requests
    ==============================
    */

    const { data: pendingRefunds, error: pendingError } = await supabase
      .from("order_refund_requests")
      .select(
        `
        *,
        requester:users!order_refund_requests_requested_by_fkey(
          id,
          name,
          email
        ),
        reviewer:users!order_refund_requests_reviewed_by_fkey(
          id,
          name,
          email
        ),
        order:orders(
          id,
          total_amount,
          refunded_amount,
          status,
          payment_method,
          created_at,
          user:users!orders_user_id_fkey(
            id,
            name,
            email
          )
        )
      `,
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (pendingError) {
      return NextResponse.json(
        { error: pendingError.message },
        { status: 500 },
      );
    }

    /*
    ==============================
    Completed Refunds
    ==============================
    */

    const { data: completedRefunds, error: completedError } = await supabase
      .from("order_payment_adjustments")
      .select(
        `
        *,
        creator:users!order_payment_adjustments_created_by_fkey(
          id,
          name,
          email
        ),
        order:orders(
          id,
          total_amount,
          refunded_amount,
          status,
          payment_method,
          created_at,
          user:users!orders_user_id_fkey(
            id,
            name,
            email
          )
        )
      `,
      )
      .in("adjustment_type", ["refund", "partial_refund"])
      .order("created_at", {
        ascending: false,
      });

    if (completedError) {
      return NextResponse.json(
        { error: completedError.message },
        { status: 500 },
      );
    }

    const normalizedCompletedRefunds = completedRefunds.map((refund) => ({
      ...refund,

      requested_amount: refund.amount,

      requester: refund.creator,

      status: "approved",

      customer_message: refund.reason,
    }));

    return NextResponse.json({
      pendingRefunds,
      completedRefunds: normalizedCompletedRefunds,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
