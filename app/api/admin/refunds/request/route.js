import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { appointmentId, refundAmount, refundReason, adminNote } =
      await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment is required." },
        { status: 400 },
      );
    }

    if (!refundAmount || Number(refundAmount) <= 0) {
      return NextResponse.json(
        { error: "Invalid refund amount." },
        { status: 400 },
      );
    }

    if (!refundReason?.trim()) {
      return NextResponse.json(
        { error: "Refund reason is required." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    /*
    ==========================================
    Get Appointment
    ==========================================
    */

    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select(
        `
        id,
        amount_paid,
        service_amount
      `,
      )
      .eq("id", appointmentId)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: "Appointment not found." },
        { status: 404 },
      );
    }

    /*
    ==========================================
    Calculate Maximum Refundable
    ==========================================
    */

    const { data: completedRefunds } = await supabase
      .from("appointment_payment_adjustments")
      .select("amount")
      .eq("appointment_id", appointmentId)
      .eq("adjustment_type", "refund")
      .eq("refund_status", "completed");

    const alreadyRefunded =
      completedRefunds?.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0,
      ) || 0;

    const refundableBalance =
      Number(appointment.amount_paid || 0) - alreadyRefunded;

    if (Number(refundAmount) > refundableBalance) {
      return NextResponse.json(
        {
          error: `Maximum refundable amount is ₦${refundableBalance.toLocaleString()}.`,
        },
        { status: 400 },
      );
    }

    /*
    ==========================================
    Prevent Duplicate Pending Refunds
    ==========================================
    */

    const { data: pendingRefunds } = await supabase
      .from("appointment_payment_adjustments")
      .select("id")
      .eq("appointment_id", appointmentId)
      .eq("adjustment_type", "refund_pending")
      .in("refund_status", ["pending", "processing"]);

    if (pendingRefunds?.length) {
      return NextResponse.json(
        {
          error:
            "This appointment already has a refund request awaiting processing.",
        },
        { status: 409 },
      );
    }

    /*
    ==========================================
    Create Refund Request
    ==========================================
    */

    const { error: insertError } = await supabase
      .from("appointment_payment_adjustments")
      .insert({
        appointment_id: appointmentId,

        adjustment_type: "refund_pending",

        amount: refundAmount,

        reason: refundReason,

        refund_note: adminNote || null,

        refund_status: "pending",

        impact_direction: "decrease",

        affects_balance: false,

        recorded_by: session.user.id,
      });

    if (insertError) {
      console.error(insertError);

      return NextResponse.json(
        { error: "Failed to create refund request." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Refund request created successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
