import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    /*
    ─────────────────────────────────────────────
    Authenticate Admin
    ─────────────────────────────────────────────
    */
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createSupabaseAdmin();

    /*
    ─────────────────────────────────────────────
    Fetch Pending Refunds
    ─────────────────────────────────────────────
    */
    const { data, error } = await supabase
      .from("appointment_payment_adjustments")
      .select(
        `
        id,
        appointment_id,
        adjustment_type,
        amount,
        note,
        created_at,
        refund_status,
        refund_method,
        refunded_at,
        refund_processed_by,

        appointment:appointments!appointment_payment_adjustments_appointment_id_fkey (
          id,
          service_name,
          appointment_date,
          appointment_time,
          status,

          user:users!appointments_user_id_fkey (
            id,
            name,
            email
          )
        ),

        recorder:users!appointment_payment_adjustments_recorded_by_fkey (
          id,
          name
        )
      `,
      )
      .eq("adjustment_type", "refund")
      .in("refund_status", ["pending", "processing", "completed"])
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Refund fetch error:", error);

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    /*
    ─────────────────────────────────────────────
    Success
    ─────────────────────────────────────────────
    */
    return NextResponse.json(data || []);
  } catch (error) {
    console.error("GET /api/admin/refunds:", error);

    return NextResponse.json(
      { error: "Failed to load refunds" },
      { status: 500 },
    );
  }
}
