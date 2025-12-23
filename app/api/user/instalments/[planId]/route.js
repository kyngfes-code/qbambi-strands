import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseWithAuth } from "@/lib/supabase";

export async function GET(req, { params }) {
  const resolvedParams = await params;
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = supabaseWithAuth(session.accessToken);

  const { data, error } = await supabase
    .from("instalments")
    .select(
      `
      id,
      due_date,
      amount,
      amount_paid,
      paid,
      penalty_applied_count
    `
    )
    .eq("payment_plan_id", params.planId)
    .order("due_date");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
