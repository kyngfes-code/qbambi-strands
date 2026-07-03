"use client";

export default function OrderRefundQueueTable({
  refundRequests = [],
  onViewOrder,
  onProcessRefund,
}) {
  if (!refundRequests.length) {
    return (
      <div className="rounded-xl border bg-white p-6 text-center text-neutral-500">
        No refund requests found.
      </div>
    );
  }

  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    cancelled: "bg-neutral-200 text-neutral-700",
  };

  return (
    <>
      {/* ==========================
          Mobile Cards
      =========================== */}
      <div className="space-y-4 p-4 md:hidden">
        {refundRequests.map((refund) => {
          const order = refund.order;

          return (
            <div
              key={refund.id}
              className="rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">
                    Order #{order?.id?.slice(0, 8)}
                  </h3>

                  <p className="mt-1 text-sm text-neutral-500">
                    {order?.user?.name || "-"}
                  </p>

                  <p className="text-xs text-neutral-400">
                    {order?.user?.email || "-"}
                  </p>
                </div>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    statusStyles[refund.status] ??
                    "bg-neutral-100 text-neutral-700"
                  }`}
                >
                  {refund.status}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Reason</span>

                  <span>{refund.reason || "-"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-neutral-500">Amount</span>

                  <span className="font-semibold text-red-600">
                    ₦{Number(refund.requested_amount || 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-neutral-500">Requested</span>

                  <span>
                    {new Date(refund.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  Requested by {refund.requester?.name || "-"}
                </p>
                {refund.customer_message && (
                  <div className="mt-2 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-600">
                    {refund.customer_message}
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-neutral-500">Refund Status</span>

                  <span>{refund?.status}</span>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => onViewOrder(order.id)}
                  className="flex-1 rounded-lg border px-4 py-2 hover:bg-neutral-100"
                >
                  View
                </button>

                {refund.status === "pending" && (
                  <button
                    onClick={() => onProcessRefund(refund)}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                  >
                    Process
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ==========================
          Desktop Table
      =========================== */}

      <div className="hidden overflow-x-auto rounded-xl md:block">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Order</th>
              <th className="px-4 py-3 text-left font-semibold">Customer</th>
              <th className="px-4 py-3 text-left font-semibold">Reason</th>
              <th className="px-4 py-3 text-left font-semibold">Amount</th>
              <th className="px-4 py-3 text-left font-semibold">Requested</th>
              <th className="px-4 py-3 text-left font-semibold">
                Requested By
              </th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {refundRequests.map((refund) => {
              const order = refund.order;

              return (
                <tr
                  key={refund.id}
                  className="border-b last:border-b-0 hover:bg-neutral-50"
                >
                  <td className="whitespace-nowrap px-4 py-4">
                    <div className="font-semibold">
                      #{order?.id?.slice(0, 8)}
                    </div>

                    <div className="text-xs text-neutral-500">
                      {order?.status}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="font-medium">
                      {order?.user?.name || "-"}
                    </div>

                    <div className="text-xs text-neutral-500">
                      {order?.user?.email || "-"}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div>{refund.reason}</div>

                    {refund.customer_message && (
                      <div className="mt-2 text-xs text-neutral-500">
                        {refund.customer_message}
                      </div>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-red-600">
                    ₦{Number(refund.requested_amount || 0).toLocaleString()}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    {new Date(refund.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">{refund.requester?.name || "-"}</td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        statusStyles[refund.status] ??
                        "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {refund.status}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onViewOrder(order.id)}
                        className="rounded-lg border px-3 py-1.5 hover:bg-neutral-100"
                      >
                        View
                      </button>

                      {refund.status === "pending" && (
                        <button
                          onClick={() => onProcessRefund(refund)}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-white hover:bg-red-700"
                        >
                          Process
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
