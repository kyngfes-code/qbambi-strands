import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createSupabaseAdmin();

  /*
   * Payment transactions remain the financial source of truth.
   * We only care about transactions that are still relevant to the
   * order workflow.
   */
  const { data: transactions, error: txError } = await supabase
    .from("payment_transactions")
    .select(
      `
      id,
      entity_id,
      entity_type,
      amount,
      payment_method,
      payment_type,
      provider,
      provider_reference,
      status,
      metadata,
      created_at
    `,
    )
    .eq("entity_type", "order")
    .in("status", ["pending", "verified"])
    .order("created_at", { ascending: false });

  if (txError) {
    console.error(txError);

    return NextResponse.json(
      { error: "Failed to load payment transactions" },
      { status: 500 },
    );
  }

  if (!transactions?.length) {
    return NextResponse.json([]);
  }

  const orderIds = [...new Set(transactions.map((tx) => tx.entity_id))];

  /*
   * Only fetch orders that are still active in the workflow.
   *
   * awaiting_confirmation
   *      -> waiting for payment confirmation
   *
   * paid
   *      -> waiting for delivery confirmation
   *
   * delivered/cancelled/refunded/etc are intentionally excluded.
   */
  const { data: orders, error: orderError } = await supabase
    .from("orders")
    .select(
      `
  id,
  user_id,
  total_amount,
  status,
  receipt_url,
  created_at,

  payment_confirmed_at,

  payment_confirmed_admin:users!orders_payment_confirmed_by_fkey(
    id,
    name,
    email
  ),

  users!orders_user_id_fkey(
    id,
    name,
    email,
    phone
  )
`,
    )
    .in("id", orderIds)
    .in("status", ["awaiting_confirmation", "paid"]);

  if (orderError) {
    console.error(orderError);

    return NextResponse.json(
      { error: "Failed to load orders" },
      { status: 500 },
    );
  }

  const orderMap = new Map((orders ?? []).map((order) => [order.id, order]));

  const result = transactions
    .map((tx) => {
      const order = orderMap.get(tx.entity_id);

      // Ignore transactions whose order is no longer active.
      if (!order) return null;

      return {
        id: order.id,
        transaction_id: tx.id,

        user_id: order.user_id,

        total_amount: Number(order.total_amount),
        amount: Number(tx.amount),

        payment_confirmed_at: order.payment_confirmed_at,
        payment_confirmed_admin: order.payment_confirmed_admin,

        receipt_url: tx.metadata?.receipt_url ?? order.receipt_url ?? null,

        payment_method: tx.payment_method,
        payment_type: tx.payment_type,

        provider: tx.provider,
        provider_reference: tx.provider_reference,

        // Workflow state (Orders table)
        status: order.status,

        // Financial state (Payment Transactions table)
        transaction_status: tx.status,

        created_at: tx.created_at,

        customer: order.users,

        type: "full",
        instalment_id: null,
        instalment_number: null,
        instalment_amount: null,
      };
    })
    .filter(Boolean);

  return NextResponse.json(result);
}
