"use client";

export default function PendingAppointmentPaymentsTable({
  payments = [],
  onConfirm,
  onReject,
  onViewAppointment,
}) {
  if (!payments.length) {
    return (
      <div className="bg-white rounded-xl border p-6 text-center text-neutral-500">
        No pending appointment payments.
      </div>
    );
  }

  const sortedPayments = [...payments].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      {/* ======================================
          TABLET / LAPTOP / DESKTOP
      ====================================== */}
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

              <th className="px-4 py-3 text-left whitespace-nowrap">Amount</th>

              <th className="px-4 py-3 text-left whitespace-nowrap">Method</th>

              <th className="px-4 py-3 text-left whitespace-nowrap">Receipt</th>

              <th className="px-4 py-3 text-left whitespace-nowrap">
                Submitted
              </th>

              <th className="px-4 py-3 text-center whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedPayments.map((payment) => (
              <tr key={payment.id} className="border-t hover:bg-neutral-50">
                {/* Appointment */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onViewAppointment?.(payment.appointment)}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    #{payment.appointment?.id?.slice(0, 8) || "-"}
                  </button>
                </td>

                {/* Customer */}
                <td className="px-4 py-4">
                  <div className="min-w-[180px]">
                    <p className="font-medium">
                      {payment.appointment?.user?.name || "-"}
                    </p>

                    <p className="text-xs text-neutral-500 break-all">
                      {payment.appointment?.user?.email || "-"}
                    </p>
                  </div>
                </td>

                {/* Service */}
                <td className="px-4 py-4">
                  <div className="min-w-[160px]">
                    {payment.appointment?.service_name || "-"}
                  </div>
                </td>

                {/* Amount */}
                <td className="px-4 py-4 whitespace-nowrap font-medium">
                  ₦{Number(payment.amount || 0).toLocaleString()}
                </td>

                {/* Method */}
                <td className="px-4 py-4 whitespace-nowrap capitalize">
                  {payment.payment_method?.replace("_", " ") || "-"}
                </td>

                {/* Receipt */}
                <td className="px-4 py-4 whitespace-nowrap">
                  {payment.receipt_url ? (
                    <a
                      href={payment.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Receipt
                    </a>
                  ) : (
                    <span className="text-neutral-400">No receipt</span>
                  )}
                </td>

                {/* Submitted */}
                <td className="px-4 py-4 whitespace-nowrap">
                  {payment.created_at ? (
                    <>
                      <p>{new Date(payment.created_at).toLocaleDateString()}</p>

                      <p className="text-xs text-neutral-500">
                        {new Date(payment.created_at).toLocaleTimeString()}
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
                      onClick={() => onConfirm?.(payment.id)}
                      className="
                        px-3 py-2
                        rounded-lg
                        bg-green-600
                        text-white
                        hover:bg-green-700
                        transition
                      "
                    >
                      Confirm
                    </button>

                    <button
                      onClick={() => onReject?.(payment.id)}
                      className="
                        px-3 py-2
                        rounded-lg
                        bg-red-600
                        text-white
                        hover:bg-red-700
                        transition
                      "
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ======================================
          MOBILE CARDS
      ====================================== */}
      <div className="md:hidden divide-y">
        {sortedPayments.map((payment) => (
          <div key={payment.id} className="p-4 space-y-4">
            <div className="flex justify-between items-start gap-3">
              <div>
                <button
                  onClick={() => onViewAppointment?.(payment.appointment)}
                  className="font-semibold text-blue-600"
                >
                  #{payment.appointment?.id?.slice(0, 8) || "-"}
                </button>

                <p className="text-sm text-neutral-500">
                  {payment.appointment?.service_name || "-"}
                </p>
              </div>

              <span className="font-semibold">
                ₦{Number(payment.amount || 0).toLocaleString()}
              </span>
            </div>

            <div className="text-sm space-y-2">
              <p>
                <strong>Customer:</strong>{" "}
                {payment.appointment?.user?.name || "-"}
              </p>

              <p className="break-all text-neutral-500">
                {payment.appointment?.user?.email || "-"}
              </p>

              <p>
                <strong>Method:</strong>{" "}
                {payment.payment_method?.replace("_", " ") || "-"}
              </p>

              <p>
                <strong>Submitted:</strong>{" "}
                {payment.created_at
                  ? new Date(payment.created_at).toLocaleString()
                  : "-"}
              </p>

              <p>
                <strong>Receipt:</strong>{" "}
                {payment.receipt_url ? (
                  <a
                    href={payment.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View Receipt
                  </a>
                ) : (
                  "No receipt"
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onConfirm?.(payment.id)}
                className="
                  px-3 py-2
                  rounded-lg
                  bg-green-600
                  text-white
                  text-sm
                "
              >
                Confirm
              </button>

              <button
                onClick={() => onReject?.(payment.id)}
                className="
                  px-3 py-2
                  rounded-lg
                  bg-red-600
                  text-white
                  text-sm
                "
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
