import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseWithAuth } from "@/lib/supabase";

/* =========================
   CREATE APPOINTMENT
========================= */
export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.id || !session?.supabaseAccessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const { service_name, appointment_date, appointment_time, notes } = body;

    /* Validation */
    if (!service_name) {
      return NextResponse.json(
        { error: "Service is required" },
        { status: 400 },
      );
    }

    if (!appointment_date) {
      return NextResponse.json(
        { error: "Appointment date is required" },
        { status: 400 },
      );
    }

    if (!appointment_time) {
      return NextResponse.json(
        { error: "Appointment time is required" },
        { status: 400 },
      );
    }

    /* Prevent booking in the past */
    const selectedDateTime = new Date(
      `${appointment_date}T${appointment_time}`,
    );

    if (selectedDateTime < new Date()) {
      return NextResponse.json(
        {
          error: "Appointment cannot be booked in the past",
        },
        { status: 400 },
      );
    }

    const supabase = supabaseWithAuth(session.supabaseAccessToken);

    const { data, error } = await supabase
      .from("appointments")
      .insert({
        user_id: session.user.id,
        service_name,
        appointment_date,
        appointment_time,
        notes: notes || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Create appointment error:", error);

      return NextResponse.json(
        {
          error: error.message,
          details: error,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        message: "Appointment booked successfully. Awaiting confirmation.",
        appointment: data,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/appointments error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}

/* =========================
   FETCH USER APPOINTMENTS
========================= */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id || !session?.supabaseAccessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = supabaseWithAuth(session.supabaseAccessToken);

    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
    *,
     user:users!appointments_user_id_fkey (
    id,
    name,
    email
  ),
    appointment_payments (
      id,
      amount,
      payment_method,
      receipt_url,
      status,
      rejection_reason,
      customer_message,
      confirmed_at,
      created_at
    ),
     appointment_offline_payments (
      id,
      amount,
      payment_method,
      created_at
    ),
  appointment_payment_adjustments (
  appointment_id,
  adjustment_type,
  amount,
  payment_method,
  refund_method,
  reason,
  created_at,
  recorder:users!appointment_payment_adjustments_recorded_by_fkey (
    name
  )
)
  `,
      )
      .eq("user_id", session.user.id)
      .order("appointment_date", {
        ascending: true,
      });

    if (error) {
      console.error("Fetch appointments error:", error);

      return NextResponse.json(
        {
          error: error.message,
          details: error,
        },
        { status: 400 },
      );
    }

    // const appointments = data.map((appointment) => ({
    //   ...appointment,

    //   appointment_payment_adjustments: (
    //     appointment.appointment_payment_adjustments || []
    //   ).filter((adjustment) =>
    //     ["refund", "overpayment_refund", "write_off"].includes(
    //       adjustment.adjustment_type,
    //     ),
    //   ),
    // }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/appointments error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
