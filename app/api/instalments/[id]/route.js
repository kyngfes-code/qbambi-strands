import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req, { params }) {
  const resolvedParams = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = resolvedParams;

  if (!id) {
    return NextResponse.json(
      { error: "Missing instalment id" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("instalments")
    .select(
      `
      id,
      amount,
      due_date,
      paid,
      payment_plan_id,
      payment_plans (
        order_id,
        user_id
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Instalment not found" },
      { status: 404 }
    );
  }

  // 🔒 Security check — user owns this instalment
  if (data.payment_plans.user_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    id: data.id,
    amount: data.amount,
    due_date: data.due_date,
    paid: data.paid,
    order_id: data.payment_plans.order_id,
  });
}
