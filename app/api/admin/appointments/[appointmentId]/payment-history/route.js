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
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    /*
    ---------------------------------------------------------
    Ensure admin
    ---------------------------------------------------------
    */

    if (session.user.role !== "admin") {
      return NextResponse.json(
        {
          error: "Forbidden",
        },
        {
          status: 403,
        },
      );
    }

    /*
    ---------------------------------------------------------
    Appointment ID
    ---------------------------------------------------------
    */

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

    /*
    ---------------------------------------------------------
    Fetch payment ledger
    ---------------------------------------------------------
    */

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase.rpc(
      "get_appointment_payment_history",
      {
        p_appointment_id: id,
        p_user_id: null, // Admin bypasses ownership check
      },
    );

    if (error) {
      console.error("Payment history RPC:", error);

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
    ---------------------------------------------------------
    Success
    ---------------------------------------------------------
    */

    return NextResponse.json({
      success: true,
      appointmentId: id,
      paymentHistory: data ?? [],
    });
  } catch (err) {
    console.error("GET payment history:", err);

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
