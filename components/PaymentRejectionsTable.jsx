"use client";

export default function PaymentRejectionsTable({
  rejections = [],
  onViewOrder,
}) {
  if (!rejections.length) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center text-neutral-500">
        No payment rejections found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1200px] w-full text-sm">
          <thead className="bg-neutral-100">
            <tr className="text-left">
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Reason</th>
              <th className="px-4 py-3 font-semibold">Customer Message</th>
              <th className="px-4 py-3 font-semibold">Admin Note</th>
              <th className="px-4 py-3 font-semibold">Rejected By</th>
              <th className="px-4 py-3 font-semibold">Date</th>
            </tr>
          </thead>

          <tbody>
            {rejections.map((r) => (
              <tr
                key={r.id}
                className="border-t hover:bg-neutral-50 transition"
              >
                {/* Order */}
                <td className="px-4 py-4 align-top">
                  <button
                    onClick={() => onViewOrder?.(r.order_id)}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    #{r.order_id?.slice(0, 8)}
                  </button>
                </td>

                {/* Customer */}
                <td className="px-4 py-4 align-top">
                  <div className="font-medium">{r.customer?.name ?? "-"}</div>

                  <div className="text-xs text-neutral-500">
                    {r.customer?.email ?? r.user_id?.slice(0, 8)}
                  </div>
                </td>

                {/* Reason */}
                <td className="px-4 py-4 align-top whitespace-nowrap">
                  <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 capitalize">
                    {r.rejection_reason?.replaceAll("_", " ")}
                  </span>
                </td>

                {/* Customer Message */}
                <td className="px-4 py-4 align-top">
                  <div className="max-w-xs whitespace-normal break-words text-neutral-700">
                    {r.customer_message || "-"}
                  </div>
                </td>

                {/* Admin Note */}
                <td className="px-4 py-4 align-top">
                  <div className="max-w-xs whitespace-normal break-words text-neutral-700">
                    {r.admin_note || "-"}
                  </div>
                </td>

                {/* Rejected By */}
                <td className="px-4 py-4 align-top whitespace-nowrap">
                  {r.rejected_admin?.name ?? "-"}
                </td>

                {/* Date */}
                <td className="px-4 py-4 align-top whitespace-nowrap text-neutral-600">
                  {new Date(r.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
