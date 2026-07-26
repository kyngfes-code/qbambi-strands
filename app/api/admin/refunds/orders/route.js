import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseAdmin();

    const refundSelect = `
  *,
  requester:users!order_refund_requests_requested_by_fkey(
    id,
    name,
    email
  ),
  processor:users!order_refund_requests_processed_by_fkey(
    id,
    name,
    email
  ),
  adjustment:order_payment_adjustments!order_refund_requests_processed_adjustment_id_fkey(
    id,
    refund_method,
    refund_reference,
    adjustment_type,
    amount
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
`;
    /*
    =====================================
    Pending Refund Requests
    =====================================
    */

    const { data: pendingRefunds, error: pendingError } = await supabase
      .from("order_refund_requests")
      .select(refundSelect)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (pendingError) {
      console.error(pendingError);

      return NextResponse.json(
        { error: pendingError.message },
        { status: 500 },
      );
    }

    /*
    =====================================
    Completed Refund Requests
    =====================================
    */

    const { data: completedRefunds, error: completedError } = await supabase
      .from("order_refund_requests")
      .select(
        `
    *,
    requester:users!order_refund_requests_requested_by_fkey(
      id,
      name,
      email
    ),
    processor:users!order_refund_requests_processed_by_fkey(
      id,
      name,
      email
    ),
    order:orders(
      id,
      user:users!orders_user_id_fkey(
        id,
        name,
        email
      )
    ),
    adjustment:order_payment_adjustments(
      refund_method,
      refund_reference
    )
  `,
      )
      .in("status", ["approved", "rejected"])
      .order("created_at", { ascending: false });

    if (completedError) {
      console.error(completedError);

      return NextResponse.json(
        { error: completedError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      pendingRefunds: pendingRefunds ?? [],
      completedRefunds: completedRefunds ?? [],
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Internal server error.",
      },
      {
        status: 500,
      },
    );
  }
}
