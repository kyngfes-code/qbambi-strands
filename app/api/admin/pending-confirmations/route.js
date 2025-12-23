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
    .from("orders")
    .select(
      `
      id,
      total_amount,
      receipt_url,
      created_at,
      user_id
    `
    )
    .eq("status", "awaiting_confirmation")
    .order("created_at");

  if (error) {
    return NextResponse.json(
      { error: "Failed to load pending payments" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
