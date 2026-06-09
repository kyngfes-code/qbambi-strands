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
    const { appointmentId, servicePrice, adminNotes } = await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 },
      );
    }

    /*
    ─────────────────────────────────────────────
    Prevent Invalid Prices
    ─────────────────────────────────────────────
    */
    if (
      servicePrice !== undefined &&
      servicePrice !== null &&
      Number(servicePrice) < 0
    ) {
      return NextResponse.json(
        { error: "Invalid service price" },
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
    Only Pending Appointments
    Can Be Confirmed
    ─────────────────────────────────────────────
    */
    if (appointment.status !== "pending") {
      return NextResponse.json(
        {
          error: "Only pending appointments can be confirmed",
        },
        { status: 400 },
      );
    }

    /*
    ─────────────────────────────────────────────
    Confirm Appointment
    ─────────────────────────────────────────────
    */
    const { data, error } = await supabase
      .from("appointments")
      .update({
        status: "confirmed",
        service_price: servicePrice ?? appointment.service_price,
        admin_notes: adminNotes ?? appointment.admin_notes,
        confirmed_by: session.user.id,
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", appointmentId)
      .select(
        `
        *,
        customer:users!appointments_user_id_fkey(
          id,
          name,
          email
        )
      `,
      )
      .single();

    if (error) {
      console.error("Confirmation error:", error);

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    /*
    ─────────────────────────────────────────────
    Success Response
    ─────────────────────────────────────────────
    */
    return NextResponse.json({
      message: "Appointment confirmed successfully",
      appointment: data,
    });
  } catch (error) {
    console.error("POST /api/admin/appointments/confirm:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
