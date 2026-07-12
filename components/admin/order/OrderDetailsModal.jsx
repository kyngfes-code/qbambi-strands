"use client";

export default function OrderDetailsModal({
  order,
  onClose,
  onRefund,
  hideRefundButton = false,
}) {
  if (!order) return null;

  const statusColor = {
    paid: "bg-green-600",
    rejected: "bg-red-600",
    delivered: "bg-blue-600",
    cancelled: "bg-gray-600",
    pending: "bg-yellow-600",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <h2 className="text-lg font-bold sm:text-xl">
            Order #{order.id?.slice(0, 8)}
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg border border-neutral-300 px-4 py-2 hover:bg-neutral-100"
          >
            Close
          </button>
        </div>

        {/* Customer */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
          <div className="rounded-xl border bg-neutral-50 p-4 space-y-2">
            <p>
              <strong>Customer:</strong> {order.customer?.name || "-"}
            </p>

            <p>
              <strong>Email:</strong> {order.customer?.email || "-"}
            </p>
            <p>
              <strong>Phone:</strong> {order.customer?.phone ?? "-"}
            </p>

            <p>
              <strong>Status:</strong>

              <span
                className={`ml-2 px-2 py-1 rounded text-white text-sm ${
                  statusColor[order.status] || "bg-yellow-600"
                }`}
              >
                {order.status}
              </span>
            </p>

            {/*Financial summary */}
            <div className="space-y-8 border rounded-xl p-4 bg-neutral-50">
              <h3 className="font-semibold text-lg mb-4">Financial Summary</h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-neutral-500">Total Paid</p>
                  <p className="text-lg sm:text-xl font-bold text-green-600">
                    ₦
                    {Number(
                      order.financialSummary?.totalPaid ?? 0,
                    ).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-neutral-500">Refunded</p>
                  <p className="text-lg sm:text-xl font-bold text-red-600">
                    ₦
                    {Number(
                      order.financialSummary?.totalRefunded ?? 0,
                    ).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-neutral-500">Refundable Balance</p>

                  <p className="text-lg sm:text-xl font-bold text-blue-600">
                    ₦
                    {Number(
                      order.financialSummary?.refundableBalance ?? 0,
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {order.status === "delivered" && (
              <>
                <p>
                  <strong>Delivered At:</strong>{" "}
                  {order.delivered_at
                    ? new Date(order.delivered_at).toLocaleString()
                    : "-"}
                </p>

                <p>
                  <strong>Delivered By:</strong>{" "}
                  {order.delivered_admin?.name || "-"}
                </p>
              </>
            )}

            <p>
              <strong>Total:</strong> ₦
              {Number(order.total_amount || 0).toLocaleString()}
            </p>
          </div>

          {/* Order Items */}
          <div className="space-y-8">
            <h3 className="font-semibold text-lg mb-4">Order Items</h3>

            <div className="space-y-4">
              {order.order_items?.length ? (
                order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row"
                  >
                    <img
                      src={item.store?.image}
                      alt={item.store?.title}
                      className="h-24 w-24 rounded object-cover self-center sm:self-start"
                    />

                    <div className="flex-1">
                      <p className="font-semibold">{item.store?.title}</p>

                      <p>Quantity: {item.quantity}</p>

                      <p>₦{Number(item.price || 0).toLocaleString()}</p>

                      <p className="font-medium mt-1">
                        Line Total: ₦
                        {(
                          Number(item.price || 0) * Number(item.quantity || 0)
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500">No order items found.</p>
              )}
            </div>
          </div>

          {/*Refund history*/}
          {order.refunds?.length > 0 && (
            <div className="space-y-8 border rounded-xl p-4 bg-red-50">
              <h3 className="font-semibold text-red-700 mb-4">
                Refund History
              </h3>

              <div className="space-y-4">
                {order.refunds.map((refund) => (
                  <div
                    key={refund.id}
                    className="rounded-lg border bg-white p-4"
                  >
                    <p>
                      <strong>₦{Number(refund.amount).toLocaleString()}</strong>
                    </p>

                    <p>
                      <strong>Type:</strong> {refund.adjustment_type}
                    </p>

                    <p>
                      <strong>Reason:</strong> {refund.reason}
                    </p>

                    <p className="wrap-break-word">
                      <strong>Customer Message:</strong>{" "}
                      {refund.customer_message || "-"}
                    </p>

                    <p className="wrap-break-word">
                      <strong>Admin Note:</strong> {refund.admin_note || "-"}
                    </p>

                    <p className="text-xs text-neutral-500 mt-2">
                      {new Date(refund.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Rejections */}
          {order.payment_rejections?.length > 0 && (
            <div className="space-y-8 p-4 border border-red-300 bg-red-50 rounded-xl">
              <h3 className="font-bold text-red-700 mb-4">
                Payment Rejection History
              </h3>

              <div className="space-y-4">
                {order.payment_rejections.map((rejection) => (
                  <div
                    key={rejection.id}
                    className="border-b last:border-0 pb-3 last:pb-0"
                  >
                    <p>
                      <strong>Reason:</strong> {rejection.rejection_reason}
                    </p>

                    <p>
                      <strong>Customer Message:</strong>{" "}
                      {rejection.customer_message}
                    </p>

                    <p>
                      <strong>Admin Note:</strong> {rejection.admin_note || "-"}
                    </p>

                    <p className="text-xs text-neutral-500 mt-2">
                      {new Date(rejection.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Refund Action */}
        {!hideRefundButton && (
          <div className="space-y-8 border-t pt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {order.financialSummary?.refundableBalance > 0 ? (
              <button
                onClick={() => onRefund(order)}
                className="w-full sm:w-auto rounded-lg bg-red-600 px-5 py-2 font-medium text-white hover:bg-red-700"
              >
                Issue Refund
              </button>
            ) : (
              <span className="w-full sm:w-auto rounded-lg bg-green-100 px-5 py-2 text-center font-medium text-green-700">
                Fully Refunded
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
