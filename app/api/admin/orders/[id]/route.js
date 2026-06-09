import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req, { params }) {
  const { id } = await params;

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      customer:users!orders_user_id_fkey (
  id,
  name,
  email
),
    delivered_admin:users!orders_delivered_by_fkey (
    id,
    name,
    email
  ),
  confirmed_admin:users!orders_confirmed_by_fkey (
  id,
  name,
  email
),
    payment_rejections:payment_rejections!payment_rejections_order_id_fkey (
      id,
      rejection_reason,
      customer_message,
      created_at,
      rejected_by
    ),
      order_items (
        id,
        quantity,
        price,
        store (
          id,
          title,
          image,
          price
        )
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}
