import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    /*
    ──────────────────────────────────────────────
    Authenticate Admin
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
    Supabase
    ──────────────────────────────────────────────
    */

    const supabase = createSupabaseAdmin();

    /*
    ──────────────────────────────────────────────
    Fetch Appointments
    ──────────────────────────────────────────────
    */

    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        *,
        user:users!appointments_user_id_fkey(
          id,
          name,
          email
        ),

        confirmer:users!appointments_confirmed_by_fkey(
          id,
          name
        ),

        canceller:users!appointments_cancelled_by_fkey(
          id,
          name
        ),

        completer:users!appointments_completed_by_fkey(
          id,
          name
        ),

        appointment_payments(
          id,
          amount,
          payment_type,
          payment_method,
          payment_channel,
          receipt_url,
          status,
          rejection_reason,
          customer_message,
          confirmed_at,
          created_at
        ),

        appointment_payment_adjustments(
          id,
          adjustment_type,
          amount,
          tip_amount,
          impact_direction,
          payment_method,
          payment_channel,
          transaction_reference,
          source,
          reason,
          refund_method,
          refund_status,
          refund_reference,
          refund_note,
          refunded_at,
          affects_balance,
          created_at,

          recorder:users!appointment_payment_adjustments_recorded_by_fkey(
            id,
            name
          ),

          approver:users!appointment_payment_adjustments_approved_by_fkey(
            id,
            name
          ),

          refund_processor:users!appointment_payment_adjustments_refund_processed_by_fkey(
            id,
            name
          )
        ),

        appointment_pricing_history(
          id,
          old_service_amount,
          new_service_amount,
          old_deposit_required,
          new_deposit_required,
          old_amount_paid,
          new_amount_paid,
          old_balance_due,
          new_balance_due,
          reason,
          created_at,

          changed_by_user:users!appointment_pricing_history_changed_by_fkey(
            id,
            name,
            email
          )
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
    Sort Nested Collections
    ──────────────────────────────────────────────
    */

    data.forEach((appointment) => {
      appointment.appointment_payments?.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );

      appointment.appointment_payment_adjustments?.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );

      appointment.appointment_pricing_history?.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    });

    const { data: pendingAppointmentPayments, error: pendingPaymentsError } =
      await supabase
        .from("appointment_payments")
        .select(
          `
    *,
    appointment:appointments(
      *,
      user:users!appointments_user_id_fkey(
        id,
        name,
        email
      )
    )
  `,
        )
        .eq("status", "pending")
        .eq("payment_channel", "offline")
        .order("created_at", { ascending: false });
    if (pendingPaymentsError) {
      console.error(
        "Pending appointment payments fetch error:",
        pendingPaymentsError,
      );

      return NextResponse.json(
        { error: pendingPaymentsError.message },
        { status: 400 },
      );
    }

    /*
    ──────────────────────────────────────────────
    Group Dashboard
    ──────────────────────────────────────────────
    */

    const pending = [];
    const confirmed = [];
    const completed = [];
    const cancelled = [];

    for (const appointment of data) {
      switch (appointment.status) {
        case "pending":
          pending.push(appointment);
          break;

        case "confirmed":
          confirmed.push(appointment);
          break;

        case "completed":
          completed.push(appointment);
          break;

        case "cancelled":
          cancelled.push(appointment);
          break;
      }
    }

    /*
    ──────────────────────────────────────────────
    Response
    ──────────────────────────────────────────────
    */

    return NextResponse.json({
      pending,
      confirmed,
      completed,
      cancelled,
      pendingPayments: pendingAppointmentPayments ?? [],
    });
  } catch (error) {
    console.error("Admin appointments GET error:", error);

    return NextResponse.json(
      {
        error: "Failed to load appointments",
      },
      {
        status: 500,
      },
    );
  }
}
