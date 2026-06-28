import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createSupabaseAdmin();

  try {
    const [
      totalOrdersRes,
      deliveredOrdersRes,
      pendingPaymentsRes,
      cancelledOrdersRes,
      rejectedPaymentsRes,
      revenueRes,
    ] = await Promise.all([
      supabase.from("orders").select("*", { count: "exact", head: true }),

      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "delivered"),

      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "awaiting_confirmation"),

      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "cancelled"),

      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "rejected"),

      supabase
        .from("payment_history")
        .select("amount")
        .eq("status", "confirmed"),
    ]);

    const errors = [
      totalOrdersRes.error,
      deliveredOrdersRes.error,
      pendingPaymentsRes.error,
      cancelledOrdersRes.error,
      rejectedPaymentsRes.error,
      revenueRes.error,
    ].filter(Boolean);

    if (errors.length) {
      console.error(errors);

      return NextResponse.json(
        { error: "Failed to load dashboard overview" },
        { status: 500 },
      );
    }

    const totalRevenue = (revenueRes.data ?? []).reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0,
    );

    return NextResponse.json({
      totalRevenue,

      totalOrders: totalOrdersRes.count ?? 0,

      pendingPayments: pendingPaymentsRes.count ?? 0,

      deliveredOrders: deliveredOrdersRes.count ?? 0,

      cancelledOrders: cancelledOrdersRes.count ?? 0,

      rejectedPayments: rejectedPaymentsRes.count ?? 0,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
