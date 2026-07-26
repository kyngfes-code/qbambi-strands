"use client";

import { useEffect, useState } from "react";

export default function AppointmentRefundRequestModal({
  appointment,
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) {
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [customerMessage, setCustomerMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRefundAmount("");
      setRefundReason("");
      setCustomerMessage("");
      setConfirmed(false);
      setError("");
    }
  }, [isOpen, appointment]);

  if (!isOpen || !appointment) return null;

  const details = appointment.appointment;
  const financial = appointment.financial_summary;
  const existingRefunds = appointment.refund_requests ?? [];

  const amountPaid = Number(details.amount_paid || 0);

  const refundedAmount = Number(details.refunded_amount || 0);

  const refundable = Math.max(amountPaid - refundedAmount, 0);

  const pendingRequest = existingRefunds.find((r) => r.status === "pending");

  /*
  =====================================================
  Existing Pending Request
  =====================================================
  */

  if (pendingRequest) {
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
        <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
          <div className="border-b p-6">
            <h2 className="text-2xl font-bold text-orange-600">
              Refund Request Submitted
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              You already have a refund request awaiting review.
            </p>
          </div>

          <div className="space-y-4 p-6">
            <div className="rounded-xl border bg-neutral-50 p-4">
              <p>
                <strong>Status:</strong>{" "}
                <span className="capitalize">{pendingRequest.status}</span>
              </p>

              <p className="mt-2">
                <strong>Requested Amount:</strong> ₦
                {Number(pendingRequest.requested_amount).toLocaleString()}
              </p>

              <p className="mt-2">
                <strong>Submitted:</strong>{" "}
                {new Date(pendingRequest.created_at).toLocaleString()}
              </p>

              <p className="mt-2">
                <strong>Reason:</strong> {pendingRequest.reason}
              </p>

              {pendingRequest.admin_message && (
                <div className="mt-4 rounded-lg border bg-blue-50 p-3">
                  <p className="font-medium">Admin Response</p>

                  <p className="mt-2 text-sm">{pendingRequest.admin_message}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button onClick={onClose} className="rounded-lg border px-5 py-2">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
  =====================================================
  No Refundable Balance
  =====================================================
  */

  if (refundable <= 0) {
    return null;
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
      setError("Please provide a refund reason.");
      return;
    }

    onSubmit({
      appointmentId: details.id,
      requestedAmount: amount,
      reason: refundReason.trim(),
      customerMessage: customerMessage.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/60 backdrop-blur-sm px-4 py-8">
      <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}

        <div className="sticky top-0 rounded-t-2xl border-b bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-orange-600">
                Request Appointment Refund
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Submit a refund request for this appointment.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border px-4 py-2 hover:bg-neutral-50"
            >
              Close
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Appointment */}

          <div className="rounded-2xl border p-5">
            <h3 className="mb-4 text-lg font-semibold">
              Appointment Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-neutral-500">Service</p>

                <p className="font-semibold">{details.service_name}</p>
              </div>

              <div>
                <p className="text-sm text-neutral-500">Appointment Date</p>

                <p className="font-semibold">
                  {new Date(details.appointment_date).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-neutral-500">Status</p>

                <p className="font-semibold capitalize">{details.status}</p>
              </div>

              <div>
                <p className="text-sm text-neutral-500">Appointment ID</p>

                <p className="font-semibold">#{details.id.slice(0, 8)}</p>
              </div>
            </div>
          </div>

          {/* Financial */}

          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-xl border p-4">
              <p className="text-sm text-neutral-500">Total Paid</p>

              <p className="text-xl font-bold text-green-600">
                ₦{Number(amountPaid).toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-sm text-neutral-500">Refunded</p>

              <p className="text-xl font-bold text-red-600">
                ₦{Number(refundedAmount).toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-sm text-neutral-500">Refundable</p>

              <p className="text-xl font-bold text-blue-600">
                ₦{refundable.toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl border bg-green-50 p-4">
              <p className="text-sm text-neutral-500">Net Paid</p>

              <p className="text-xl font-bold text-green-700">
                ₦{Number(amountPaid - refundedAmount).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Amount */}

          <div>
            <label className="mb-2 block font-medium">Refund Amount</label>

            <input
              type="number"
              min="1"
              step="0.01"
              value={refundAmount}
              disabled={loading}
              onChange={(e) => setRefundAmount(e.target.value)}
              className="w-full rounded-xl border px-4 py-3"
            />

            <p className="mt-2 text-sm text-neutral-500">
              Maximum refundable amount: ₦{refundable.toLocaleString()}
            </p>
          </div>

          {/* Reason */}

          <div>
            <label className="mb-2 block font-medium">Reason</label>

            <textarea
              rows={4}
              value={refundReason}
              disabled={loading}
              onChange={(e) => setRefundReason(e.target.value)}
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>

          {/* Customer Message */}

          <div>
            <label className="mb-2 block font-medium">
              Additional Information (Optional)
            </label>

            <textarea
              rows={4}
              value={customerMessage}
              disabled={loading}
              onChange={(e) => setCustomerMessage(e.target.value)}
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3 rounded-xl border p-4">
            <input
              type="checkbox"
              checked={confirmed}
              disabled={loading}
              onChange={(e) => setConfirmed(e.target.checked)}
            />

            <label className="text-sm">
              I understand that submitting this request does not guarantee a
              refund. My request will be reviewed according to QBambi Strands'
              refund policy.
            </label>
          </div>

          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
            Refund requests are reviewed by our support team. You will receive
            an update once the review has been completed.
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
              disabled={!confirmed || loading}
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
