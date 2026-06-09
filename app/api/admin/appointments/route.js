import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    /*
    ──────────────────────────────────────────────
    Verify user is authenticated and is an admin
    ──────────────────────────────────────────────
    */
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /*
    ──────────────────────────────────────────────
    Use Supabase Admin Client
    ──────────────────────────────────────────────
    */
    const supabase = createSupabaseAdmin();

    /*
    ──────────────────────────────────────────────
    Fetch appointments with related data
    ──────────────────────────────────────────────
    */
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
        confirmer:users!appointments_confirmed_by_fkey (
          id,
          name
        ),
        canceller:users!appointments_cancelled_by_fkey (
          id,
          name
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
        )
      `,
      )
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    if (error) {
      console.error("Appointments fetch error:", error);

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    /*
    ──────────────────────────────────────────────
    Group appointments by status
    ──────────────────────────────────────────────
    */
    const pending = data.filter(
      (appointment) => appointment.status === "pending",
    );

    const confirmed = data.filter(
      (appointment) => appointment.status === "confirmed",
    );

    const completed = data.filter(
      (appointment) => appointment.status === "completed",
    );

    const cancelled = data.filter(
      (appointment) => appointment.status === "cancelled",
    );

    /*
    ──────────────────────────────────────────────
    Return dashboard payload
    ──────────────────────────────────────────────
    */
    return NextResponse.json({
      pending,
      confirmed,
      completed,
      cancelled,
    });
  } catch (error) {
    console.error("Admin appointments GET error:", error);

    return NextResponse.json(
      { error: "Failed to load appointments" },
      { status: 500 },
    );
  }
}
