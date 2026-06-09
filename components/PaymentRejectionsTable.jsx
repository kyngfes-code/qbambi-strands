"use client";

export default function PaymentRejectionsTable({ rejections, onViewOrder }) {
  if (!rejections?.length) {
    return (
      <p className="text-sm text-neutral-500">No payment rejections found</p>
    );
  }

  return (
    <table className="w-full border text-sm mt-4">
      <thead className="bg-neutral-100">
        <tr>
          <th className="p-2 border">Order</th>
          <th className="p-2 border">Customer</th>
          <th className="p-2 border">Reason</th>
          <th className="p-2 border">Customer Message</th>
          <th className="p-2 border">Admin Note</th>
          <th className="p-2 border">Rejected By</th>
          <th className="p-2 border">Date</th>
        </tr>
      </thead>

      <tbody>
        {rejections.map((r) => (
          <tr key={r.id}>
            <td className="p-2 border">
              <button
                onClick={() => onViewOrder?.(r.order_id)}
                className="text-blue-600 underline"
              >
                {r.order_id?.slice(0, 8)}
              </button>
            </td>

            <td className="p-2 border">
              {r.customer?.name ?? r.user_id?.slice(0, 8)}
            </td>

            <td className="p-2 border capitalize">
              {r.rejection_reason?.replaceAll("_", " ")}
            </td>

            <td className="p-2 border">{r.customer_message}</td>

            <td className="p-2 border">{r.admin_note || "-"}</td>

            <td className="p-2 border">{r.rejected_admin?.name ?? "-"}</td>

            <td className="p-2 border">
              {new Date(r.created_at).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
