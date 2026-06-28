"use client";

export default function DeliveredOrdersTable({ orders = [], onViewOrder }) {
  if (!orders.length) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center text-neutral-500">
        No delivered orders found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="sticky top-0 bg-neutral-100">
            <tr className="text-left text-neutral-700">
              <th className="px-4 py-3 font-semibold">Order</th>

              <th className="px-4 py-3 font-semibold">Customer</th>

              <th className="px-4 py-3 font-semibold">Phone</th>

              <th className="px-4 py-3 font-semibold">Payment</th>

              <th className="px-4 py-3 font-semibold text-right">Amount</th>

              <th className="px-4 py-3 font-semibold">Delivered</th>

              <th className="px-4 py-3 font-semibold text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-t hover:bg-neutral-50 transition"
              >
                <td className="px-4 py-4 font-medium">
                  #{order.id.slice(0, 8)}
                </td>

                <td className="px-4 py-4">
                  <div className="font-medium">
                    {order.customer?.name ?? "-"}
                  </div>

                  <div className="text-xs text-neutral-500">
                    {order.customer?.email ?? "-"}
                  </div>
                </td>

                <td className="px-4 py-4">{order.customer?.phone ?? "-"}</td>

                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      order.payment_method === "paystack"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {order.payment_method === "paystack"
                      ? "Paystack"
                      : "Bank Transfer"}
                  </span>
                </td>

                <td className="px-4 py-4 text-right font-semibold">
                  ₦{Number(order.total_amount ?? 0).toLocaleString()}
                </td>

                <td className="px-4 py-4 whitespace-nowrap">
                  {order.delivered_at
                    ? new Date(order.delivered_at).toLocaleString()
                    : "-"}
                </td>

                <td className="px-4 py-4 text-center">
                  <button
                    onClick={() => onViewOrder(order.id)}
                    className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-100 transition"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
