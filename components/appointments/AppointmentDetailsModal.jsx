"use client";

import AppointmentDetailsContent from "./AppointmentDetailsContent";

export default function AppointmentDetailsModal({
  appointment,
  onClose,
  isAdmin = false,
}) {
  if (!appointment) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-6">
      <div
        className="
          bg-white rounded-2xl shadow-xl
          w-full max-w-5xl
          max-h-[95vh]
          overflow-y-auto
        "
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold">
              Appointment Details
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Booking ID: {appointment.id.slice(0, 8)}
            </p>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <AppointmentDetailsContent
            appointment={appointment}
            variant="details"
          />
        </div>
      </div>
    </div>
  );
}
