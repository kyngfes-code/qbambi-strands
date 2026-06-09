"use client";

export default function ConfirmedAppointmentsTable({
  appointments,
  onView,
  onComplete,
  onCancel,
}) {
  if (!appointments?.length) {
    return (
      <p className="text-sm text-neutral-500">No confirmed appointments.</p>
    );
  }

  return (
    <table className="w-full border text-sm mt-4">
      <thead className="bg-neutral-100">
        <tr>
          <th className="p-2 border">Appointment</th>
          <th className="p-2 border">Customer</th>
          <th className="p-2 border">Service</th>
          <th className="p-2 border">Date & Time</th>
          <th className="p-2 border">Payment</th>
          <th className="p-2 border">Confirmed</th>
          <th className="p-2 border">Actions</th>
        </tr>
      </thead>

      <tbody>
        {appointments.map((appointment) => {
          const amountPaid = Number(appointment.amount_paid || 0);

          const serviceAmount = Number(appointment.service_amount || 0);

          const balanceDue = Number(appointment.balance_due || 0);

          return (
            <tr key={appointment.id}>
              {/* Appointment */}
              <td className="p-2 border">
                <button
                  onClick={() => onView(appointment.id)}
                  className="text-blue-600 underline"
                >
                  #{appointment.id.slice(0, 8)}
                </button>
              </td>

              {/* Customer */}
              <td className="p-2 border">
                <div>
                  <p className="font-medium">
                    {appointment.customer?.name ||
                      appointment.user?.name ||
                      "-"}
                  </p>

                  <p className="text-xs text-neutral-500">
                    {appointment.customer?.email ||
                      appointment.user?.email ||
                      "-"}
                  </p>
                </div>
              </td>

              {/* Service */}
              <td className="p-2 border">
                <div>
                  <p>{appointment.service_name}</p>

                  {appointment.notes && (
                    <p className="text-xs text-neutral-500 mt-1">
                      {appointment.notes}
                    </p>
                  )}
                </div>
              </td>

              {/* Date & Time */}
              <td className="p-2 border">
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

              {/* Payment */}
              <td className="p-2 border">
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

              {/* Confirmation */}
              <td className="p-2 border">
                {appointment.confirmed_at ? (
                  <div>
                    <p className="text-xs">
                      {new Date(appointment.confirmed_at).toLocaleDateString()}
                    </p>

                    <p className="text-xs text-neutral-500">
                      {new Date(appointment.confirmed_at).toLocaleTimeString()}
                    </p>
                  </div>
                ) : (
                  "-"
                )}
              </td>

              {/* Actions */}
              <td className="p-2 border">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onView(appointment.id)}
                    className="px-3 py-1 bg-gray-600 text-white rounded"
                  >
                    View
                  </button>

                  <button
                    onClick={() => onComplete(appointment.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded"
                  >
                    Complete
                  </button>

                  <button
                    onClick={() => onCancel(appointment.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
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
  );
}
