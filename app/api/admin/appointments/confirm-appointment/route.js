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
    Request Body
    ==========================================
    */

    const { appointmentId, override = false } = await req.json();

    if (!appointmentId) {
      return NextResponse.json(
        {
          error: "Appointment ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    ==========================================
    Execute RPC
    ==========================================
    */

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase.rpc("confirm_appointment", {
      p_appointment_id: appointmentId,
      p_confirmed_by: session.user.id,
      p_override: override,
    });

    if (error) {
      console.error(error);

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 400,
        },
      );
    }

    /*
    ==========================================
    Success
    ==========================================
    */

    return NextResponse.json({
      success: true,
      message: "Appointment confirmed successfully.",
      ...data,
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
