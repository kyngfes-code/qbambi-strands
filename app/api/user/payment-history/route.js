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
    .from("payment_history")
    .select(
      `
    id,
    amount,
    status,
    created_at,
    payment_plans!inner ( user_id )
  `
    )
    .eq("payment_plans.user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
