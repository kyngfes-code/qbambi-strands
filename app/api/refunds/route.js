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
        appointment:appointments!inner(
          id,
          user_id,
          service_name,
          appointment_date,
          appointment_time
        )
      `,
      )
      .in("adjustment_type", ["refund_pending", "refund"])
      .eq("appointment.user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: "Failed to load refunds." },
        { status: 500 },
      );
    }

    const pendingRefunds = (data || []).filter(
      (refund) =>
        refund.adjustment_type === "refund_pending" &&
        refund.refund_status === "pending",
    );

    const completedRefunds = (data || []).filter(
      (refund) =>
        refund.adjustment_type === "refund" &&
        refund.refund_status === "completed",
    );

    return NextResponse.json({
      pendingRefunds,
      completedRefunds,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
