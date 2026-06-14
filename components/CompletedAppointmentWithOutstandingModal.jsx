"use client";

import { useEffect, useMemo, useState } from "react";
import AppointmentFinancialHistory from "./appointments/AppointmentFinancialHistory";

export default function CompletedAppointmentWithOutstandingModal({
  appointment,
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && appointment) {
      setAmount("");
      setPaymentMethod("");
      setAdminNote("");
      setErrors({});
    }
  }, [isOpen, appointment]);

  if (!isOpen || !appointment) {
    return null;
  }

  const ledgerEntries = [
    ...(appointment.appointment_payments || []).map((payment) => ({
      id: `deposit-${payment.id}`,
      type: "deposit",
      amount: Number(payment.amount || 0),
      paymentMethod: payment.payment_method,
      createdAt: payment.created_at,
      recorder: "Customer",
      status: payment.status,
    })),

    ...(appointment.appointment_offline_payments || []).map((payment) => ({
      id: `offline-${payment.id}`,
      type: "offline_payment",
      amount: Number(payment.amount || 0),
      paymentMethod: payment.payment_method,
      createdAt: payment.created_at,
      recorder: payment.recorder?.name || "Admin",
      note: payment.note,
    })),

    ...(appointment.appointment_payment_adjustments || [])
      .filter((adjustment) =>
        [
          "tip",
          "refund",
          "overpayment_refund",
          "write_off",
          "correction",
        ].includes(adjustment.adjustment_type),
      )
      .map((adjustment) => ({
        id: `adjustment-${adjustment.id}`,
        type: adjustment.adjustment_type,
        amount: Number(adjustment.amount || 0),
        paymentMethod: adjustment.payment_method,
        createdAt: adjustment.created_at,
        recorder: adjustment.recorder?.name || "Admin",
        note: adjustment.reason,
      })),
  ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const serviceAmount = Number(appointment.service_amount || 0);

  const amountPaid = Number(appointment.amount_paid || 0);

  const balanceDue = Number(appointment.balance_due || 0);

  const hasOutstandingBalance = balanceDue > 0;

  const enteredAmount = Number(amount || 0);

  const projectedBalance = Math.max(balanceDue - enteredAmount, 0);

  const totalTips = useMemo(() => {
    return (
      appointment.appointment_payment_adjustments
        ?.filter((adjustment) => adjustment.adjustment_type === "tip")
        .reduce((sum, adjustment) => sum + Number(adjustment.amount || 0), 0) ||
      0
    );
  }, [appointment]);

  function validate() {
    const newErrors = {};

    const paymentAmount = Number(amount || 0);

    if (hasOutstandingBalance) {
      if (paymentAmount <= 0) {
        newErrors.amount = "Enter a valid amount.";
      }

      if (paymentAmount > balanceDue) {
        newErrors.amount = "Amount cannot exceed outstanding balance.";
      }

      if (!paymentMethod) {
        newErrors.paymentMethod = "Please select a payment method.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!hasOutstandingBalance) {
      onClose?.();
      return;
    }

    if (!validate()) {
      return;
    }

    onSubmit(
      {
        appointmentId: appointment.id,
        amount: Number(amount),
        paymentMethod,
        adminNote,
      },
      () => {
        onClose?.();
      },
    );
  }

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center px-3 py-4 sm:px-5">
      {" "}
      <div
        className="
       bg-white rounded-2xl shadow-2xl
       w-full max-w-3xl
       max-h-[95vh]
       overflow-y-auto
     "
      >
        {/* Header */}{" "}
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 rounded-t-2xl">
          {" "}
          <div className="flex items-start justify-between gap-4">
            {" "}
            <div>
              {" "}
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
                Completed Appointment{" "}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Review payment information and record outstanding payments.
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
          {/* Appointment Info */}
          <div className="border rounded-2xl p-5">
            <h3 className="font-semibold text-lg mb-4">
              Appointment Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500">Customer</p>

                <p className="font-medium">{appointment.user?.name || "N/A"}</p>
              </div>

              <div>
                <p className="text-gray-500">Email</p>

                <p className="font-medium break-all">
                  {appointment.user?.email || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Service</p>

                <p className="font-medium">{appointment.service_name}</p>
              </div>

              <div>
                <p className="text-gray-500">Booking ID</p>

                <p className="font-medium">#{appointment.id.slice(0, 8)}</p>
              </div>

              <div>
                <p className="text-gray-500">Date</p>

                <p className="font-medium">
                  {new Date(appointment.appointment_date).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Time</p>

                <p className="font-medium">{appointment.appointment_time}</p>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="border rounded-2xl p-5">
            <h3 className="font-semibold text-lg mb-4">Payment Summary</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500">Service Amount</p>

                <p className="font-semibold">
                  ₦{serviceAmount.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Amount Paid</p>

                <p className="font-semibold">₦{amountPaid.toLocaleString()}</p>
              </div>

              <div>
                <p className="text-gray-500">Outstanding Balance</p>

                <p className="font-semibold">₦{balanceDue.toLocaleString()}</p>
              </div>

              <div>
                <p className="text-gray-500">Tips Received</p>

                <p className="font-semibold text-purple-700">
                  ₦{totalTips.toLocaleString()}
                </p>
              </div>
            </div>

            {appointment.completed_at && (
              <p className="text-xs text-gray-500 mt-4">
                Completed on{" "}
                {new Date(appointment.completed_at).toLocaleString()}
              </p>
            )}
          </div>
          <AppointmentFinancialHistory
            appointment={appointment}
            variant="admin"
          />

          {/* Payment Made */}
          {hasOutstandingBalance && (
            <div className="border rounded-2xl p-5 space-y-5">
              <h3 className="font-semibold text-lg">Record Payment</h3>

              <div>
                <label className="block font-medium mb-2">
                  Amount Received
                </label>

                <input
                  type="number"
                  min="0.01"
                  max={balanceDue}
                  step="0.01"
                  inputMode="decimal"
                  placeholder={`Outstanding: ₦${balanceDue.toLocaleString()}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={loading}
                  className="
    w-full rounded-xl border
    px-4 py-3
    focus:outline-none
    focus:ring-2 focus:ring-green-500
    disabled:bg-gray-100
  "
                />

                <div className="mt-3 rounded-xl border bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Current Outstanding
                    </span>

                    <span className="font-semibold">
                      ₦{balanceDue.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-600">
                      Amount Being Recorded
                    </span>

                    <span className="font-semibold text-green-700">
                      ₦{enteredAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="border-t mt-3 pt-3 flex items-center justify-between">
                    <span className="font-medium">
                      Balance After This Payment
                    </span>

                    <span
                      className={`font-bold text-lg ${
                        projectedBalance === 0
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      ₦{projectedBalance.toLocaleString()}
                    </span>
                  </div>
                </div>

                {errors.amount && (
                  <p className="mt-2 text-sm text-red-600">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block font-medium mb-3">Payment Method</label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["cash", "bank_transfer", "pos", "other"].map((method) => (
                    <label
                      key={method}
                      className="
                    flex items-center gap-3
                    border rounded-xl
                    p-3 cursor-pointer
                  "
                    >
                      <input
                        type="radio"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />

                      <span>{method.replace("_", " ").toUpperCase()}</span>
                    </label>
                  ))}
                </div>

                {errors.paymentMethod && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.paymentMethod}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-medium mb-2">
                  Admin Note
                  <span className="text-sm text-gray-500 ml-2">(Optional)</span>
                </label>

                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="
                w-full rounded-xl border
                px-4 py-3
              "
                />
              </div>
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
            px-5 py-3
            rounded-xl border
          "
            >
              Close
            </button>

            {hasOutstandingBalance && (
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
                {loading ? "Recording..." : "Record Payment"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
