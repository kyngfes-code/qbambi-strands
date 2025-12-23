"use client";

export default function PendingConfirmationsTable({ orders, onConfirm }) {
  if (!orders.length) {
    return <p className="text-sm text-neutral-500">No pending confirmations</p>;
  }

  return (
    <table className="w-full border text-sm mt-4">
      <thead className="bg-neutral-100">
        <tr>
          <th className="p-2 border">Order</th>
          <th className="p-2 border">User</th>
          <th className="p-2 border">Amount</th>
          <th className="p-2 border">Receipt</th>
          <th className="p-2 border">Action</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <tr key={o.id}>
            <td className="p-2 border">{o.id.slice(0, 8)}</td>
            <td className="p-2 border">{o.user_id}</td>
            <td className="p-2 border">₦{o.total_amount.toLocaleString()}</td>
            <td className="p-2 border">
              <a
                href={o.receipt_url}
                target="_blank"
                className="text-blue-600 underline"
              >
                View
              </a>
            </td>
            <td className="p-2 border">
              <button
                onClick={() => onConfirm(o.id)}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                Confirm
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
