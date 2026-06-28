"use client";

export default function CompletedAppointmentsTable({
  appointments = [],
  onView,
  onRefund,
}) {
  if (!appointments.length) {
    return (
      <div className="bg-white rounded-xl border p-6 text-center text-neutral-500">
        No completed appointments found.
      </div>
    );
  }
  const sortedAppointments = [...appointments].sort((a, b) => {
    const aDate = a.completed_at || a.created_at;
    const bDate = b.completed_at || b.created_at;

    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
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
                Appointment Date & Time
              </th>

              <th className="px-4 py-3 text-left whitespace-nowrap">
                Completed
              </th>
              <th className="px-4 py-3 text-left whitespace-nowrap">
                Service Amount
              </th>

              <th className="px-4 py-3 text-left whitespace-nowrap">
                Amount Paid
              </th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Tips</th>

              <th className="px-4 py-3 text-left whitespace-nowrap">
                Outstanding
              </th>

              <th className="px-4 py-3 text-left whitespace-nowrap">Refunds</th>

              <th className="px-4 py-3 text-left whitespace-nowrap">
                Net Proceeds
              </th>

              <th className="px-4 py-3 text-center whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedAppointments.map((appointment) => {
              const totalTips =
                appointment.appointment_payment_adjustments?.reduce(
                  (sum, adjustment) => sum + Number(adjustment.tip_amount || 0),
                  0,
                ) || 0;
              const amountPaid = Number(appointment.amount_paid || 0);

              const refundedAmount = Number(appointment.refunded_amount || 0);

              const netProceeds =
                Number(appointment.amount_paid || 0) -
                Number(appointment.refunded_amount || 0);

              const outstandingBalance = Number(appointment.balance_due || 0);
              const hasOutstandingBalance = outstandingBalance > 0;

              return (
                <tr
                  key={appointment.id}
                  className={`border-t hover:bg-neutral-50 ${
                    hasOutstandingBalance
                      ? "bg-amber-50 border-l-4 border-l-amber-500"
                      : ""
                  }`}
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-medium">
                        #{appointment.id.slice(0, 8)}
                      </p>

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

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="font-medium">
                      ₦
                      {Number(appointment.service_amount || 0).toLocaleString()}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="font-semibold text-blue-700">
                      ₦{amountPaid.toLocaleString()}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    {totalTips > 0 ? (
                      <span className="font-semibold text-purple-700">
                        ₦{totalTips.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-neutral-400"></span>
                    )}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    {hasOutstandingBalance ? (
                      <span className="font-semibold text-red-600">
                        ₦{outstandingBalance.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-green-600 font-medium">
                        Cleared
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="font-semibold text-red-600">
                      ₦{refundedAmount.toLocaleString()}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="font-semibold text-green-700">
                      ₦{netProceeds.toLocaleString()}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => onView?.(appointment)}
                      className="px-3 py-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-700 transition whitespace-nowrap"
                    >
                      View Details
                    </button>

                    {appointment.status === "completed" &&
                      Number(appointment.amount_paid || 0) > 0 && (
                        <button
                          onClick={() => onRefund?.(appointment)}
                          className="px-4 py-2 rounded-lg bg-orange-600 text-white"
                        >
                          Request Refund
                        </button>
                      )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y">
        {sortedAppointments.map((appointment) => {
          const totalTips =
            appointment.appointment_payment_adjustments?.reduce(
              (sum, adjustment) => sum + Number(adjustment.tip_amount || 0),
              0,
            ) || 0;
          const outstandingBalance = Number(appointment.balance_due || 0);
          const hasOutstandingBalance = outstandingBalance > 0;

          const amountPaid = Number(appointment.amount_paid || 0);

          const refundedAmount = Number(appointment.refunded_amount || 0);

          const netProceeds = amountPaid - refundedAmount;

          return (
            <div
              key={appointment.id}
              className={`p-4 space-y-3 ${
                hasOutstandingBalance
                  ? "bg-amber-50 border-l-4 border-l-amber-500"
                  : ""
              }`}
            >
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
                {appointment.status === "completed" &&
                  Number(appointment.amount_paid || 0) > 0 && (
                    <button
                      onClick={() => onRefund?.(appointment)}
                      className="px-4 py-2 rounded-lg bg-orange-600 text-white"
                    >
                      Request Refund
                    </button>
                  )}
              </div>

              <div className="text-sm space-y-1">
                <p>
                  <strong>Customer:</strong>{" "}
                  {appointment.user?.name || "Unknown"}
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
                <p>
                  <strong>Service Amount:</strong>{" "}
                  <span className="font-medium">
                    ₦{Number(appointment.service_amount || 0).toLocaleString()}
                  </span>
                </p>

                <p>
                  <strong>Amount Paid:</strong>{" "}
                  <span className="font-semibold text-blue-700">
                    ₦{amountPaid.toLocaleString()}
                  </span>
                </p>
                <p>
                  <strong>Tips:</strong>{" "}
                  {totalTips > 0 ? (
                    <span className="font-semibold text-purple-700">
                      ₦{totalTips.toLocaleString()}
                    </span>
                  ) : (
                    "₦0"
                  )}
                </p>
                <p>
                  <strong>Outstanding:</strong>{" "}
                  {hasOutstandingBalance ? (
                    <span className="font-semibold text-red-600">
                      ₦{outstandingBalance.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-green-600">Cleared</span>
                  )}
                  <p>
                    <strong>Refunded:</strong>{" "}
                    <span className="font-semibold text-red-600">
                      ₦{refundedAmount.toLocaleString()}
                    </span>
                  </p>
                  <p>
                    <strong>Net Proceeds:</strong>{" "}
                    <span className="font-semibold text-green-700">
                      ₦{netProceeds.toLocaleString()}
                    </span>
                  </p>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
