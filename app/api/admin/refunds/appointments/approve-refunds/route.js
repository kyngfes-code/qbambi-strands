import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req) {
  try {
    /*
    ----------------------------------------
    Authentication
    ----------------------------------------
    */
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /*
    ----------------------------------------
    Request Body
    ----------------------------------------
    */
    const {
      refundRequestId,
      approvedAmount,
      refundMethod,
      refundReference = null,
      adminNote = null,
    } = await req.json();

    if (!refundRequestId) {
      return NextResponse.json(
        { error: "Refund request ID is required." },
        { status: 400 },
      );
    }

    if (!approvedAmount || Number(approvedAmount) <= 0) {
      return NextResponse.json(
        { error: "Approved amount must be greater than zero." },
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
    ----------------------------------------
    RPC
    ----------------------------------------
    */
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase.rpc("approve_appointment_refund", {
      p_refund_request_id: refundRequestId,
      p_processed_by: session.user.id,
      p_approved_amount: approvedAmount,
      p_refund_method: refundMethod,
      p_refund_reference: refundReference,
      p_admin_note: adminNote,
    });

    if (error) {
      console.error(error);

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    /*
    ----------------------------------------
    Success
    ----------------------------------------
    */
    return NextResponse.json({
      success: true,
      message: "Refund approved successfully.",
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
