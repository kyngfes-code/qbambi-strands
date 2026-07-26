import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req, { params }) {
  try {
    /*
    ---------------------------------------------------------
    Authenticate
    ---------------------------------------------------------
    */

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Appointment ID is required." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    /*
    ---------------------------------------------------------
    Appointment
    ---------------------------------------------------------
    */

    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select(
        `
        *,
        user:users!appointments_user_id_fkey(
          id,
          name,
          email,
          phone
        ),
        appointment_pricing_history(
          *,
          changed_by_user:users!appointment_pricing_history_changed_by_fkey(
    id,
    name,
    email
  )
        )
      `,
      )
      .eq("id", id)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        {
          error: "Appointment not found.",
        },
        {
          status: 404,
        },
      );
    }

    /*
    ---------------------------------------------------------
    Financial History
    ---------------------------------------------------------
    */

    const { data: paymentHistory, error: historyError } = await supabase.rpc(
      "get_appointment_payment_history",
      {
        p_appointment_id: id,
        p_user_id: null,
      },
    );

    if (historyError) {
      console.error(historyError);

      return NextResponse.json(
        {
          error: historyError.message,
        },
        {
          status: 400,
        },
      );
    }

    /*
    ---------------------------------------------------------
    Attach history to appointment
    ---------------------------------------------------------
    */

    appointment.payment_history = paymentHistory ?? [];

    /*
    ---------------------------------------------------------
    Success
    ---------------------------------------------------------
    */

    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch (err) {
    console.error(err);

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
