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

    const { paymentId, rejectionReason, customerMessage } = await req.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID is required." },
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
    ==========================================
    Execute RPC
    ==========================================
    */

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase.rpc("reject_appointment_deposit", {
      p_payment_id: paymentId,
      p_rejected_by: session.user.id,
      p_rejection_reason: rejectionReason.trim(),
      p_customer_message: customerMessage?.trim() || null,
    });

    if (error) {
      console.error("reject_appointment_deposit:", error);

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    /*
    ==========================================
    Success
    ==========================================
    */

    return NextResponse.json({
      success: true,
      message: "Deposit payment rejected successfully.",
      ...data,
    });
  } catch (err) {
    console.error("Reject appointment deposit:", err);

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
