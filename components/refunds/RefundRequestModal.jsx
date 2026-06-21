"use client";

import { useEffect, useState } from "react";

export default function RefundRequestModal({
  appointment,
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) {
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRefundAmount("");
      setRefundReason("");
      setAdminNote("");
      setError("");
    }
  }, [isOpen, appointment]);

  if (!isOpen || !appointment) return null;

  const maxRefundable = Number(appointment.amount_paid || 0);

  function handleSubmit(e) {
    e.preventDefault();

    setError("");

    const amount = Number(refundAmount);

    if (!amount || amount <= 0) {
      setError("Enter a valid refund amount.");
      return;
    }

    if (amount > maxRefundable) {
      setError(
        `Refund amount cannot exceed ₦${maxRefundable.toLocaleString()}.`,
      );
      return;
    }

    if (!refundReason.trim()) {
      setError("Refund reason is required.");
      return;
    }

    onSubmit({
      appointmentId: appointment.id,
      refundAmount: amount,
      refundReason: refundReason.trim(),
      adminNote: adminNote.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center px-3 py-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        {/* Header */}

        <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-orange-600">
                Create Refund Request
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Submit a refund request for this appointment.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3 py-2 border rounded-lg hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Appointment Summary */}

          <div className="border rounded-2xl p-5">
            <h3 className="font-semibold text-lg mb-4">
              Appointment Information
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500">Customer</p>
                <p className="font-medium">{appointment.user?.name || "N/A"}</p>
              </div>

              <div>
                <p className="text-gray-500">Service</p>
                <p className="font-medium">{appointment.service_name}</p>
              </div>

              <div>
                <p className="text-gray-500">Service Amount</p>
                <p className="font-medium">
                  ₦{Number(appointment.service_amount || 0).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Amount Paid</p>
                <p className="font-medium text-green-700">
                  ₦{Number(appointment.amount_paid || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Refund Amount */}

          <div>
            <label className="block font-medium mb-2">Refund Amount</label>

            <input
              type="number"
              min="1"
              step="0.01"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
              disabled={loading}
            />

            <p className="text-sm text-gray-500 mt-2">
              Maximum refundable amount: ₦{maxRefundable.toLocaleString()}
            </p>
          </div>

          {/* Refund Reason */}

          <div>
            <label className="block font-medium mb-2">Refund Reason</label>

            <textarea
              rows={4}
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
              placeholder="Reason for refund..."
              disabled={loading}
            />
          </div>

          {/* Admin Note */}

          <div>
            <label className="block font-medium mb-2">
              Internal Admin Note
            </label>

            <textarea
              rows={4}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
              placeholder="Optional internal note..."
              disabled={loading}
            />
          </div>

          {/* Error */}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700">
              {error}
            </div>
          )}

          {/* Warning */}

          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
            <p className="text-sm text-orange-700">
              Creating a refund request will place this refund into the Refund
              Dashboard queue for review and processing. No money will be
              deducted until the refund is processed.
            </p>
          </div>

          {/* Footer */}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-3 border rounded-xl"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700"
            >
              {loading ? "Creating Request..." : "Create Refund Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
