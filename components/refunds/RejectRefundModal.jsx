"use client";

import { useEffect, useState } from "react";

export default function RejectRefundModal({
  type = "appointments",
  refund,
  isOpen,
  loading = false,
  onClose,
  onSubmit,
}) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [error, setError] = useState("");

  const isAppointment = type === "appointments";

  const customer = isAppointment
    ? refund?.appointment?.user
    : refund?.order?.user;

  const title = isAppointment
    ? refund?.appointment?.service_name
    : "Order Refund";

  const requestedAmount = Number(
    refund?.requested_amount ?? refund?.approved_amount ?? refund?.amount ?? 0,
  );

  useEffect(() => {
    if (!isOpen) return;

    setRejectionReason("");
    setAdminNote("");
    setError("");
  }, [isOpen]);

  if (!isOpen || !refund) return null;

  function handleSubmit(e) {
    e.preventDefault();

    if (!rejectionReason.trim()) {
      setError("Rejection reason is required.");
      return;
    }

    onSubmit({
      refundRequestId: refund.id,
      rejectionReason: rejectionReason.trim(),
      adminNote: adminNote.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-5">
      <div
        className="
          w-full max-w-2xl
          max-h-[95vh]
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
          flex
          flex-col
        "
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-white px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-red-700 sm:text-2xl">
                Reject Refund Request
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Explain why this refund request is being rejected.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                rounded-lg
                border
                px-3
                py-2
                text-sm
                hover:bg-gray-100
                disabled:opacity-50
              "
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6"
        >
          {/* Refund Summary */}
          <div className="rounded-2xl border bg-gray-50 p-4">
            <h3 className="mb-4 text-base font-semibold sm:text-lg">
              Refund Information
            </h3>

            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-gray-500">Customer</p>
                <p className="font-medium">{customer?.name || "N/A"}</p>
              </div>

              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-medium break-all">
                  {customer?.email || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">
                  {isAppointment ? "Service" : "Order"}
                </p>

                <p className="font-medium">
                  {isAppointment
                    ? title
                    : refund?.order?.id
                      ? `#${refund.order.id.slice(0, 8)}`
                      : "N/A"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Requested Amount</p>

                <p className="font-semibold text-red-600">
                  ₦{requestedAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Rejection Reason */}
          <div>
            <label className="mb-2 block text-sm font-semibold sm:text-base">
              Rejection Reason
              <span className="ml-1 text-red-500">*</span>
            </label>

            <textarea
              rows={5}
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);

                if (error) setError("");
              }}
              disabled={loading}
              placeholder="Explain why this refund request is being rejected..."
              className="
                w-full
                rounded-xl
                border
                px-4
                py-3
                resize-none
                focus:outline-none
                focus:ring-2
                focus:ring-red-500
                disabled:bg-gray-100
              "
            />
          </div>

          {/* Admin Note */}
          <div>
            <label className="mb-2 block text-sm font-semibold sm:text-base">
              Internal Admin Note
              <span className="ml-2 text-xs font-normal text-gray-500">
                (Optional)
              </span>
            </label>

            <textarea
              rows={4}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              disabled={loading}
              placeholder="Visible only to administrators..."
              className="
                w-full
                rounded-xl
                border
                px-4
                py-3
                resize-none
                focus:outline-none
                focus:ring-2
                focus:ring-red-500
                disabled:bg-gray-100
              "
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Warning */}
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <h4 className="font-semibold text-yellow-800">
              Customer Notification
            </h4>

            <p className="mt-2 text-sm text-yellow-700">
              The rejection reason entered above will be visible to the
              customer. Please ensure it is clear, professional, and explains
              why the refund request cannot be approved.
            </p>
          </div>

          {/* Footer */}
          <div
            className="
              flex
              flex-col-reverse
              gap-3
              border-t
              pt-6
              sm:flex-row
              sm:justify-end
            "
          >
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="
                w-full
                rounded-xl
                border
                px-5
                py-3
                hover:bg-gray-100
                disabled:opacity-50
                sm:w-auto
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                rounded-xl
                bg-red-600
                px-5
                py-3
                font-medium
                text-white
                transition
                hover:bg-red-700
                disabled:cursor-not-allowed
                disabled:opacity-50
                sm:w-auto
              "
            >
              {loading ? "Rejecting..." : "Reject Refund Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
