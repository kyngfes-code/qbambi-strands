import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request) {
  try {
    /*
    ─────────────────────────────────────────────
    Authenticate Admin
    ─────────────────────────────────────────────
    */
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /*
    ─────────────────────────────────────────────
    Parse Request Body
    ─────────────────────────────────────────────
    */
    const {
      appointmentId,
      completionType,
      amountReceivedToday,
      paymentMethod,
      adminNote,
      tipAmount,
      refundAmount,
      refundReason,
    } = await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase.rpc("complete_appointment", {
      p_appointment_id: appointmentId,
      p_completed_by: session.user.id,

      p_amount_received_today: Number(amountReceivedToday || 0),

      p_payment_method:
        paymentMethod && paymentMethod.trim() ? paymentMethod : null,

      p_tip_amount: Number(tipAmount || 0),

      p_refund_amount: Number(refundAmount || 0),

      p_refund_reason:
        refundReason && refundReason.trim() ? refundReason.trim() : null,
    });

    if (error) {
      console.error("complete_appointment RPC:", error);

      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 400 },
      );
    }

    /*
    ─────────────────────────────────────────────
    Success Response
    ─────────────────────────────────────────────
    */
    return NextResponse.json({
      success: true,
      message: "Appointment marked as completed.",
      appointment: data.appointment,

      offlinePayment: data.offline_payment,

      tipAdjustment: data.tip_adjustment,

      refundAdjustment: data.refund_adjustment,
    });
  } catch (error) {
    console.error("POST /api/admin/appointments/complete:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
