"use client";

export default function AppointmentRequestsTable({
  appointments = [],
  onView,
  onSetPricing,
  onCancel,
}) {
  if (!appointments.length) {
    return (
      <div className="bg-white rounded-xl border p-6 text-center text-neutral-500">
        No appointment requests found.
      </div>
    );
  }

  const sortedAppointments = [...appointments].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      {/* Desktop / Tablet Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-100">
            <tr>
              <th className="px-4 py-3 text-left whitespace-nowrap">
                Booking ID
              </th>

              <th className="px-4 py-3 text-left whitespace-nowrap">
                Customer
              </th>

              <th className="px-4 py-3 text-left whitespace-nowrap">Service</th>

              <th className="px-4 py-3 text-left whitespace-nowrap">
                Appointment
              </th>

              <th className="px-4 py-3 text-left whitespace-nowrap">Status</th>

              <th className="px-4 py-3 text-left whitespace-nowrap">Pricing</th>

              <th className="px-4 py-3 text-center whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedAppointments.map((appointment) => (
              <tr key={appointment.id} className="border-t hover:bg-neutral-50">
                {/* Booking ID */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onView?.(appointment)}
                    className="text-blue-600 underline font-medium"
                  >
                    #{appointment.id.slice(0, 8)}
                  </button>
                </td>

                {/* Customer */}
                <td className="px-4 py-4">
                  <div className="min-w-[180px]">
                    <p className="font-medium">
                      {appointment.user?.name || "Unknown"}
                    </p>

                    <p className="text-xs text-neutral-500 break-all">
                      {appointment.user?.email || "-"}
                    </p>
                  </div>
                </td>

                {/* Service */}
                <td className="px-4 py-4">
                  <div className="min-w-[150px]">
                    {appointment.service_name}
                  </div>
                </td>

                {/* Appointment */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div>
                    <p>
                      {new Date(
                        appointment.appointment_date,
                      ).toLocaleDateString()}
                    </p>

                    <p className="text-xs text-neutral-500">
                      {appointment.appointment_time}
                    </p>
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      appointment.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : appointment.status === "confirmed"
                          ? "bg-blue-100 text-blue-700"
                          : appointment.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : appointment.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-neutral-100 text-neutral-700"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </td>

                {/* Pricing */}
                <td className="px-4 py-4 whitespace-nowrap">
                  {appointment.service_amount ? (
                    <div>
                      <p className="font-medium">
                        ₦{Number(appointment.service_amount).toLocaleString()}
                      </p>

                      <p className="text-xs text-neutral-500">
                        Deposit: ₦
                        {Number(
                          appointment.deposit_required || 0,
                        ).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <span className="text-yellow-600 text-xs font-medium">
                      Not Set
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => onView?.(appointment)}
                      className="px-3 py-2 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition"
                    >
                      View
                    </button>

                    {!appointment.service_amount && (
                      <button
                        onClick={() => onSetPricing?.(appointment)}
                        className="px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
                      >
                        Set Pricing
                      </button>
                    )}

                    {appointment.status !== "cancelled" && (
                      <button
                        onClick={() => onCancel?.(appointment)}
                        className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
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
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y">
        {sortedAppointments.map((appointment) => (
          <div key={appointment.id} className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <button
                  onClick={() => onView?.(appointment)}
                  className="font-semibold text-blue-600 underline"
                >
                  #{appointment.id.slice(0, 8)}
                </button>

                <p className="text-sm text-neutral-500 mt-1">
                  {appointment.service_name}
                </p>
              </div>

              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                  appointment.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : appointment.status === "confirmed"
                      ? "bg-blue-100 text-blue-700"
                      : appointment.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : appointment.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-neutral-100 text-neutral-700"
                }`}
              >
                {appointment.status}
              </span>
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm">
              <p>
                <strong>Customer:</strong> {appointment.user?.name || "Unknown"}
              </p>

              <p className="break-all text-neutral-600">
                {appointment.user?.email || "-"}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(appointment.appointment_date).toLocaleDateString()}
              </p>

              <p>
                <strong>Time:</strong> {appointment.appointment_time}
              </p>

              <p>
                <strong>Pricing:</strong>{" "}
                {appointment.service_amount ? (
                  <>₦{Number(appointment.service_amount).toLocaleString()}</>
                ) : (
                  <span className="text-yellow-600">Not Set</span>
                )}
              </p>

              {appointment.service_amount && (
                <p>
                  <strong>Deposit:</strong> ₦
                  {Number(appointment.deposit_required || 0).toLocaleString()}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => onView?.(appointment)}
                className="flex-1 min-w-[90px] px-4 py-2 rounded-lg bg-neutral-800 text-white"
              >
                View
              </button>

              {!appointment.service_amount && (
                <button
                  onClick={() => onSetPricing?.(appointment)}
                  className="flex-1 min-w-[120px] px-4 py-2 rounded-lg bg-purple-600 text-white"
                >
                  Set Pricing
                </button>
              )}

              {appointment.status !== "cancelled" && (
                <button
                  onClick={() => onCancel?.(appointment)}
                  className="flex-1 min-w-[90px] px-4 py-2 rounded-lg bg-red-600 text-white"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
