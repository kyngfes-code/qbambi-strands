"use client";

import { useEffect, useState } from "react";

export default function ProcessRefundModal({
  refund,
  isOpen,
  loading = false,
  onClose,
  onSubmit,
}) {
  const [refundMethod, setRefundMethod] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [refundReference, setRefundReference] = useState("");
  const [errors, setErrors] = useState({});

  /*
  ==========================================
  Reset Form
  ==========================================
  */
  useEffect(() => {
    if (isOpen && refund) {
      setRefundMethod("");
      setAdminNote("");
      setRefundReference("");
      setErrors({});
    }
  }, [isOpen, refund]);

  if (!isOpen || !refund) {
    return null;
  }

  /*
  ==========================================
  Validation
  ==========================================
  */
  function validate() {
    const newErrors = {};

    if (!refundMethod) {
      newErrors.refundMethod = "Please select a refund method.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  /*
  ==========================================
  Submit
  ==========================================
  */
  function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit({
      refundId: refund.id,
      refundMethod,
      refundReference: refundReference.trim(),
      adminNote: adminNote.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center px-3 py-4 sm:px-5">
      <div
        className="
          bg-white rounded-2xl shadow-2xl
          w-full max-w-2xl
          max-h-[95vh]
          overflow-y-auto
        "
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 rounded-t-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-red-700">
                Process Refund
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Confirm that this refund has been issued to the customer.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                px-3 py-2
                rounded-lg border
                hover:bg-gray-100
                disabled:opacity-50
              "
            >
              Close
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* Refund Summary */}
          <div className="border rounded-2xl p-5">
            <h3 className="font-semibold text-lg mb-4">Refund Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Customer</p>

                <p className="font-medium">
                  {refund.appointment?.user?.name || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Email</p>

                <p className="font-medium break-all">
                  {refund.appointment?.user?.email || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Service</p>

                <p className="font-medium">
                  {refund.appointment?.service_name || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Appointment</p>

                <p className="font-medium">
                  {refund.appointment?.appointment_date
                    ? new Date(
                        refund.appointment.appointment_date,
                      ).toLocaleDateString()
                    : "-"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Refund Amount</p>

                <p className="font-semibold text-red-600">
                  ₦{Number(refund.amount || 0).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Requested</p>

                <p className="font-medium">
                  {new Date(refund.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            {refund.reason && (
              <div className="mt-4 bg-gray-50 rounded-xl p-3">
                <p className="text-sm text-gray-500 mb-1">Refund Reason</p>

                <p className="text-sm whitespace-pre-wrap">{refund.reason}</p>
              </div>
            )}
          </div>

          {/* Refund Method */}
          <div className="border rounded-2xl p-5">
            <h3 className="font-semibold text-lg mb-4">Refund Method</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  value: "bank_transfer",
                  label: "Bank Transfer",
                },
                {
                  value: "cash",
                  label: "Cash",
                },
                {
                  value: "pos",
                  label: "POS",
                },
                {
                  value: "other",
                  label: "Other",
                },
              ].map((method) => (
                <label
                  key={method.value}
                  className="
                    flex items-center gap-3
                    border rounded-xl
                    p-3 cursor-pointer
                  "
                >
                  <input
                    type="radio"
                    name="refundMethod"
                    value={method.value}
                    checked={refundMethod === method.value}
                    onChange={(e) => setRefundMethod(e.target.value)}
                    disabled={loading}
                  />

                  <span>{method.label}</span>
                </label>
              ))}
            </div>

            {errors.refundMethod && (
              <p className="mt-2 text-sm text-red-600">{errors.refundMethod}</p>
            )}
          </div>
          <div>
            <label className="block font-medium mb-2">
              Refund Reference
              <span className="text-sm text-gray-500 ml-2">(Optional)</span>
            </label>

            <input
              type="text"
              value={refundReference}
              onChange={(e) => setRefundReference(e.target.value)}
              disabled={loading}
              placeholder="Bank transfer reference, receipt number, etc."
              className="
      w-full rounded-xl border
      px-4 py-3
      focus:outline-none
      focus:ring-2 focus:ring-red-500
    "
            />
          </div>

          {/* Admin Note */}
          <div>
            <label className="block font-medium mb-2">
              Processing Note
              <span className="text-sm text-gray-500 ml-2">(Optional)</span>
            </label>

            <textarea
              rows={4}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              disabled={loading}
              placeholder="Add a note about this refund..."
              className="
                w-full rounded-xl border
                px-4 py-3 resize-none
                focus:outline-none
                focus:ring-2 focus:ring-red-500
              "
            />
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <p className="text-sm text-yellow-700">
              <strong>Warning:</strong> This action marks the refund as
              completed and removes it from the refund queue.
            </p>
          </div>

          {/* Footer */}
          <div
            className="
              flex flex-col-reverse gap-3
              sm:flex-row sm:justify-end
            "
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                w-full sm:w-auto
                px-5 py-3
                rounded-xl border
                hover:bg-gray-100
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                w-full sm:w-auto
                px-5 py-3
                rounded-xl
                bg-red-600 text-white
                hover:bg-red-700
                disabled:opacity-50
              "
            >
              {loading ? "Processing..." : "Mark Refund as Processed"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
