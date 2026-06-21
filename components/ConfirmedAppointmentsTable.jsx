"use client";

export default function ConfirmedAppointmentsTable({
  appointments = [],
  onView,
  onComplete,
  onCancel,
}) {
  if (!appointments.length) {
    return (
      <div className="bg-white rounded-xl border p-6 text-center text-neutral-500">
        No confirmed appointments.
      </div>
    );
  }

  const sortedAppointments = [...appointments].sort((a, b) => {
    const aDate = a.confirmed_at || a.created_at;
    const bDate = b.confirmed_at || b.created_at;

    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      {/* ===========================
          TABLET / LAPTOP / DESKTOP
      ============================ */}
      <div className="hidden md:block overflow-x-auto">
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

              <th className="px-4 py-3 text-left whitespace-nowrap">
                Date & Time
              </th>

              <th className="px-4 py-3 text-left whitespace-nowrap">Payment</th>

              <th className="px-4 py-3 text-left whitespace-nowrap">
                Confirmed
              </th>

              <th className="px-4 py-3 text-center whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedAppointments.map((appointment) => {
              const amountPaid = Number(appointment.amount_paid || 0);

              const serviceAmount = Number(appointment.service_amount || 0);

              const balanceDue = Number(appointment.balance_due || 0);

              return (
                <tr
                  key={appointment.id}
                  className="border-t hover:bg-neutral-50"
                >
                  {/* Appointment */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onView?.(appointment)}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      #{appointment.id.slice(0, 8)}
                    </button>
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-4">
                    <div className="min-w-[180px]">
                      <p className="font-medium">
                        {appointment.customer?.name ||
                          appointment.user?.name ||
                          "-"}
                      </p>

                      <p className="text-xs text-neutral-500 break-all">
                        {appointment.customer?.email ||
                          appointment.user?.email ||
                          "-"}
                      </p>
                    </div>
                  </td>

                  {/* Service */}
                  <td className="px-4 py-4">
                    <div className="min-w-[160px]">
                      <p>{appointment.service_name}</p>

                      {appointment.notes && (
                        <p className="text-xs text-neutral-500 mt-1">
                          {appointment.notes}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <p>
                      {new Date(
                        appointment.appointment_date,
                      ).toLocaleDateString()}
                    </p>

                    <p className="text-xs text-neutral-500">
                      {appointment.appointment_time}
                    </p>
                  </td>

                  {/* Payment */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <p>Paid: ₦{amountPaid.toLocaleString()}</p>

                    <p className="text-xs text-neutral-500">
                      Total: ₦{serviceAmount.toLocaleString()}
                    </p>

                    {balanceDue > 0 ? (
                      <p className="text-xs text-orange-600 font-medium mt-1">
                        Balance: ₦{balanceDue.toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-xs text-green-600 font-medium mt-1">
                        Fully Paid
                      </p>
                    )}
                  </td>

                  {/* Confirmed */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    {appointment.confirmed_at ? (
                      <>
                        <p className="text-xs">
                          {new Date(
                            appointment.confirmed_at,
                          ).toLocaleDateString()}
                        </p>

                        <p className="text-xs text-neutral-500">
                          {new Date(
                            appointment.confirmed_at,
                          ).toLocaleTimeString()}
                        </p>
                      </>
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap justify-center gap-2">
                      <button
                        onClick={() => onView?.(appointment)}
                        className="px-3 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition"
                      >
                        View
                      </button>

                      <button
                        onClick={() => onComplete?.(appointment)}
                        className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                      >
                        Complete
                      </button>

                      <button
                        onClick={() => onCancel?.(appointment)}
                        className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ===========================
          MOBILE CARDS
      ============================ */}
      <div className="md:hidden divide-y">
        {sortedAppointments.map((appointment) => {
          const amountPaid = Number(appointment.amount_paid || 0);

          const serviceAmount = Number(appointment.service_amount || 0);

          const balanceDue = Number(appointment.balance_due || 0);

          return (
            <div key={appointment.id} className="p-4 space-y-4">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="font-semibold">#{appointment.id.slice(0, 8)}</p>

                  <p className="text-sm text-neutral-500">
                    {appointment.service_name}
                  </p>
                </div>

                <button
                  onClick={() => onView?.(appointment)}
                  className="px-3 py-2 rounded-lg bg-gray-700 text-white text-sm"
                >
                  View
                </button>
              </div>

              <div className="text-sm space-y-2">
                <p>
                  <strong>Customer:</strong>{" "}
                  {appointment.customer?.name || appointment.user?.name || "-"}
                </p>

                <p className="break-all text-neutral-500">
                  {appointment.customer?.email ||
                    appointment.user?.email ||
                    "-"}
                </p>

                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(appointment.appointment_date).toLocaleDateString()}
                </p>

                <p>
                  <strong>Time:</strong> {appointment.appointment_time}
                </p>

                <p>
                  <strong>Paid:</strong> ₦{amountPaid.toLocaleString()}
                </p>

                <p>
                  <strong>Total:</strong> ₦{serviceAmount.toLocaleString()}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {balanceDue > 0 ? (
                    <span className="text-orange-600 font-medium">
                      Balance ₦{balanceDue.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-green-600 font-medium">
                      Fully Paid
                    </span>
                  )}
                </p>

                <p>
                  <strong>Confirmed:</strong>{" "}
                  {appointment.confirmed_at
                    ? new Date(appointment.confirmed_at).toLocaleString()
                    : "-"}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onView?.(appointment)}
                  className="px-3 py-2 rounded-lg bg-gray-600 text-white text-sm"
                >
                  View
                </button>

                <button
                  onClick={() => onComplete?.(appointment)}
                  className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm"
                >
                  Complete
                </button>

                <button
                  onClick={() => onCancel?.(appointment)}
                  className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
