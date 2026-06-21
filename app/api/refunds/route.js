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
        appointment:appointments (
          id,
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

    return NextResponse.json(data || []);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
