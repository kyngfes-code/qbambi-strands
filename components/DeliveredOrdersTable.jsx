"use client";

export default function DeliveredOrdersTable({ orders }) {
  if (!orders?.length) {
    return <p className="text-sm text-neutral-500">No delivered orders</p>;
  }

  return (
    <table className="w-full border text-sm">
      <thead className="bg-neutral-100">
        <tr>
          <th className="border p-2">Order ID</th>
          <th className="border p-2">User</th>
          <th className="border p-2">Amount</th>
          <th className="border p-2">Delivered At</th>
        </tr>
      </thead>

      <tbody>
        {orders.map((order) => (
          <tr key={order.id}>
            <td className="border p-2">{order.id.slice(0, 8)}</td>

            <td className="border p-2">{order.user_id}</td>

            <td className="border p-2">
              ₦{Number(order.total_amount).toLocaleString()}
            </td>

            <td className="border p-2">
              {order.delivered_at
                ? new Date(order.delivered_at).toLocaleString()
                : "-"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
