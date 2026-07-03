import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("appointment_payment_adjustments")
      .select(
        `
        *,
        recorder:users!appointment_payment_adjustments_recorded_by_fkey(
          id,
          name,
          email
        ),
        approver:users!appointment_payment_adjustments_approved_by_fkey(
          id,
          name,
          email
        ),
        appointment:appointments(
          id,
          service_name,
          appointment_date,
          appointment_time,
          amount_paid,
          service_amount,
          refunded_amount,
          balance_due,
          payment_completion_status,
          status,
          created_at,
          user:users!appointments_user_id_fkey(
            id,
            name,
            email
          )
        )
      `,
      )
      .in("adjustment_type", ["refund_pending", "refund"])
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      pendingRefunds: data.filter(
        (r) =>
          r.adjustment_type === "refund_pending" &&
          r.refund_status === "pending",
      ),

      completedRefunds: data.filter(
        (r) =>
          r.adjustment_type === "refund" && r.refund_status === "completed",
      ),
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
