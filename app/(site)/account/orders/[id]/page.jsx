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
     addresses(*),      
      order_items(
        *,
        store(*)
      )
      
     
    `,
    )
    .eq("id", id)
    .eq("user_id", session.user.id)
    .single();

  if (error || !order) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <OrderDetailsView order={order} />
    </main>
  );
}
