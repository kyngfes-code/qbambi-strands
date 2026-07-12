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
      rejectionReason,
      adminNote = null,
    } = await req.json();

    if (!refundRequestId) {
      return NextResponse.json(
        { error: "Refund request ID is required." },
        { status: 400 },
      );
    }

    if (!rejectionReason?.trim()) {
      return NextResponse.json(
        { error: "Rejection reason is required." },
        { status: 400 },
      );
    }

    /*
    ----------------------------------------
    Call RPC
    ----------------------------------------
    */
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase.rpc("reject_appointment_refund", {
      p_refund_request_id: refundRequestId,
      p_processed_by: session.user.id,
      p_rejection_reason: rejectionReason.trim(),
      p_admin_note: adminNote,
    });

    if (error) {
      console.error("reject_appointment_refund:", error);

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    /*
    ----------------------------------------
    Success
    ----------------------------------------
    */
    return NextResponse.json({
      success: true,
      message: "Refund request rejected successfully.",
      ...data,
    });
  } catch (err) {
    console.error("Reject appointment refund:", err);

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
