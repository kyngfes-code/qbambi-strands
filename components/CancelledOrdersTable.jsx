"use client";

export default function CancelledOrdersTable({ cancellations, onViewOrder }) {
  if (!cancellations?.length) {
    return <p className="text-sm text-neutral-500">No cancelled orders</p>;
  }

  return (
    <table className="w-full border text-sm mt-4">
      <thead className="bg-neutral-100">
        <tr>
          <th className="p-2 border">Order</th>
          <th className="p-2 border">Reason</th>
          <th className="p-2 border">Customer Message</th>
          <th className="p-2 border">Cancelled At</th>
          <th className="p-2 border">Action</th>
        </tr>
      </thead>

      <tbody>
        {cancellations.map((c) => (
          <tr key={c.id}>
            <td className="p-2 border">{c.order_id?.slice(0, 8)}</td>

            <td className="p-2 border">{c.cancellation_reason}</td>

            <td className="p-2 border">{c.customer_message}</td>

            <td className="p-2 border">
              {new Date(c.created_at).toLocaleString()}
            </td>

            <td className="p-2 border">
              <button
                onClick={() => onViewOrder(c.order_id)}
                className="text-blue-600 underline"
              >
                View Order
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
