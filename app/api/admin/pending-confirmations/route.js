import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createSupabaseAdmin();

  /* =====================
     1️⃣ FULL PAYMENTS ONLY
  ====================== */
  const { data: fullOrders, error: orderErr } = await supabase
    .from("orders")
    .select(
      `
      id,
      user_id,
      total_amount,
      receipt_url,
      created_at,
      
      payment_plan_id
    `
    )
    .eq("status", "awaiting_confirmation")
    .is("payment_plan_id", null);

  if (orderErr) {
    console.error(orderErr);
    return NextResponse.json(
      { error: "Failed to load order confirmations" },
      { status: 500 }
    );
  }

  /* =====================
     2️⃣ INSTALMENT PAYMENTS
  ====================== */
  const { data: instalments, error: instError } = await supabase
    .from("instalments")
    .select(
      `
      id,
      order_id,
      instalment_number,
      amount,
      receipt_url,
      created_at,
      orders (
        user_id
      )
    `
    )
    .eq("paid", false)
    .not("receipt_url", "is", null);

  if (instError) {
    console.error(instError);
    return NextResponse.json(
      { error: "Failed to load instalment confirmations" },
      { status: 500 }
    );
  }

  /* =====================
     3️⃣ NORMALIZE
  ====================== */
  const pending = [
    ...fullOrders.map((o) => ({
      id: o.id,
      user_id: o.user_id,
      receipt_url: o.receipt_url,
      created_at: o.created_at,
      total_amount: o.total_amount,
      instalment_id: null,
      instalment_number: null,
      instalment_amount: null,
      type: "full",
    })),

    ...instalments.map((i) => ({
      id: i.order_id,
      user_id: i.orders.user_id,
      receipt_url: i.receipt_url,
      created_at: i.created_at,
      total_amount: null,
      instalment_id: i.id,
      instalment_number: i.instalment_number,
      instalment_amount: i.amount,
      type: "instalment",
    })),
  ];

  pending.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return NextResponse.json(pending);
}
