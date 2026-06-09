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
    const { appointmentId } = await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
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
    Only Confirmed Appointments
    Can Be Completed
    ─────────────────────────────────────────────
    */
    if (appointment.status !== "confirmed") {
      return NextResponse.json(
        {
          error: "Only confirmed appointments can be marked as completed",
        },
        { status: 400 },
      );
    }

    /*
    ─────────────────────────────────────────────
    Mark Appointment As Completed
    ─────────────────────────────────────────────
    */
    const { data, error } = await supabase
      .from("appointments")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        completed_by: session.user.id,
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
      console.error("Completion error:", error);

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    /*
    ─────────────────────────────────────────────
    Success Response
    ─────────────────────────────────────────────
    */
    return NextResponse.json({
      message: "Appointment marked as completed",
      appointment: data,
    });
  } catch (error) {
    console.error("POST /api/admin/appointments/complete:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
