import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createSupabaseAdmin();

  const { data: pending, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      user_id,
      total_amount,
      receipt_url,
      payment_method,
      created_at,
      status,
      users!orders_user_id_fkey (
        id,
        name,
        email,
        phone
      )
    `,
    )
    .in("status", ["awaiting_confirmation", "paid"])
    .is("payment_plan_id", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load pending confirmations" },
      { status: 500 },
    );
  }

  const result = pending.map((order) => ({
    ...order,
    customer: order.users,
    users: undefined,
    type: "full",
    instalment_id: null,
    instalment_number: null,
    instalment_amount: null,
  }));

  return NextResponse.json(result);
}
