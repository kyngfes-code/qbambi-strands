import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req, { params }) {
  try {
    //////////////////////////////////////////////////////
    // Authentication
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
    // Params
    //////////////////////////////////////////////////////

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Appointment ID is required.",
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
    // Verify Appointment Ownership
    //////////////////////////////////////////////////////

    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select("id,user_id")
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

    if (appointment.user_id !== session.user.id) {
      return NextResponse.json(
        {
          error: "Forbidden.",
        },
        {
          status: 403,
        },
      );
    }

    //////////////////////////////////////////////////////
    // Fetch Appointment Details
    //////////////////////////////////////////////////////

    const { data, error } = await supabase.rpc(
      "get_customer_appointment_details",
      {
        p_user_id: session.user.id,
        p_appointment_id: id,
      },
    );

    if (error) {
      throw error;
    }

    //////////////////////////////////////////////////////
    // Response
    //////////////////////////////////////////////////////

    return NextResponse.json(
      {
        success: true,
        appointment: data,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("CUSTOMER APPOINTMENT DETAILS ERROR");
    console.error(error);

    return NextResponse.json(
      {
        error: "Unable to load appointment details.",
      },
      {
        status: 500,
      },
    );
  }
}
