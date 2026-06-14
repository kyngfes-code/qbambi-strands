"use client";

export default function AppointmentSummary({
  appointment,
  isAdmin = false,
  showStatus = true,
}) {
  return (
    <>
      {showStatus && (
        <div>
          <span
            className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${
              appointment.status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : appointment.status === "confirmed"
                  ? "bg-blue-100 text-blue-700"
                  : appointment.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : appointment.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
            }`}
          >
            {appointment.status}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isAdmin && (
          <div className="border rounded-2xl p-5">
            <h3 className="font-bold text-lg mb-4">Customer Information</h3>

            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {appointment.user?.name || "-"}
              </p>

              <p>
                <strong>Email:</strong> {appointment.user?.email || "-"}
              </p>

              <p>
                <strong>User ID:</strong> {appointment.user_id}
              </p>
            </div>
          </div>
        )}

        <div className="border rounded-2xl p-5">
          <h3 className="font-bold text-lg mb-4">Appointment Information</h3>

          <div className="space-y-2">
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

            <p>
              <strong>Booked:</strong>{" "}
              {new Date(appointment.created_at).toLocaleString()}
            </p>

            {appointment.notes && (
              <p>
                <strong>Customer Notes:</strong> {appointment.notes}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
