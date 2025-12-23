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
      amount_paid,
      paid_at,
      payment_plans (
        id,
        user_id
      )
    `
    )
    .eq("paid", true)
    .order("paid_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch payment history" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
