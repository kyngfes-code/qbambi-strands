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
    processed: "bg-blue-100 text-blue-700",
  };

  const formatAmount = (value) => `₦${Number(value || 0).toLocaleString()}`;

  const formatDate = (value) =>
    value ? new Date(value).toLocaleString() : "-";

  return (
    <>
      {/* Mobile */}
      <div className="space-y-4 p-4 md:hidden">
        {refundRequests.map((refund) => {
          const order = refund.order;

          const requestedAmount = Number(refund.requested_amount || 0);
          const approvedAmount = Number(refund.approved_amount || 0);
          const difference = requestedAmount - approvedAmount;

          const isPartialRefund =
            approvedAmount > 0 && approvedAmount < requestedAmount;

          return (
            <div
              key={refund.id}
              className="rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">
                    Order #{order?.id?.slice(0, 8)}
                  </h3>

                  <p className="text-sm text-neutral-600">
                    {order?.user?.name || "-"}
                  </p>

                  <p className="text-xs text-neutral-500 break-all">
                    {order?.user?.email || "-"}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      statusStyles[refund.status] ||
                      "bg-neutral-100 text-neutral-700"
                    }`}
                  >
                    {refund.status}
                  </span>

                  {isPartialRefund && (
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                      Partial Refund
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-neutral-500">Requested Amount</p>
                    <p className="font-semibold text-red-600">
                      {formatAmount(requestedAmount)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-500">Approved Amount</p>
                    <p className="font-semibold text-green-600">
                      {formatAmount(approvedAmount)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-neutral-500">Difference</p>
                  <p
                    className={`font-semibold ${
                      difference > 0 ? "text-orange-600" : "text-neutral-700"
                    }`}
                  >
                    {formatAmount(difference)}
                  </p>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-neutral-500">Reason</span>
                  <span className="text-right">{refund.reason || "-"}</span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-neutral-500">Requested At</span>
                  <span className="text-right">
                    {formatDate(refund.created_at)}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-neutral-500">Requested By</p>
                  <p className="font-medium">{refund.requester?.name || "-"}</p>
                </div>

                <div>
                  <p className="text-xs text-neutral-500">Processed By</p>
                  <p className="font-medium">
                    {refund.processed_by_name || refund.processor?.name || "-"}
                  </p>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-neutral-500">Processed At</span>
                  <span className="text-right">
                    {formatDate(refund.processed_at || refund.reviewed_at)}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-neutral-500">Refund Method</span>
                  <span className="text-right">
                    {refund.adjustment?.refund_method || "-"}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-neutral-500">Refund Reference</p>

                  <p className="break-all text-xs">
                    {refund.adjustment?.refund_reference || "-"}
                  </p>
                </div>

                {refund.customer_message && (
                  <div className="rounded-lg bg-neutral-50 p-3">
                    <p className="mb-1 text-xs text-neutral-500">
                      Customer Message
                    </p>

                    <p className="whitespace-pre-wrap">
                      {refund.customer_message}
                    </p>
                  </div>
                )}

                {refund.admin_note && (
                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="mb-1 text-xs text-neutral-500">Admin Note</p>

                    <p className="whitespace-pre-wrap">{refund.admin_note}</p>
                  </div>
                )}
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

      {/* Desktop */}
      <div className="hidden overflow-x-auto rounded-xl border bg-white md:block">
        <table className="min-w-[2200px] text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Requested Amount</th>
              <th className="px-4 py-3 text-left">Approved Amount</th>
              <th className="px-4 py-3 text-left">Difference</th>
              <th className="px-4 py-3 text-left">Partial Refund</th>
              <th className="px-4 py-3 text-left">Reason</th>
              <th className="px-4 py-3 text-left">Requested By</th>
              <th className="px-4 py-3 text-left">Requested At</th>
              <th className="px-4 py-3 text-left">Processed By</th>
              <th className="px-4 py-3 text-left">Processed At</th>
              <th className="px-4 py-3 text-left">Refund Method</th>
              <th className="px-4 py-3 text-left">Refund Reference</th>
              <th className="px-4 py-3 text-left">Customer Message</th>
              <th className="px-4 py-3 text-left">Admin Note</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {refundRequests.map((refund) => {
              const order = refund.order;

              const requestedAmount = Number(refund.requested_amount || 0);

              const approvedAmount = Number(refund.approved_amount || 0);

              const difference = requestedAmount - approvedAmount;

              const isPartialRefund =
                approvedAmount > 0 && approvedAmount < requestedAmount;

              return (
                <tr key={refund.id} className="border-b hover:bg-neutral-50">
                  <td className="whitespace-nowrap px-4 py-4">
                    #{order?.id?.slice(0, 8)}
                  </td>

                  <td className="px-4 py-4">
                    <div>{order?.user?.name || "-"}</div>

                    <div className="text-xs text-neutral-500">
                      {order?.user?.email || "-"}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-red-600">
                    {formatAmount(requestedAmount)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-green-600">
                    {formatAmount(approvedAmount)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <span
                      className={
                        difference > 0 ? "font-semibold text-orange-600" : ""
                      }
                    >
                      {formatAmount(difference)}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    {isPartialRefund ? (
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                        Yes
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="max-w-[220px] px-4 py-4">
                    <div className="line-clamp-2">{refund.reason || "-"}</div>
                  </td>

                  <td className="px-4 py-4">{refund.requester?.name || "-"}</td>

                  <td className="whitespace-nowrap px-4 py-4">
                    {formatDate(refund.created_at)}
                  </td>

                  <td className="px-4 py-4">
                    {refund.processed_by_name || refund.processor?.name || "-"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    {formatDate(refund.processed_at || refund.reviewed_at)}
                  </td>

                  <td className="px-4 py-4">
                    {refund.adjustment?.refund_method || "-"}
                  </td>

                  <td className="max-w-[220px] px-4 py-4">
                    <div className="truncate" title={refund.refund_reference}>
                      {refund.adjustment?.refund_reference || "-"}
                    </div>
                  </td>

                  <td className="max-w-[250px] px-4 py-4">
                    <div
                      className="line-clamp-3"
                      title={refund.customer_message}
                    >
                      {refund.customer_message || "-"}
                    </div>
                  </td>

                  <td className="max-w-[250px] px-4 py-4">
                    <div className="line-clamp-3" title={refund.admin_note}>
                      {refund.admin_note || "-"}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        statusStyles[refund.status] ||
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
