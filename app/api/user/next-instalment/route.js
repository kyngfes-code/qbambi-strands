import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseWithAuth } from "@/lib/supabase";

export async function GET() {
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
      payment_plan_id,
      due_date,
      amount,
      amount_paid
    `
    )
    .eq("paid", false)
    .gte("due_date", new Date().toISOString())
    .order("due_date")
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
