import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    /*
    ===========================================
    Authenticate
    ===========================================
    */

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseAdmin();

    /*
    ===========================================
    Pending Refund Requests
    ===========================================
    */

    const { data: pendingRefunds, error: pendingError } = await supabase
      .from("appointment_refund_requests")
      .select(
        `
        *,
        requester:users!appointment_refund_requests_requested_by_fkey(
          id,
          name,
          email
        ),
        processor:users!appointment_refund_requests_processed_by_fkey(
          id,
          name,
          email
        ),
        appointment:appointments(
          id,
          service_name,
          appointment_date,
          appointment_time,
          service_amount,
          amount_paid,
          refunded_amount,
          balance_due,
          payment_completion_status,
          status,
          created_at,
          user:users!appointments_user_id_fkey(
            id,
            name,
            email
          )
        )
      `,
      )
      .eq("status", "pending")
      .order("created_at", {
        ascending: false,
      });

    if (pendingError) {
      return NextResponse.json(
        { error: pendingError.message },
        { status: 500 },
      );
    }

    /*
    ===========================================
    Completed Refund Ledger
    ===========================================
    */

    const { data: completedRefunds, error: completedError } = await supabase
      .from("appointment_refund_requests")
      .select(
        `
    *,
    requester:users!appointment_refund_requests_requested_by_fkey(
      id,
      name,
      email
    ),
    processor:users!appointment_refund_requests_processed_by_fkey(
      id,
      name,
      email
    ),
    appointment:appointments(
      id,
      service_name,
      appointment_date,
      appointment_time,
      service_amount,
      amount_paid,
      refunded_amount,
      balance_due,
      payment_completion_status,
      status,
      created_at,
      user:users!appointments_user_id_fkey(
        id,
        name,
        email
      )
    )
  `,
      )
      .not("status", "eq", "pending")
      .order("processed_at", {
        ascending: false,
      });

    if (completedError) {
      return NextResponse.json(
        { error: completedError.message },
        { status: 500 },
      );
    }

    /*
    ===========================================
    Response
    ===========================================
    */

    return NextResponse.json({
      pendingRefundRequests: pendingRefunds,
      completedRefunds,
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
