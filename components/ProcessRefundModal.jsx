"use client";

import { useEffect, useState } from "react";

export default function ProcessRefundModal({
  type = "appointments",
  refund,
  isOpen,
  loading,
  onClose,
  onSubmit,
}) {
  const [action, setAction] = useState("approve");
  const [refundMethod, setRefundMethod] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [refundReference, setRefundReference] = useState("");
  const [errors, setErrors] = useState({});
  const [approvedAmount, setApprovedAmount] = useState("");

  const isAppointment = type === "appointments";

  const customer = isAppointment
    ? refund?.appointment?.user
    : refund?.order?.user;

  const service = isAppointment
    ? refund?.appointment?.service_name
    : "Order Refund";

  const refundAmount = isAppointment
    ? refund?.amount
    : refund?.requested_amount;

  const requestedAmount = Number(
    isAppointment ? (refund?.amount ?? 0) : (refund?.requested_amount ?? 0),
  );

  /*
  ==========================================
  Reset Form
  ==========================================
  */
  useEffect(() => {
    if (!isOpen || !refund) return;

    setAction("approve");
    setRefundMethod("");
    setAdminNote("");
    setRefundReference("");

    setApprovedAmount(
      String(
        isAppointment ? (refund.amount ?? 0) : (refund.requested_amount ?? 0),
      ),
    );

    setErrors({});
  }, [isOpen, refund, isAppointment]);

  /*
  ==========================================
  Validation
  ==========================================
  */
  function validate() {
    const newErrors = {};

    const requestedAmount = Number(
      isAppointment ? refund.amount : refund.requested_amount,
    );

    const approved = Number(approvedAmount);

    if (!isAppointment && action === "approve") {
      if (Number.isNaN(approved)) {
        newErrors.approvedAmount = "Enter a valid amount.";
      } else if (approved <= 0) {
        newErrors.approvedAmount = "Approved amount must be greater than zero.";
      } else if (approved > requestedAmount) {
        newErrors.approvedAmount =
          "Approved amount cannot exceed the requested amount.";
      }
    }

    if (isAppointment || action === "approve") {
      if (!refundMethod) {
        newErrors.refundMethod = "Please select a refund method.";
      }
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

    if (!validate()) return;

    const payload = {
      refundRequestId: refund.id,
      action,
      approvedAmount: action === "approve" ? Number(approvedAmount) : null,
      refundMethod: action === "approve" ? refundMethod : null,
      refundReference: action === "approve" ? refundReference.trim() : null,
      adminNote: adminNote.trim(),
    };

    console.log(payload);

    onSubmit(payload);
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
                {isAppointment ? "Process Refund" : "Review Refund Request"}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {isAppointment
                  ? "Confirm that this refund has been issued."
                  : "Approve or reject this refund request."}
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

                <p className="font-medium">{customer?.name || "N/A"}</p>
              </div>

              <div>
                <p className="text-gray-500">Email</p>

                <p className="font-medium break-all">
                  {customer?.email || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Service</p>

                <p className="font-medium">{service || "N/A"}</p>
              </div>

              <div>
                <div>
                  <p className="text-gray-500">
                    {isAppointment ? "Appointment" : "Order"}
                  </p>

                  <p className="font-medium">
                    {isAppointment
                      ? refund?.appointment?.appointment_date
                        ? new Date(
                            refund.appointment.appointment_date,
                          ).toLocaleDateString()
                        : "-"
                      : refund?.order?.id
                        ? `#${refund.order.id.slice(0, 8)}`
                        : "-"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Requested Amount</span>

                  <span className="font-semibold text-red-600">
                    ₦{requestedAmount.toLocaleString()}
                  </span>
                </div>

                {!isAppointment && action === "approve" && (
                  <>
                    <div>
                      <label className="block mb-2 font-medium">
                        Approved Amount
                      </label>

                      <input
                        type="number"
                        min="0"
                        max={requestedAmount}
                        value={approvedAmount}
                        onChange={(e) => setApprovedAmount(e.target.value)}
                        className="w-full rounded-xl border px-4 py-3"
                      />

                      {errors.approvedAmount && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.approvedAmount}
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl bg-neutral-50 p-3 text-sm">
                      <div className="flex justify-between">
                        <span>Difference</span>

                        <span>
                          ₦
                          {Math.max(
                            requestedAmount - Number(approvedAmount || 0),
                            0,
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div>
                <p className="text-gray-500">Requested</p>

                <p className="font-medium">
                  {refund?.created_at
                    ? new Date(refund.created_at).toLocaleString()
                    : "-"}
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

          {/*Approve / Reject section (orders only) */}
          {!isAppointment && (
            <div className="border rounded-2xl p-5">
              <h3 className="font-semibold text-lg mb-4">Decision</h3>

              <div className="grid grid-cols-2 gap-3">
                <label className="border rounded-xl p-3 flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value="approve"
                    checked={action === "approve"}
                    onChange={(e) => setAction(e.target.value)}
                  />
                  Approve Refund
                </label>

                <label className="border rounded-xl p-3 flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value="reject"
                    checked={action === "reject"}
                    onChange={(e) => setAction(e.target.value)}
                  />
                  Reject Request
                </label>
              </div>
            </div>
          )}

          {/* Refund Method */}
          {(isAppointment || action === "approve") && (
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
                <p className="mt-2 text-sm text-red-600">
                  {errors.refundMethod}
                </p>
              )}
            </div>
          )}

          {(isAppointment || action === "approve") && (
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
          )}

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
          {!isAppointment &&
          action === "approve" &&
          Number(approvedAmount) < requestedAmount ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-700">
                This request will be partially approved. The customer requested
                <strong> ₦{requestedAmount.toLocaleString()}</strong> but only
                <strong>
                  {" "}
                  ₦{Number(approvedAmount).toLocaleString()}
                </strong>{" "}
                will be refunded.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm text-yellow-700">
                {isAppointment
                  ? "This will mark the refund as completed."
                  : action === "approve"
                    ? "This refund request will be approved and processed."
                    : "This refund request will be rejected."}
              </p>
            </div>
          )}

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
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-red-600 text-white"
            >
              {loading
                ? "Processing..."
                : isAppointment
                  ? "Mark Refund as Processed"
                  : action === "approve"
                    ? "Approve Refund"
                    : "Reject Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
