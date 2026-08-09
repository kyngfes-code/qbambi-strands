import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { z } from "zod";

const appointmentSchema = z.object({
  service_name: z.string().trim().min(1),
  appointment_date: z.string(),
  appointment_time: z.string(),
  notes: z.string().optional().nullable(),
});

export async function POST(request) {
  try {
    //////////////////////////////////////////////////////
    // Authenticate
    //////////////////////////////////////////////////////

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    //////////////////////////////////////////////////////
    // Validate Input
    //////////////////////////////////////////////////////

    const body = await request.json();

    const parsed = appointmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid appointment details.",
        },
        {
          status: 400,
        },
      );
    }

    const { service_name, appointment_date, appointment_time, notes } =
      parsed.data;

    //////////////////////////////////////////////////////
    // Prevent booking in the past
    //////////////////////////////////////////////////////

    const selectedDateTime = new Date(
      `${appointment_date}T${appointment_time}`,
    );

    if (Number.isNaN(selectedDateTime.getTime())) {
      return NextResponse.json(
        {
          error: "Invalid appointment date or time.",
        },
        {
          status: 400,
        },
      );
    }

    if (selectedDateTime <= new Date()) {
      return NextResponse.json(
        {
          error: "Appointment cannot be booked in the past.",
        },
        {
          status: 400,
        },
      );
    }

    //////////////////////////////////////////////////////
    // Supabase
    //////////////////////////////////////////////////////

    const supabase = createSupabaseAdmin();

    //////////////////////////////////////////////////////
    // Optional:
    // Prevent multiple active appointments
    //////////////////////////////////////////////////////

    const { data: existingAppointment, error: existingError } = await supabase
      .from("appointments")
      .select("id")
      .eq("user_id", session.user.id)
      .in("status", ["pending", "pending_confirmation", "confirmed"])
      .limit(1)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingAppointment) {
      return NextResponse.json(
        {
          error: "You already have an active appointment request.",
        },
        {
          status: 409,
        },
      );
    }

    //////////////////////////////////////////////////////
    // Create Appointment
    //////////////////////////////////////////////////////

    const { data, error } = await supabase
      .from("appointments")
      .insert({
        user_id: session.user.id,
        service_name,
        appointment_date,
        appointment_time,
        notes: notes ?? null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    //////////////////////////////////////////////////////
    // Success
    //////////////////////////////////////////////////////

    return NextResponse.json(
      {
        success: true,
        message: "Appointment booked successfully. Awaiting confirmation.",
        appointment: data,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("POST /api/appointments", error);

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
