"use client";

import { useEffect, useState } from "react";

export default function PricingModal({
  appointment,
  onClose,
  onSave,
  loading = false,
}) {
  const [serviceAmount, setServiceAmount] = useState("");
  const [depositRequired, setDepositRequired] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (!appointment) return;

    setServiceAmount(appointment.service_amount || "");
    setDepositRequired(appointment.deposit_required || "");
    setAdminNotes(appointment.admin_notes || "");
  }, [appointment]);

  if (!appointment) return null;

  function handleSubmit(e) {
    e.preventDefault();

    if (!serviceAmount || Number(serviceAmount) <= 0) {
      alert("Please enter a valid service amount.");
      return;
    }

    if (
      depositRequired === "" ||
      Number(depositRequired) < 0 ||
      Number(depositRequired) > Number(serviceAmount)
    ) {
      alert("Deposit required must be between ₦0 and the service amount.");
      return;
    }

    onSave({
      appointmentId: appointment.id,
      serviceAmount: Number(serviceAmount),
      depositRequired: Number(depositRequired),
      adminNotes,
      onSuccess: onClose,
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-3 py-4">
      <div
        className="
          bg-white
          w-full
          max-w-lg
          rounded-2xl
          shadow-2xl
          overflow-hidden
          max-h-[95vh]
          overflow-y-auto
        "
      >
        {/* Header */}
        <div className="border-b px-4 sm:px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">
                Set Appointment Pricing
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Configure pricing for this appointment.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                px-3 py-2
                rounded-lg
                border
                hover:bg-gray-100
                disabled:opacity-50
              "
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          {/* Customer */}
          <div className="border rounded-2xl p-4 bg-gray-50">
            <h3 className="font-semibold mb-3">Appointment Information</h3>

            <div className="space-y-2 text-sm">
              <p>
                <strong>Customer:</strong> {appointment.user?.name || "N/A"}
              </p>

              <p>
                <strong>Email:</strong> {appointment.user?.email || "N/A"}
              </p>

              <p>
                <strong>Service:</strong> {appointment.service_name}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(appointment.appointment_date).toLocaleDateString()}
              </p>

              <p>
                <strong>Time:</strong> {appointment.appointment_time}
              </p>
            </div>
          </div>

          {/* Service Amount */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Service Amount (₦)
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={serviceAmount}
              onChange={(e) => setServiceAmount(e.target.value)}
              className="
                w-full
                border
                rounded-xl
                px-4 py-3
                focus:outline-none
                focus:ring-2
                focus:ring-black
              "
              placeholder="Enter total service cost"
              required
            />
          </div>

          {/* Deposit */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Deposit Required (₦)
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={depositRequired}
              onChange={(e) => setDepositRequired(e.target.value)}
              className="
                w-full
                border
                rounded-xl
                px-4 py-3
                focus:outline-none
                focus:ring-2
                focus:ring-black
              "
              placeholder="Enter required deposit"
              required
            />
          </div>

          {/* Admin Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Admin Notes
            </label>

            <textarea
              rows={4}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="
                w-full
                border
                rounded-xl
                px-4 py-3
                resize-none
                focus:outline-none
                focus:ring-2
                focus:ring-black
              "
              placeholder="Optional notes for this appointment..."
            />
          </div>

          {/* Summary */}
          {serviceAmount && (
            <div className="border rounded-2xl p-4 bg-gray-50">
              <h3 className="font-semibold mb-3">Pricing Summary</h3>

              <div className="space-y-2 text-sm">
                <p>
                  <strong>Total Cost:</strong> ₦
                  {Number(serviceAmount).toLocaleString()}
                </p>

                <p>
                  <strong>Deposit:</strong> ₦
                  {Number(depositRequired || 0).toLocaleString()}
                </p>

                <p>
                  <strong>Balance Due:</strong> ₦
                  {(
                    Number(serviceAmount || 0) - Number(depositRequired || 0)
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div
            className="
              flex flex-col-reverse
              sm:flex-row
              gap-3
              sm:justify-end
              pt-2
            "
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                w-full sm:w-auto
                px-5 py-3
                rounded-xl
                border
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
                px-6 py-3
                rounded-xl
                bg-black
                text-white
                hover:opacity-90
                disabled:opacity-50
              "
            >
              {loading ? "Saving..." : "Save Pricing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
