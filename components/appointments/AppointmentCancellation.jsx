"use client";

export default function AppointmentCancellation({
  appointment,
  isAdmin = false,
}) {
  if (appointment.status !== "cancelled") {
    return null;
  }

  return (
    <div className="border border-red-200 bg-red-50 rounded-2xl p-5">
      <h3 className="font-bold text-red-700 mb-4">Cancellation Information</h3>

      <div className="space-y-2">
        <p>
          <strong>Reason:</strong> {appointment.cancellation_reason || "-"}
        </p>

        <p>
          <strong>Customer Message:</strong>{" "}
          {appointment.cancellation_customer_message || "-"}
        </p>

        {isAdmin && (
          <p>
            <strong>Admin Note:</strong>{" "}
            {appointment.cancellation_admin_note || "-"}
          </p>
        )}
      </div>
    </div>
  );
}
