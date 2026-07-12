import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req) {
  try {
    /*
    =====================================
    Authenticate
    =====================================
    */

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /*
    =====================================
    Request
    =====================================
    */

    const { paymentId, paymentMethod = "bank_transfer" } = await req.json();

    if (!paymentId) {
      return NextResponse.json(
        {
          error: "Payment ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    =====================================
    Execute RPC
    =====================================
    */

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase.rpc("confirm_appointment_deposit", {
      p_payment_id: paymentId,
      p_confirmed_by: session.user.id,
      p_payment_method: paymentMethod,
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
    =====================================
    Success
    =====================================
    */

    return NextResponse.json({
      success: true,
      message: "Appointment deposit confirmed successfully.",
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
