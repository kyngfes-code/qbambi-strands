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
      completionType,
      totalAmountReceived = 0,
      paymentMethod = null,
      paymentChannel = null,
      transactionReference = null,
      receiptGroupId = null,
      refundAmount = 0,
      refundReason = null,
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

    if (!completionType) {
      return NextResponse.json(
        {
          error: "completion type is required.",
        },
        {
          status: 400,
        },
      );
    }

    const validTypes = ["normal", "additional_payment", "refund"];

    if (!validTypes.includes(completionType)) {
      return NextResponse.json(
        {
          error: "Invalid settlement type.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      completionType === "additional_payment" &&
      Number(totalAmountReceived) <= 0
    ) {
      return NextResponse.json(
        {
          error: "Payment received must be greater than zero.",
        },
        {
          status: 400,
        },
      );
    }

    if (completionType === "refund" && Number(refundAmount) <= 0) {
      return NextResponse.json(
        {
          error: "Refund amount must be greater than zero.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    ==========================================
    Call RPC
    ==========================================
    */

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase.rpc("complete_appointment", {
      p_appointment_id: appointmentId,

      p_completed_by: session.user.id,

      p_completion_type: completionType,

      p_total_amount_received: Number(totalAmountReceived),

      p_payment_method: paymentMethod,

      p_payment_channel: paymentChannel,

      p_transaction_reference: transactionReference,

      p_receipt_group_id: receiptGroupId,

      p_refund_amount: Number(refundAmount),

      p_refund_reason: refundReason,

      p_admin_note: adminNote,
    });

    if (error) {
      console.error("complete_appointment:", error);

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
      message: "Appointment completed successfully.",
      ...data,
    });
  } catch (err) {
    console.error("Complete appointment:", err);

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
