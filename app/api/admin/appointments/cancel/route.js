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
    const { appointmentId, cancellationReason, customerMessage, adminNote } =
      await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 },
      );
    }

    if (!cancellationReason) {
      return NextResponse.json(
        { error: "Cancellation reason is required" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    /*
    ─────────────────────────────────────────────
    Ensure Appointment Exists
    ─────────────────────────────────────────────
    */
    const { data: appointment, error: fetchError } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .single();

    if (fetchError || !appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );
    }

    /*
    ─────────────────────────────────────────────
    Prevent Duplicate Cancellation
    ─────────────────────────────────────────────
    */
    if (appointment.status === "cancelled") {
      return NextResponse.json(
        { error: "Appointment is already cancelled" },
        { status: 400 },
      );
    }

    /*
    ─────────────────────────────────────────────
    Cancel Appointment
    ─────────────────────────────────────────────
    */
    const { data, error } = await supabase
      .from("appointments")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancelled_by: session.user.id,
        cancellation_reason: cancellationReason,
        cancellation_customer_message: customerMessage || null,
        cancellation_admin_note: adminNote || null,
      })
      .eq("id", appointmentId)
      .select(
        `
        *,
        customer:users!appointments_user_id_fkey (
          id,
          name,
          email
        )
      `,
      )
      .single();

    if (error) {
      console.error("Appointment cancellation error:", error);

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    /*
    ─────────────────────────────────────────────
    Success Response
    ─────────────────────────────────────────────
    */
    return NextResponse.json({
      message: "Appointment cancelled successfully",
      appointment: data,
    });
  } catch (error) {
    console.error("POST /api/admin/appointments/cancel:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
