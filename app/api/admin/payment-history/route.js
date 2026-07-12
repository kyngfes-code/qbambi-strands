import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createSupabaseAdmin();

  const { data: transactions, error } = await supabase
    .from("payment_transactions")
    .select(
      `
    id,
    entity_type,
    entity_id,
    amount,
    payment_type,
    payment_method,
    status,
    created_at,
    verified_at,
    user:users(
      id,
      name,
      email,
      phone
    )
  `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch payment transactions" },
      { status: 500 },
    );
  }

  const orderIds = transactions
    .filter((t) => t.entity_type === "order")
    .map((t) => t.entity_id);

  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
    id,
    status,
    payment_method,
    confirmed_at
  `,
    )
    .in("id", orderIds);

  const orderMap = Object.fromEntries(orders.map((o) => [o.id, o]));

  const result = transactions.map((tx) => ({
    ...tx,
    order: tx.entity_type === "order" ? (orderMap[tx.entity_id] ?? null) : null,
  }));

  const paymentHistory = (result || []).map((tx) => ({
    id: tx.id,
    reference: tx.reference,
    provider: tx.provider,
    provider_reference: tx.provider_reference,
    entity_type: tx.entity_type,
    entity_id: tx.entity_id,
    payment_type: tx.payment_type,
    amount: Number(tx.amount),
    currency: tx.currency,
    payment_method: tx.payment_method,
    status: tx.status,
    email: tx.email,
    verified_at: tx.verified_at,
    paid_at: tx.paid_at,
    created_at: tx.created_at,

    customer: tx.order?.customer ?? null,

    order: tx.order
      ? {
          id: tx.order.id,
          total_amount: Number(tx.order.total_amount),
        }
      : null,
  }));

  return NextResponse.json(paymentHistory);
}
