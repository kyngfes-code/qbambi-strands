"use client";

export default function CancelledAppointmentsTable({
  appointments = [],
  onView,
}) {
  if (!appointments.length) {
    return (
      <div className="bg-white rounded-2xl border p-6 text-center">
        <p className="text-neutral-500">No cancelled appointments found.</p>
      </div>
    );
  }

  return (
    <>
      {/* ================= MOBILE VIEW ================= */}
      <div className="space-y-4 md:hidden">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="bg-white border rounded-2xl p-4 shadow-sm"
          >
            <div className="flex justify-between items-start gap-3">
              <div>
                <h3 className="font-semibold text-lg">
                  {appointment.service_name}
                </h3>

                <p className="text-xs text-neutral-500">
                  #{appointment.id.slice(0, 8)}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                Cancelled
              </span>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <p>
                <strong>Customer:</strong> {appointment.customer?.name || "-"}
              </p>

              <p>
                <strong>Email:</strong> {appointment.customer?.email || "-"}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(appointment.appointment_date).toLocaleDateString()}
              </p>

              <p>
                <strong>Time:</strong> {appointment.appointment_time}
              </p>

              {appointment.cancellation_reason && (
                <p>
                  <strong>Reason:</strong> {appointment.cancellation_reason}
                </p>
              )}

              {appointment.cancellation_customer_message && (
                <p>
                  <strong>Message:</strong>{" "}
                  {appointment.cancellation_customer_message}
                </p>
              )}

              {appointment.cancelled_at && (
                <p className="text-xs text-neutral-500">
                  Cancelled on{" "}
                  {new Date(appointment.cancelled_at).toLocaleString()}
                </p>
              )}
            </div>

            <button
              onClick={() => onView(appointment)}
              className="mt-4 w-full bg-black text-white rounded-xl py-2 text-sm font-medium hover:opacity-90"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* ================= TABLET/DESKTOP VIEW ================= */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Service</th>

              <th className="px-4 py-3 text-left font-semibold">Customer</th>

              <th className="px-4 py-3 text-left font-semibold">Appointment</th>

              <th className="px-4 py-3 text-left font-semibold">
                Cancellation Reason
              </th>

              <th className="px-4 py-3 text-left font-semibold">
                Cancelled At
              </th>

              <th className="px-4 py-3 text-center font-semibold">Action</th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="border-t hover:bg-neutral-50">
                <td className="px-4 py-4">
                  <div>
                    <p className="font-medium">{appointment.service_name}</p>

                    <p className="text-xs text-neutral-500">
                      #{appointment.id.slice(0, 8)}
                    </p>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div>
                    <p>{appointment.customer?.name || "-"}</p>

                    <p className="text-xs text-neutral-500">
                      {appointment.customer?.email || "-"}
                    </p>
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

                <td className="px-4 py-4 max-w-xs">
                  <p className="truncate">
                    {appointment.cancellation_reason || "-"}
                  </p>

                  {appointment.cancellation_customer_message && (
                    <p className="text-xs text-neutral-500 mt-1 truncate">
                      {appointment.cancellation_customer_message}
                    </p>
                  )}
                </td>

                <td className="px-4 py-4 whitespace-nowrap">
                  {appointment.cancelled_at
                    ? new Date(appointment.cancelled_at).toLocaleString()
                    : "-"}
                </td>

                <td className="px-4 py-4 text-center">
                  <button
                    onClick={() => onView(appointment)}
                    className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-90"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
