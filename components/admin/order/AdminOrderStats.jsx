"use client";

export default function AdminOrderStats({ overview }) {
  if (!overview) return null;

  const stats = [
    {
      title: "Revenue",
      value: `₦${Number(overview.totalRevenue || 0).toLocaleString()}`,
      color: "bg-green-50 border-green-200 text-green-700",
    },
    {
      title: "Orders",
      value: Number(overview.totalOrders || 0).toLocaleString(),
      color: "bg-blue-50 border-blue-200 text-blue-700",
    },
    {
      title: "Awaiting Confirmation",
      value: Number(overview.pendingPayments || 0).toLocaleString(),
      color: "bg-yellow-50 border-yellow-200 text-yellow-700",
    },
    {
      title: "Delivered",
      value: Number(overview.deliveredOrders || 0).toLocaleString(),
      color: "bg-emerald-50 border-emerald-200 text-emerald-700",
    },
    {
      title: "Cancelled",
      value: Number(overview.cancelledOrders || 0).toLocaleString(),
      color: "bg-gray-50 border-gray-200 text-gray-700",
    },
    {
      title: "Rejected Payments",
      value: Number(overview.rejectedPayments || 0).toLocaleString(),
      color: "bg-red-50 border-red-200 text-red-700",
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Orders Dashboard</h1>
        <p className="text-neutral-500">
          Overview of orders, payments and fulfilment.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className={`rounded-2xl border p-5 ${stat.color}`}
          >
            <p className="text-sm font-medium opacity-80">{stat.title}</p>

            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
