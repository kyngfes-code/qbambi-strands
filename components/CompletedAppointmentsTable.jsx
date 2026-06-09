"use client";

export default function CompletedAppointmentsTable({
  appointments = [],
  onView,
}) {
  if (!appointments.length) {
    return (
      <div className="bg-white rounded-xl border p-6 text-center text-neutral-500">
        No completed appointments found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-100">
            <tr>
              <th className="px-4 py-3 text-left whitespace-nowrap">
                Appointment
              </th>

              <th className="px-4 py-3 text-left whitespace-nowrap">
                Customer
              </th>

              <th className="px-4 py-3 text-left whitespace-nowrap">Service</th>

              <th className="px-4 py-3 text-left whitespace-nowrap">Date</th>

              <th className="px-4 py-3 text-left whitespace-nowrap">
                Completed
              </th>

              <th className="px-4 py-3 text-center whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="border-t hover:bg-neutral-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div>
                    <p className="font-medium">#{appointment.id.slice(0, 8)}</p>

                    <p className="text-xs text-neutral-500">
                      {new Date(appointment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="min-w-[150px]">
                    <p className="font-medium">
                      {appointment.user?.name || "Unknown"}
                    </p>

                    <p className="text-xs text-neutral-500 break-all">
                      {appointment.user?.email || "-"}
                    </p>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="min-w-[140px]">
                    {appointment.service_name}
                  </div>
                </td>

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

                <td className="px-4 py-4 whitespace-nowrap">
                  {appointment.completed_at ? (
                    <div>
                      <p>
                        {new Date(
                          appointment.completed_at,
                        ).toLocaleDateString()}
                      </p>

                      <p className="text-xs text-neutral-500">
                        {new Date(
                          appointment.completed_at,
                        ).toLocaleTimeString()}
                      </p>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="px-4 py-4 text-center">
                  <button
                    onClick={() => onView?.(appointment)}
                    className="px-3 py-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-700 transition whitespace-nowrap"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="p-4 space-y-3">
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-semibold">#{appointment.id.slice(0, 8)}</p>

                <p className="text-sm text-neutral-500">
                  {appointment.service_name}
                </p>
              </div>

              <button
                onClick={() => onView?.(appointment)}
                className="px-3 py-2 rounded-lg bg-neutral-900 text-white text-sm"
              >
                View
              </button>
            </div>

            <div className="text-sm space-y-1">
              <p>
                <strong>Customer:</strong> {appointment.user?.name || "Unknown"}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(appointment.appointment_date).toLocaleDateString()}
              </p>

              <p>
                <strong>Time:</strong> {appointment.appointment_time}
              </p>

              <p>
                <strong>Completed:</strong>{" "}
                {appointment.completed_at
                  ? new Date(appointment.completed_at).toLocaleString()
                  : "-"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
