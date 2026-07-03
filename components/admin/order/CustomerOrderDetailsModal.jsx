"use client";

export default function CustomerOrderDetailsModal({
  order,
  onClose,
  onRequestRefund,
}) {
  if (!order) return null;

  const financial = order.financialSummary ?? {};

  const canRequestRefund =
    order.status === "delivered" &&
    financial.refundableBalance > 0 &&
    !order.refundRequest;

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    delivered: "bg-blue-100 text-blue-800",
    cancelled: "bg-gray-200 text-gray-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-xl bg-white shadow-xl">
        {/* Header */}

        <div className="border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Order #{order.id.slice(0, 8)}</h2>

            <span
              className={`inline-block mt-2 rounded-full px-3 py-1 text-sm font-medium ${
                statusColor[order.status] ?? "bg-neutral-100"
              }`}
            >
              {order.status}
            </span>
          </div>

          <button
            onClick={onClose}
            className="border rounded-lg px-4 py-2 hover:bg-neutral-100"
          >
            Close
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Financial */}

          <section className="border rounded-xl p-5 bg-neutral-50">
            <h3 className="font-semibold text-lg mb-4">Financial Summary</h3>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-neutral-500">Total Paid</p>

                <p className="text-xl font-bold text-green-600">
                  ₦{Number(financial.totalPaid ?? 0).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-neutral-500">Refunded</p>

                <p className="text-xl font-bold text-red-600">
                  ₦{Number(financial.refundedAmount ?? 0).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-neutral-500">Refundable Balance</p>

                <p className="text-xl font-bold text-blue-600">
                  ₦{Number(financial.refundableBalance ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
          </section>

          {/* Items */}

          <section>
            <h3 className="font-semibold text-lg mb-4">Order Items</h3>

            <div className="space-y-4">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex gap-4 border rounded-xl p-4">
                  <img
                    src={item.store?.image}
                    className="w-24 h-24 rounded object-cover"
                  />

                  <div className="flex-1">
                    <p className="font-semibold">{item.store?.title}</p>

                    <p>Qty: {item.quantity}</p>

                    <p>₦{Number(item.price).toLocaleString()}</p>

                    <p className="font-medium">
                      ₦
                      {(
                        Number(item.price) * Number(item.quantity)
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Refund History */}

          {order.refunds?.length > 0 && (
            <section className="border rounded-xl p-5 bg-red-50">
              <h3 className="font-semibold mb-4">Refund History</h3>

              <div className="space-y-3">
                {order.refunds.map((refund) => (
                  <div
                    key={refund.id}
                    className="rounded-lg bg-white border p-4"
                  >
                    <p className="font-semibold text-red-600">
                      ₦{Number(refund.amount).toLocaleString()}
                    </p>

                    <p>{refund.reason}</p>

                    <p className="text-sm text-neutral-500">
                      {new Date(refund.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Refund Request */}

          {order.refundRequest && (
            <section className="border rounded-xl p-5 bg-blue-50">
              <h3 className="font-semibold mb-4">Refund Request</h3>

              <p>
                Status:
                <strong className="ml-2">{order.refundRequest.status}</strong>
              </p>

              <p className="mt-2">
                Requested Amount:
                <strong>
                  {" "}
                  ₦
                  {Number(
                    order.refundRequest.requested_amount,
                  ).toLocaleString()}
                </strong>
              </p>

              <p className="mt-2">Reason: {order.refundRequest.reason}</p>

              {order.refundRequest.admin_message && (
                <p className="mt-3 text-red-700">
                  {order.refundRequest.admin_message}
                </p>
              )}
            </section>
          )}
        </div>

        {/* Footer */}

        <div className="border-t p-6 flex justify-end gap-3">
          {canRequestRefund ? (
            <button
              onClick={() => onRequestRefund(order)}
              className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
            >
              Request Refund
            </button>
          ) : order.refundRequest ? (
            <button
              disabled
              className="rounded-lg bg-neutral-300 px-5 py-2 text-neutral-600 cursor-not-allowed"
            >
              Refund Request Submitted
            </button>
          ) : null}

          <button onClick={onClose} className="rounded-lg border px-5 py-2">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
