import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req) {
  try {
    /*
    ==========================================
    Authenticate Admin
    ==========================================
    */

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /*
    ==========================================
    Parse Body
    ==========================================
    */

    const {
      appointmentId,
      requestedAmount,
      reason,
      customerMessage = null,
      adminNote = null,
    } = await req.json();

    if (!appointmentId) {
      return NextResponse.json(
        {
          error: "Appointment ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!requestedAmount || Number(requestedAmount) <= 0) {
      return NextResponse.json(
        {
          error: "Refund amount must be greater than zero.",
        },
        {
          status: 400,
        },
      );
    }

    if (!reason?.trim()) {
      return NextResponse.json(
        {
          error: "Refund reason is required.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    ==========================================
    Execute RPC
    ==========================================
    */

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase.rpc(
      "admin_create_appointment_refund_request",
      {
        p_appointment_id: appointmentId,
        p_requested_by: session.user.id,
        p_requested_amount: requestedAmount,
        p_reason: reason.trim(),
        p_customer_message: customerMessage?.trim() || null,
        p_admin_note: adminNote?.trim() || null,
      },
    );

    if (error) {
      console.error(error);

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 400,
        },
      );
    }

    /*
    ==========================================
    Success
    ==========================================
    */

    return NextResponse.json({
      success: true,
      message: "Refund request created successfully.",
      ...data,
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
