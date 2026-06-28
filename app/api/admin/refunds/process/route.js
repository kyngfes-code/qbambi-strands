import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { refundId, refundMethod, adminNote } = await request.json();

    if (!refundId) {
      return NextResponse.json(
        { error: "Refund ID is required." },
        { status: 400 },
      );
    }

    if (!refundMethod) {
      return NextResponse.json(
        { error: "Refund method is required." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    /*
    ==========================================
    Load Refund Request
    ==========================================
    */

    const { data: refundRequest, error: refundError } = await supabase
      .from("appointment_payment_adjustments")
      .select("*")
      .eq("id", refundId)
      .eq("adjustment_type", "refund_pending")
      .single();

    if (refundError || !refundRequest) {
      return NextResponse.json(
        { error: "Refund request not found." },
        { status: 404 },
      );
    }

    if (refundRequest.refund_status !== "pending") {
      return NextResponse.json(
        {
          error: "This refund request has already been processed.",
        },
        { status: 409 },
      );
    }

    /*
    ==========================================
    Load Appointment
    ==========================================
    */

    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select(
        `
          id,
          service_amount,
          amount_paid,
          refunded_amount,
          balance_due,
          payment_completion_status
        `,
      )
      .eq("id", refundRequest.appointment_id)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: "Appointment not found." },
        { status: 404 },
      );
    }

    const refundAmount = Number(refundRequest.amount);

    if (refundAmount > Number(appointment.amount_paid || 0)) {
      return NextResponse.json(
        {
          error: "Refund exceeds the amount currently paid.",
        },
        { status: 400 },
      );
    }

    /*
    ==========================================
    Calculate New Totals
    ==========================================
    */

    const currentRefunded = Number(appointment.refunded_amount || 0);

    const newRefundedAmount = currentRefunded + refundAmount;

    /*
    ==========================================
    Create Refund Adjustment
    ==========================================
    */

    const { error: insertRefundError } = await supabase
      .from("appointment_payment_adjustments")
      .insert({
        appointment_id: refundRequest.appointment_id,

        adjustment_type: "refund",

        amount: refundAmount,

        reason: refundRequest.reason,

        refund_note: adminNote || refundRequest.refund_note || null,

        refund_method: refundMethod,

        refund_status: "completed",

        refunded_at: new Date().toISOString(),

        refund_processed_by: session.user.id,

        impact_direction: "decrease",

        affects_balance: false,

        recorded_by: session.user.id,

        approved_by: session.user.id,
        approved_at: new Date().toISOString(),

        // created_by: session.user.id,
      });

    if (insertRefundError) {
      console.error(insertRefundError);

      return NextResponse.json(
        { error: "Failed to create refund record." },
        { status: 500 },
      );
    }

    /*
    ==========================================
    Mark Request Completed
    ==========================================
    */

    const { error: requestUpdateError } = await supabase
      .from("appointment_payment_adjustments")
      .update({
        refund_status: "completed",

        refund_method: refundMethod,

        refund_note: adminNote || refundRequest.refund_note || null,

        refunded_at: new Date().toISOString(),

        refund_processed_by: session.user.id,

        approved_by: session.user.id,

        approved_at: new Date().toISOString(),
      })
      .eq("id", refundId);

    if (requestUpdateError) {
      console.error(requestUpdateError);

      return NextResponse.json(
        { error: "Failed to update refund request." },
        { status: 500 },
      );
    }

    /*
    ==========================================
    Update Appointment Totals
    ==========================================
    */

    const { error: appointmentUpdateError } = await supabase
      .from("appointments")
      .update({
        refunded_amount: newRefundedAmount,
      })
      .eq("id", appointment.id);

    if (appointmentUpdateError) {
      console.error(appointmentUpdateError);

      return NextResponse.json(
        { error: "Failed to update appointment." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      refundAmount,
      amountPaid: appointment.amount_paid,
      refundedAmount: newRefundedAmount,
      netProceeds: Number(appointment.amount_paid || 0) - newRefundedAmount,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
