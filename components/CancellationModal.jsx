"use client";

import { useEffect, useState } from "react";

export default function CancellationModal({
  appointment,
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) {
  const [cancellationReason, setCancellationReason] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCancellationReason("");
      setAdminNote("");
      setValidationError("");
    }
  }, [isOpen, appointment]);

  if (!isOpen || !appointment) return null;

  function handleSubmit(e) {
    e.preventDefault();
    setValidationError("");

    //if (!cancellationReason.trim()) {
    //setValidationError("Cancellation reason is required.");
    //return;
    //}

    onSubmit(
      {
        appointmentId: appointment.id,
        cancellationReason: cancellationReason.trim(),
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
          w-full max-w-2xl
          max-h-[95vh]
          overflow-y-auto
        "
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 rounded-t-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-red-600">
                Cancel Appointment
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Provide a reason before cancelling this appointment.
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
          {/* Appointment Summary */}
          <div className="border rounded-2xl p-4 sm:p-5">
            <h3 className="font-semibold text-lg mb-4">
              Appointment Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
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

                <p className="font-medium">{appointment.id.slice(0, 8)}</p>
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

          {/* Cancellation Reason */}
          <div>
            <label className="block font-medium mb-2">
              Cancellation Reason
              <span className="text-red-500 ml-1">*</span>
            </label>

            <textarea
              required
              rows={4}
              value={cancellationReason}
              onChange={(e) => {
                setCancellationReason(e.target.value);

                if (validationError) {
                  setValidationError("");
                }
              }}
              placeholder="Why is this appointment being cancelled?"
              className="
                w-full rounded-xl border
                px-4 py-3
                focus:outline-none
                focus:ring-2 focus:ring-red-500
                resize-none
              "
              disabled={loading}
            />

            {validationError && (
              <p className="mt-2 text-sm text-red-600">{validationError}</p>
            )}
          </div>

          {/* Admin Note */}
          <div>
            <label className="block font-medium mb-2">
              Internal Admin Note
              <span className="text-sm text-gray-500 ml-2">(Optional)</span>
            </label>

            <textarea
              rows={4}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Add notes visible only to administrators..."
              className="
                w-full rounded-xl border
                px-4 py-3
                focus:outline-none
                focus:ring-2 focus:ring-red-500
                resize-none
              "
              disabled={loading}
            />
          </div>

          {/* Warning */}
          <div
            className="
              bg-red-50 border border-red-200
              rounded-2xl p-4
            "
          >
            <p className="text-sm text-red-700">
              <strong>Warning:</strong> Cancelling this appointment will change
              its status to <span className="font-semibold">cancelled</span>.
              Customers may no longer proceed with this booking.
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
              Keep Appointment
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
              {loading ? "Cancelling..." : "Cancel Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
