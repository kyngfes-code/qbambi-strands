import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    /*
    ---------------------------------------------------------
    Authenticate User
    ---------------------------------------------------------
    */

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    /*
    ---------------------------------------------------------
    Create Supabase Admin Client
    ---------------------------------------------------------
    */

    const supabase = createSupabaseAdmin();

    /*
    ---------------------------------------------------------
    Fetch Customer Dashboard Summary
    ---------------------------------------------------------
    */

    const { data, error } = await supabase.rpc("get_customer_account_summary", {
      p_user_id: session.user.id,
    });

    if (error) {
      console.error("get_customer_account_summary:", error);

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        {
          status: 400,
        },
      );
    }

    /*
    ---------------------------------------------------------
    RPC returned nothing
    ---------------------------------------------------------
    */

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: "Unable to load account summary.",
        },
        {
          status: 404,
        },
      );
    }

    /*
    ---------------------------------------------------------
    Success
    ---------------------------------------------------------
    */

    return NextResponse.json(
      {
        success: true,
        summary: data,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("GET /api/account/summary:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error.",
      },
      {
        status: 500,
      },
    );
  }
}
