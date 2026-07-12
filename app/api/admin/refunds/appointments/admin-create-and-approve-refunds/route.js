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
    Parse Request
    ==========================================
    */
    const {
      appointmentId,
      requestedAmount,
      approvedAmount,
      reason,
      customerMessage = null,
      refundMethod,
      refundReference = null,
      adminNote = null,
    } = await req.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required." },
        { status: 400 },
      );
    }

    if (!requestedAmount || Number(requestedAmount) <= 0) {
      return NextResponse.json(
        { error: "Requested amount must be greater than zero." },
        { status: 400 },
      );
    }

    if (!approvedAmount || Number(approvedAmount) <= 0) {
      return NextResponse.json(
        { error: "Approved amount must be greater than zero." },
        { status: 400 },
      );
    }

    if (Number(approvedAmount) > Number(requestedAmount)) {
      return NextResponse.json(
        {
          error: "Approved amount cannot exceed the requested amount.",
        },
        { status: 400 },
      );
    }

    if (!reason?.trim()) {
      return NextResponse.json(
        { error: "Refund reason is required." },
        { status: 400 },
      );
    }

    if (!refundMethod) {
      return NextResponse.json(
        { error: "Refund method is required." },
        { status: 400 },
      );
    }

    /*
    ==========================================
    Execute RPC
    ==========================================
    */
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase.rpc(
      "admin_create_and_approve_appointment_refund",
      {
        p_appointment_id: appointmentId,
        p_requested_by: session.user.id,
        p_processed_by: session.user.id,
        p_requested_amount: requestedAmount,
        p_approved_amount: approvedAmount,
        p_reason: reason.trim(),
        p_customer_message: customerMessage?.trim() || null,
        p_refund_method: refundMethod,
        p_refund_reference: refundReference?.trim() || null,
        p_admin_note: adminNote?.trim() || null,
      },
    );

    if (error) {
      console.error("admin_create_and_approve_appointment_refund:", error);

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    /*
    ==========================================
    Success
    ==========================================
    */
    return NextResponse.json({
      success: true,
      message: "Refund processed successfully.",
      ...data,
    });
  } catch (err) {
    console.error("Admin appointment refund:", err);

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
