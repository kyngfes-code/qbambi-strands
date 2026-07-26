import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import OrderDetailsView from "@/components/orders/OrderDetailsView";

export default async function OrderDetailsPage({ params }) {
  const { id } = await params;

  const session = await auth();

  if (!session?.user) {
    notFound();
  }

  const supabase = createSupabaseAdmin();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      *,

      addresses!orders_address_id_fkey(
        *
      ),

      order_items(
        *,
        store(*)
      ),

      payment_plans!payment_plans_order_fkey(
  *,
  instalments(*)
),

      refund_requests:order_refund_requests(
        *,
       processor:users!order_refund_requests_processed_by_fkey(
  id,
  name,
  email
),
        adjustment:order_payment_adjustments!order_refund_requests_processed_adjustment_id_fkey(
          id,
          refund_method,
          refund_reference,
          adjustment_type,
          amount,
          created_at
        )
      )
    `,
    )
    .eq("id", id)
    .eq("user_id", session.user.id)
    .order("created_at", {
      foreignTable: "refund_requests",
      ascending: false,
    })
    .single();

  if (error || !order) {
    console.error(error);
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <OrderDetailsView order={order} />
    </main>
  );
}
