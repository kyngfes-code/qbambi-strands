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
      reason,
      adminNote = null,
      customerMessage = null,
    } = await req.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required." },
        { status: 400 },
      );
    }

    if (!reason?.trim()) {
      return NextResponse.json(
        { error: "Cancellation reason is required." },
        { status: 400 },
      );
    }

    /*
    ==========================================
    Execute RPC
    ==========================================
    */
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase.rpc("cancel_appointment", {
      p_appointment_id: appointmentId,
      p_cancelled_by: session.user.id,
      p_reason: reason,
      p_admin_note: adminNote,
      p_customer_message: customerMessage,
    });

    if (error) {
      console.error("cancel_appointment:", error);

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    /*
    ==========================================
    Success
    ==========================================
    */
    return NextResponse.json({
      success: true,
      message: "Appointment cancelled successfully.",
      ...data,
    });
  } catch (err) {
    console.error("Cancel appointment:", err);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
