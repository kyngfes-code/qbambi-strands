import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request) {
  try {
    /*
    ==========================================
    Authenticate
    ==========================================
    */

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    /*
    ==========================================
    Request Body
    ==========================================
    */

    const {
      refundRequestId,
      refundMethod,
      refundReference = null,
      adminNote = null,
    } = await request.json();

    if (!refundRequestId) {
      return NextResponse.json(
        { error: "Refund request is required." },
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

    const { data: refundRequest, error: refundRequestError } = await supabase
      .from("appointment_refund_requests")
      .select("*")
      .eq("id", refundRequestId)
      .single();

    if (refundRequestError || !refundRequest) {
      return NextResponse.json(
        { error: "Refund request not found." },
        { status: 404 },
      );
    }

    if (refundRequest.status !== "pending") {
      return NextResponse.json(
        {
          error: "This refund request has already been processed.",
        },
        {
          status: 409,
        },
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
        amount_paid,
        refunded_amount,
        balance_due,
        service_amount
      `,
      )
      .eq("id", refundRequest.appointment_id)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        {
          error: "Appointment not found.",
        },
        {
          status: 404,
        },
      );
    }

    const refundAmount = Number(refundRequest.requested_amount);

    const alreadyRefunded = Number(appointment.refunded_amount || 0);

    const amountPaid = Number(appointment.amount_paid || 0);

    const refundableBalance = amountPaid - alreadyRefunded;

    if (refundAmount > refundableBalance) {
      return NextResponse.json(
        {
          error: "Refund exceeds the customer's refundable balance.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    ==========================================
    Create Financial Ledger Entry
    ==========================================
    */

    const { data: adjustment, error: adjustmentError } = await supabase
      .from("appointment_payment_adjustments")
      .insert({
        appointment_id: appointment.id,

        adjustment_type: "refund",

        amount: refundAmount,

        impact_direction: "decrease",

        affects_balance: false,

        reason: refundRequest.reason,

        refund_note: adminNote,

        refund_method: refundMethod,

        refund_reference: refundReference,

        refund_status: "completed",

        refunded_at: new Date().toISOString(),

        refund_processed_by: session.user.id,

        recorded_by: session.user.id,

        approved_by: session.user.id,

        approved_at: new Date().toISOString(),

        source: "customer_refund_request",
      })
      .select()
      .single();

    if (adjustmentError) {
      console.error(adjustmentError);

      return NextResponse.json(
        {
          error: adjustmentError.message,
        },
        {
          status: 500,
        },
      );
    }

    /*
    ==========================================
    Update Appointment
    ==========================================
    */

    const newRefundedAmount = alreadyRefunded + refundAmount;

    const { error: appointmentUpdateError } = await supabase
      .from("appointments")
      .update({
        refunded_amount: newRefundedAmount,
      })
      .eq("id", appointment.id);

    if (appointmentUpdateError) {
      console.error(appointmentUpdateError);

      return NextResponse.json(
        {
          error: appointmentUpdateError.message,
        },
        {
          status: 500,
        },
      );
    }

    /*
    ==========================================
    Complete Refund Request
    ==========================================
    */

    const { error: requestUpdateError } = await supabase
      .from("appointment_refund_requests")
      .update({
        status: "approved",

        approved_amount: refundAmount,

        admin_note: adminNote,

        refund_method: refundMethod,

        refund_reference: refundReference,

        processed_by: session.user.id,

        processed_at: new Date().toISOString(),

        processed_adjustment_id: adjustment.id,
      })
      .eq("id", refundRequest.id);

    if (requestUpdateError) {
      console.error(requestUpdateError);

      return NextResponse.json(
        {
          error: requestUpdateError.message,
        },
        {
          status: 500,
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
      message: "Refund processed successfully.",
      refundAdjustment: adjustment,
      refundedAmount: newRefundedAmount,
      netReceived: amountPaid - newRefundedAmount,
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
