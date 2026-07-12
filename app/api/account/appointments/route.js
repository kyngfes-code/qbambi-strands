import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    /*
    ---------------------------------------------------------
    Authenticate
    ---------------------------------------------------------
    */

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

    /*
    ---------------------------------------------------------
    Call RPC
    ---------------------------------------------------------
    */

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase.rpc("get_customer_appointments", {
      p_user_id: session.user.id,
    });

    if (error) {
      console.error("get_customer_appointments:", error);

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
      appointments: data ?? [],
    });
  } catch (err) {
    console.error("GET /api/account/appointments:", err);

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
