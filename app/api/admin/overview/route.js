import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createSupabaseAdmin();

  // Expected revenue
  const { data: expected, error: e1 } = await supabase
    .from("instalments")
    .select("amount");

  // Collected
  const { data: collected, error: e2 } = await supabase
    .from("instalments")
    .select("amount_paid");

  if (e1 || e2) {
    return NextResponse.json(
      { error: "Failed to load overview" },
      { status: 500 }
    );
  }

  const totalExpected = expected.reduce((s, i) => s + i.amount, 0);
  const totalCollected = collected.reduce((s, i) => s + i.amount_paid, 0);

  return NextResponse.json({
    total_expected_revenue: totalExpected,
    total_collected: totalCollected,
    total_outstanding: totalExpected - totalCollected,
  });
}
