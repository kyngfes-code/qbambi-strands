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
      awaitingPaymentRes,
      awaitingDeliveryRes,
      cancelledOrdersRes,
      rejectedPaymentsRes,
      grossRevenueRes,
      refundsRes,
    ] = await Promise.all([
      // Total Orders
      supabase.from("orders").select("*", { count: "exact", head: true }),

      // Delivered Orders
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "delivered"),

      // Awaiting Payment Confirmation
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "awaiting_confirmation"),

      // Awaiting Delivery Confirmation
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "paid"),

      // Cancelled Orders
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "cancelled"),

      // Active Payment Rejections
      supabase
        .from("payment_rejections")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"),

      // Gross Revenue
      supabase
        .from("payment_transactions")
        .select("amount")
        .eq("entity_type", "order")
        .in("status", ["verified", "completed"]),

      // Refunds
      supabase
        .from("order_payment_adjustments")
        .select("amount")
        .in("adjustment_type", [
          "refund",
          "partial_refund",
          "overpayment_refund",
        ]),
    ]);

    const errors = [
      totalOrdersRes.error,
      deliveredOrdersRes.error,
      awaitingPaymentRes.error,
      awaitingDeliveryRes.error,
      cancelledOrdersRes.error,
      rejectedPaymentsRes.error,
      grossRevenueRes.error,
      refundsRes.error,
    ].filter(Boolean);

    if (errors.length) {
      console.error(errors);

      return NextResponse.json(
        { error: "Failed to load dashboard overview" },
        { status: 500 },
      );
    }

    const grossRevenue = (grossRevenueRes.data ?? []).reduce(
      (sum, tx) => sum + Number(tx.amount || 0),
      0,
    );

    const totalRefunds = (refundsRes.data ?? []).reduce(
      (sum, refund) => sum + Number(refund.amount || 0),
      0,
    );

    const netRevenue = grossRevenue - totalRefunds;

    return NextResponse.json({
      grossRevenue,
      totalRefunds,
      netRevenue,

      totalOrders: totalOrdersRes.count ?? 0,

      awaitingPaymentConfirmation: awaitingPaymentRes.count ?? 0,

      awaitingDeliveryConfirmation: awaitingDeliveryRes.count ?? 0,

      pendingOrders:
        (awaitingPaymentRes.count ?? 0) + (awaitingDeliveryRes.count ?? 0),

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
