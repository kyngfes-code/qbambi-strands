"use client";

import { useEffect, useState } from "react";

export default function OrderRefundRequestModal({
  order,
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) {
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [customerMessage, setCustomerMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const colors = {
    order_created: "bg-blue-500",
    payment: "bg-green-500",
    refund_pending: "bg-yellow-500",
    refund: "bg-red-500",
  };

  useEffect(() => {
    if (isOpen) {
      setRefundAmount("");
      setRefundReason("");
      setCustomerMessage("");
      setError("");
      setConfirmed(false);
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const financial = order.financialSummary ?? {};
  const refundable = Number(financial.refundableBalance ?? 0);

  if (refundable <= 0 && !order.refundRequest) {
    return null;
  }

  if (order.refundRequest) {
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
          <h2 className="text-xl font-bold text-orange-600">
            Refund Request Already Submitted
          </h2>

          <p className="mt-4 text-neutral-600">
            You already have a refund request for this order.
          </p>

          <div className="mt-6 rounded-xl border bg-neutral-50 p-4">
            <p>
              <strong>Status:</strong> {order.refundRequest.status}
            </p>

            <p className="mt-2">
              <strong>Requested Amount:</strong> ₦
              {Number(order.refundRequest.requested_amount).toLocaleString()}
            </p>

            <p className="mt-2">
              <strong>Submitted:</strong>{" "}
              {new Date(order.refundRequest.created_at).toLocaleString()}
            </p>

            <p className="mt-2">
              <strong>Reason:</strong> {order.refundRequest.reason}
            </p>
            {order.refundRequest.admin_message && (
              <div className="mt-4 rounded-lg bg-blue-50 border p-3">
                <p className="font-medium">Support Response</p>
                <p className="mt-1 text-sm">
                  {order.refundRequest.admin_message}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={onClose} className="rounded-lg border px-5 py-2">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  function handleSubmit(e) {
    e.preventDefault();

    setError("");

    const amount = Number(refundAmount);

    if (!amount || amount <= 0) {
      setError("Enter a valid refund amount.");
      return;
    }

    if (amount > refundable) {
      setError(`Refund amount cannot exceed ₦${refundable.toLocaleString()}.`);
      return;
    }

    if (!refundReason.trim()) {
      setError("Please provide a reason for your refund request.");
      return;
    }

    onSubmit({
      orderId: order.id,
      requestedAmount: amount,
      reason: refundReason.trim(),
      customerMessage: customerMessage.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm px-3 py-4">
      <div className="w-full max-w-3xl max-h-[95vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}

        <div className="sticky top-0 rounded-t-2xl border-b bg-white px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-orange-600">
                Request Refund
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Submit a refund request for this order.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border px-3 py-2 hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Order Summary */}

          <div className="rounded-2xl border p-5">
            <h3 className="mb-4 text-lg font-semibold">Order Information</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-gray-500">Customer</p>

                <p className="font-medium">{order.customer?.name ?? "N/A"}</p>
              </div>

              <div>
                <p className="text-gray-500">Order Number</p>

                <p className="font-medium">#{order.id.slice(0, 8)}</p>
              </div>

              <div>
                <p className="text-gray-500">Order Date</p>

                <p className="font-medium">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Status</p>

                <p className="font-medium capitalize">{order.status}</p>
              </div>
            </div>
          </div>

          {/* Items */}

          <div className="rounded-2xl border p-5">
            <h3 className="mb-4 text-lg font-semibold">Purchased Items</h3>

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
          </div>

          {/* Financial Summary */}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border p-4">
              <p className="text-sm text-neutral-500">Total Paid</p>
              <p className="text-xl font-bold text-green-600">
                ₦
                {Number(
                  order.financialSummary?.totalPaid ?? 0,
                ).toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-sm text-neutral-500">Refunded</p>
              <p className="text-xl font-bold text-red-600">
                ₦
                {Number(
                  order.financialSummary?.refundedAmount ?? 0,
                ).toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-sm text-neutral-500">Refundable Balance</p>
              <p className="text-xl font-bold text-blue-600">
                ₦
                {Number(
                  order.financialSummary?.refundableBalance ?? 0,
                ).toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl border bg-green-50 p-4">
              <p className="text-sm text-neutral-500">Net Received</p>
              <p className="text-xl font-bold text-green-700">
                ₦
                {Number(
                  order.financialSummary?.netReceived ?? 0,
                ).toLocaleString()}
              </p>
            </div>
          </div>

          {order.refunds?.length > 0 && (
            <div className="rounded-2xl border p-5">
              <h3 className="mb-4 text-lg font-semibold">Previous Refunds</h3>

              <div className="space-y-3">
                {order.refunds.map((refund) => (
                  <div
                    key={refund.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium">
                        ₦{Number(refund.amount).toLocaleString()}
                      </p>

                      <p className="text-sm text-neutral-500">
                        {refund.reason}
                      </p>
                    </div>

                    <p className="text-sm text-neutral-500">
                      {new Date(refund.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/*timeline */}
          <div className="rounded-2xl border p-5">
            <h3 className="mb-4 text-lg font-semibold">Order Activity</h3>

            <div className="space-y-4">
              {order.timeline?.length ? (
                order.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div
                      className={`mt-1 h-3 w-3 rounded-full ${
                        colors[event.type] ?? "bg-neutral-400"
                      }`}
                    />

                    <div>
                      <p className="font-medium capitalize">
                        {event.type.replaceAll("_", " ")}
                      </p>

                      {event.amount && (
                        <p className="text-sm">
                          ₦{Number(event.amount).toLocaleString()}
                        </p>
                      )}

                      <p className="text-xs text-neutral-500">
                        {new Date(event.created_at).toLocaleString()}
                      </p>

                      {event.payment_method && (
                        <p className="text-xs text-neutral-500">
                          Paid via {event.payment_method}
                        </p>
                      )}

                      {event.refund_method && (
                        <p className="text-xs text-neutral-500">
                          Refunded via {event.refund_method}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-500">
                  No activity available.
                </p>
              )}
            </div>
          </div>

          {/* Refund Amount */}

          <div>
            <label className="mb-2 block font-medium">Refund Amount</label>

            <input
              type="number"
              min="1"
              step="0.01"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              className="w-full rounded-xl border px-4 py-3"
              disabled={loading}
            />

            <p className="mt-2 text-sm text-gray-500">
              Maximum refundable amount: ₦{refundable.toLocaleString()}
            </p>
          </div>

          {/* Reason */}

          <div>
            <label className="mb-2 block font-medium">Reason for Refund</label>

            <textarea
              rows={4}
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="w-full rounded-xl border px-4 py-3"
              placeholder="Tell us why you are requesting a refund..."
              disabled={loading}
            />
          </div>

          {/* Additional Details */}

          <div>
            <label className="mb-2 block font-medium">
              Additional Information (Optional)
            </label>

            <textarea
              rows={4}
              value={customerMessage}
              onChange={(e) => setCustomerMessage(e.target.value)}
              className="w-full rounded-xl border px-4 py-3"
              placeholder="Add any extra information that may help us review your request."
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
              {error}
            </div>
          )}
          <div className="flex items-start gap-3 rounded-xl border p-4">
            <input
              type="checkbox"
              disabled={loading}
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1"
            />

            <label className="text-sm">
              I understand that submitting this refund request does not
              guarantee approval. My request will be reviewed according to
              QBambi Strands' refund policy.
            </label>
          </div>

          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
            <p className="text-sm text-orange-700">
              Your refund request will be reviewed by our team. If approved,
              your refund will be processed and you'll be notified of the
              outcome.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border px-5 py-3"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || refundable <= 0 || !confirmed}
              className="rounded-xl bg-orange-600 px-5 py-3 text-white hover:bg-orange-700"
            >
              {loading ? "Submitting..." : "Submit Refund Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
