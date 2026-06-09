"use client";

export default function AppointmentRequestsTable({
  appointments,
  onView,
  onSetPricing,
  onCancel,
}) {
  if (!appointments?.length) {
    return (
      <p className="text-sm text-neutral-500">No appointment requests found.</p>
    );
  }

  return (
    <table className="w-full border text-sm mt-4">
      <thead className="bg-neutral-100">
        <tr>
          <th className="p-2 border">Booking ID</th>
          <th className="p-2 border">Customer</th>
          <th className="p-2 border">Service</th>
          <th className="p-2 border">Appointment Date</th>
          <th className="p-2 border">Status</th>
          <th className="p-2 border">Pricing</th>
          <th className="p-2 border">Actions</th>
        </tr>
      </thead>

      <tbody>
        {appointments.map((appointment) => (
          <tr key={appointment.id}>
            {/* Booking ID */}
            <td className="p-2 border">
              <button
                onClick={() => onView(appointment)}
                className="text-blue-600 underline"
              >
                {appointment.id.slice(0, 8)}
              </button>
            </td>

            {/* Customer */}
            <td className="p-2 border">
              <div>
                <p className="font-medium">
                  {appointment.user?.name || "Unknown"}
                </p>

                <p className="text-xs text-neutral-500">
                  {appointment.user?.email || "-"}
                </p>
              </div>
            </td>

            {/* Service */}
            <td className="p-2 border">{appointment.service_name}</td>

            {/* Appointment Date */}
            <td className="p-2 border">
              <div>
                <p>
                  {new Date(appointment.appointment_date).toLocaleDateString()}
                </p>

                <p className="text-xs text-neutral-500">
                  {appointment.appointment_time}
                </p>
              </div>
            </td>

            {/* Status */}
            <td className="p-2 border">
              <span
                className={`px-2 py-1 rounded text-white text-xs ${
                  appointment.status === "pending"
                    ? "bg-yellow-600"
                    : appointment.status === "confirmed"
                      ? "bg-blue-600"
                      : appointment.status === "completed"
                        ? "bg-green-600"
                        : appointment.status === "cancelled"
                          ? "bg-red-600"
                          : "bg-neutral-600"
                }`}
              >
                {appointment.status}
              </span>
            </td>

            {/* Pricing */}
            <td className="p-2 border">
              {appointment.service_amount ? (
                <div>
                  <p>₦{Number(appointment.service_amount).toLocaleString()}</p>

                  <p className="text-xs text-neutral-500">
                    Deposit: ₦
                    {Number(appointment.deposit_required || 0).toLocaleString()}
                  </p>
                </div>
              ) : (
                <span className="text-yellow-600 text-xs font-medium">
                  Not Set
                </span>
              )}
            </td>

            {/* Actions */}
            <td className="p-2 border">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onView(appointment)}
                  className="px-3 py-1 bg-gray-600 text-white rounded"
                >
                  View
                </button>

                {!appointment.service_amount && (
                  <button
                    onClick={() => onSetPricing(appointment)}
                    className="px-3 py-1 bg-purple-600 text-white rounded"
                  >
                    Set Pricing
                  </button>
                )}

                {appointment.status !== "cancelled" && (
                  <button
                    onClick={() => onCancel(appointment)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
