import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const session = await auth();

    // Must be logged in
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Must be admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabaseAdmin = createSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("appointment_payments")
      .select(
        `
    *,
    appointment:appointments (
      id,
      service_name,
      appointment_date,
      appointment_time,
      service_amount,
      deposit_required,
      amount_paid,
      balance_due,
      user_id,

      user:users!appointments_user_id_fkey (
        id,
        name,
        email
      )
    )
  `,
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch appointment payments:", error);

      return NextResponse.json(
        {
          error: "Failed to fetch appointment payments",
          details: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Appointment payments GET error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
