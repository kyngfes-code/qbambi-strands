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
    .from("payment_history")
    .select(
      `
  id,
  order_id,
  amount,
  payment_type,
  payment_method,
  status,
  created_at,
  confirmed_at,

  confirmer:users!payment_history_confirmed_by_fkey (
    id,
    name
  ),

  order:orders(
    id,
    user_id,
    customer:users!orders_user_id_fkey(
      id,
      name,
      email,
      phone
    )
  )
`,
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch payment history" },
      { status: 500 },
    );
  }

  const history = data.map((payment) => ({
    ...payment,

    customer: payment.order?.customer ?? null,

    order: undefined,
  }));

  return NextResponse.json(history);
}
