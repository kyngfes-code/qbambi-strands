import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("instalments")
    .select(
      `
      id,
      due_date,
      amount,
      amount_paid,
      penalty_applied_count,
      payment_plans (
        id,
        user_id
      )
    `
    )
    .eq("paid", false)
    .lt("due_date", new Date().toISOString())
    .order("due_date", { ascending: true });

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch overdue instalments" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
