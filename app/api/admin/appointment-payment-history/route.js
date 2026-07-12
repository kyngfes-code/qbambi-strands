import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createSupabaseAdmin();

    /*
    ----------------------------------------------------
    Initial deposits
    ----------------------------------------------------
    */

    const { data: deposits, error: depositsError } = await supabase
      .from("appointment_payments")
      .select(
        `
        id,
        appointment_id,
        amount,
        payment_method,
        receipt_url,
        status,
        confirmed_at,
        created_at,

        appointment:appointments(
          id,
          service_name,
          appointment_date,
          status,

          user:users!appointments_user_id_fkey(
            id,
            name,
            email
          )
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (depositsError) {
      throw depositsError;
    }

    /*
    ----------------------------------------------------
    Financial adjustments
    ----------------------------------------------------
    */

    const { data: adjustments, error: adjustmentError } = await supabase
      .from("appointment_payment_adjustments")
      .select(
        `
        id,
        appointment_id,
        adjustment_type,
        amount,
        tip_amount,
        payment_method,
        payment_channel,
        impact_direction,
        transaction_reference,
        source,
        refund_status,
        refund_method,
        refund_reference,
        refunded_at,
        created_at,

        appointment:appointments(
          id,
          service_name,
          appointment_date,
          status,

          user:users!appointments_user_id_fkey(
            id,
            name,
            email
          )
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (adjustmentError) {
      throw adjustmentError;
    }

    return NextResponse.json({
      deposits: deposits ?? [],
      adjustments: adjustments ?? [],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message || "Failed to load payment history",
      },
      {
        status: 500,
      },
    );
  }
}
