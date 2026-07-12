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

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    /*
    ---------------------------------------------------------
    RPC
    ---------------------------------------------------------
    */

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase.rpc(
      "get_customer_appointment_details",
      {
        p_user_id: session.user.id,
        p_appointment_id: id,
      },
    );

    if (error) {
      console.error(error);

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      appointment: data,
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
