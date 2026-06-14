"use client";

import { useEffect, useState } from "react";
import RefundSection from "../RefundSection";
import TipSection from "../TipSection";
import AdditionalPaymentSection from "../AdditionalPaymentSection";
import AdminNoteField from "../AdminNoteField";
import AppointmentDetailsContent from "./AppointmentDetailsContent";

export default function CompleteAppointmentModal({
  appointment,
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) {
  const [completionType, setCompletionType] = useState("normal");
  const [amountReceivedToday, setAmountReceivedToday] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [tipAmount, setTipAmount] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [errors, setErrors] = useState({});

  const PAYMENT_METHODS = [
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
  ];
  /*
  ==========================================
  Reset form whenever modal opens
  ==========================================
  */
  useEffect(() => {
    if (isOpen && appointment) {
      setCompletionType("normal");
      setAmountReceivedToday("");
      setPaymentMethod("");
      setAdminNote("");
      setTipAmount("");
      setRefundAmount("");
      setRefundReason("");
      setErrors({});
    }
  }, [isOpen, appointment]);

  useEffect(() => {
    if (completionType !== "additional_payment") {
      setAmountReceivedToday("");
    }

    if (completionType !== "additional_payment") {
      setPaymentMethod("");
    }

    if (completionType !== "refund_pending") {
      setRefundAmount("");
      setRefundReason("");
    }
  }, [completionType]);

  if (!isOpen || !appointment) {
    return null;
  }

  /*
  ==========================================
  Existing appointment values
  ==========================================
  */

  const serviceAmount = Number(appointment.service_amount || 0);

  const currentAmountPaid = Number(appointment.amount_paid || 0);

  const currentBalanceDue = Math.max(serviceAmount - currentAmountPaid, 0);

  /*
  ==========================================
  Today's payment
  ==========================================
  */

  const receivedToday =
    completionType === "additional_payment"
      ? Number(amountReceivedToday || 0)
      : 0;

  /*
  ==========================================
  Validation
  ==========================================
  */

  function validateForm() {
    const newErrors = {};

    if (receivedToday < 0) {
      newErrors.amountReceivedToday = "Amount received cannot be negative.";
    }

    if (receivedToday > currentBalanceDue) {
      newErrors.amountReceivedToday =
        "Amount received cannot exceed outstanding balance.";
    }

    if (completionType === "additional_payment" && receivedToday <= 0) {
      newErrors.amountReceivedToday = "Enter the amount received.";
    }

    if (appointment.status !== "confirmed") {
      newErrors.general = "Only confirmed appointments can be completed.";
    }
    /*
   
    Only require payment method if money was received.
    */

    if (receivedToday > 0 && !paymentMethod) {
      newErrors.paymentMethod = "Please select a payment method.";
    }

    if (completionType === "tip_received" && Number(tipAmount) <= 0) {
      newErrors.tipAmount = "Enter tip amount.";
    }

    if (completionType === "tip_received" && !paymentMethod) {
      newErrors.paymentMethod = "Select payment method.";
    }

    if (
      completionType === "refund_pending" &&
      Number(refundAmount) > currentAmountPaid + Number(tipAmount || 0)
    ) {
      newErrors.refundAmount = "Refund cannot exceed amounts collected.";
    }

    if (completionType === "refund_pending" && !refundReason.trim()) {
      newErrors.refundReason = "Enter refund reason.";
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

    if (!validateForm()) {
      return;
    }

    onSubmit(
      {
        appointmentId: appointment.id,

        completionType,

        amountReceivedToday: receivedToday,

        paymentMethod:
          completionType === "additional_payment" ||
          completionType === "tip_received"
            ? paymentMethod
            : null,

        tipAmount: completionType === "tip_received" ? Number(tipAmount) : 0,

        refundAmount:
          completionType === "refund_pending" ? Number(refundAmount) : 0,

        refundReason:
          completionType === "refund_pending" ? refundReason.trim() : null,

        adminNote: adminNote.trim(),
      },
      () => {
        onClose?.();
      },
    );
  }

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center px-3 py-4 sm:px-5">
      <div
        className="
          bg-white rounded-2xl shadow-2xl
          w-full max-w-3xl
          max-h-[95vh]
          overflow-y-auto
        "
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 rounded-t-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-green-700">
                Complete Appointment
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Record any outstanding payment received and mark this
                appointment as completed.
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
          {errors.general && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          )}

          <AppointmentDetailsContent
            appointment={appointment}
            variant="completion"
          />

          {/* Completion Type */}
          <div className="border rounded-2xl p-4 sm:p-5">
            <h3 className="font-semibold text-lg mb-4">Completion Type</h3>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  value="normal"
                  checked={completionType === "normal"}
                  onChange={(e) => setCompletionType(e.target.value)}
                />

                <div>
                  <p className="font-medium">Complete normally</p>

                  <p className="text-sm text-gray-500">
                    No additional financial activity.
                  </p>
                </div>
              </label>

              {/* Additional Payment */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  value="additional_payment"
                  disabled={currentBalanceDue === 0}
                  checked={completionType === "additional_payment"}
                  onChange={(e) => setCompletionType(e.target.value)}
                />

                <div>
                  <p className="font-medium">Additional payment received</p>

                  <p className="text-sm text-gray-500">
                    Customer paid some or all of the outstanding balance.
                  </p>
                </div>
              </label>
              {/* Tip */}
              <label className="flex gap-3 cursor-pointer">
                <input
                  type="radio"
                  value="tip_received"
                  checked={completionType === "tip_received"}
                  onChange={(e) => setCompletionType(e.target.value)}
                />

                <div>
                  <p className="font-medium">Tip received</p>

                  <p className="text-sm text-gray-500">
                    Customer voluntarily paid extra.
                  </p>
                </div>
              </label>
              {/* Refund */}
              <label className="flex gap-3 cursor-pointer">
                <input
                  type="radio"
                  value="refund_pending"
                  checked={completionType === "refund_pending"}
                  onChange={(e) => setCompletionType(e.target.value)}
                />

                <div>
                  <p className="font-medium">Refund pending</p>

                  <p className="text-sm text-gray-500">
                    Customer overpaid and refund is outstanding.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {completionType === "additional_payment" && (
            <AdditionalPaymentSection
              amountReceivedToday={amountReceivedToday}
              setAmountReceivedToday={setAmountReceivedToday}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              errors={errors}
              loading={loading}
            />
          )}

          {completionType === "tip_received" && (
            <TipSection
              tipAmount={tipAmount}
              setTipAmount={setTipAmount}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              errors={errors}
              loading={loading}
            />
          )}

          {completionType === "refund_pending" && (
            <RefundSection
              refundAmount={refundAmount}
              setRefundAmount={setRefundAmount}
              refundReason={refundReason}
              setRefundReason={setRefundReason}
              errors={errors}
              loading={loading}
            />
          )}

          {/* Admin Note */}
          <AdminNoteField
            value={adminNote}
            onChange={setAdminNote}
            loading={loading}
            placeholder="Add notes about service completion..."
          />

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <p className="text-sm text-yellow-700">
              <strong>Warning:</strong> Completing this appointment will change
              its status to <span className="font-semibold">completed</span>.
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
                bg-green-600 text-white
                hover:bg-green-700
                disabled:opacity-50
              "
            >
              {loading ? "Completing..." : "Complete Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
