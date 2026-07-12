"use client";

export default function AdminOrderStats({ overview }) {
  if (!overview) return null;

  const stats = [
    {
      title: "Gross Revenue",
      value: `₦${Number(overview.grossRevenue ?? 0).toLocaleString()}`,
      color: "bg-green-50 border-green-200 text-green-700",
    },
    {
      title: "Refunds",
      value: `₦${Number(overview.totalRefunds ?? 0).toLocaleString()}`,
      color: "bg-rose-50 border-rose-200 text-rose-700",
    },
    {
      title: "Net Revenue",
      value: `₦${Number(overview.netRevenue ?? 0).toLocaleString()}`,
      color: "bg-emerald-50 border-emerald-200 text-emerald-700",
    },
    {
      title: "Orders",
      value: Number(overview.totalOrders ?? 0).toLocaleString(),
      color: "bg-blue-50 border-blue-200 text-blue-700",
    },
    {
      title: "Awaiting Payment",
      value: Number(overview.awaitingPaymentConfirmation ?? 0).toLocaleString(),
      color: "bg-amber-50 border-amber-200 text-amber-700",
    },
    {
      title: "Awaiting Delivery",
      value: Number(
        overview.awaitingDeliveryConfirmation ?? 0,
      ).toLocaleString(),
      color: "bg-orange-50 border-orange-200 text-orange-700",
    },
    {
      title: "Pending Orders",
      value: Number(overview.pendingOrders ?? 0).toLocaleString(),
      color: "bg-yellow-50 border-yellow-200 text-yellow-700",
    },
    {
      title: "Delivered",
      value: Number(overview.deliveredOrders ?? 0).toLocaleString(),
      color: "bg-cyan-50 border-cyan-200 text-cyan-700",
    },
    {
      title: "Cancelled",
      value: Number(overview.cancelledOrders ?? 0).toLocaleString(),
      color: "bg-gray-50 border-gray-200 text-gray-700",
    },
    {
      title: "Rejected Payments",
      value: Number(overview.rejectedPayments ?? 0).toLocaleString(),
      color: "bg-red-50 border-red-200 text-red-700",
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Orders Dashboard</h1>
        <p className="text-neutral-500">
          Overview of orders, payments, revenue and fulfilment.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-10">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className={`rounded-2xl border p-5 transition-shadow hover:shadow-sm ${stat.color}`}
          >
            <p className="text-sm font-medium opacity-80">{stat.title}</p>

            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
