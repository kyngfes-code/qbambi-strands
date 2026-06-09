"use client";

export default function PendingAppointmentPaymentsTable({
  payments,
  onConfirm,
  onReject,
  onViewAppointment,
}) {
  if (!payments?.length) {
    return (
      <p className="text-sm text-neutral-500">
        No pending appointment payments.
      </p>
    );
  }

  return (
    <table className="w-full border text-sm mt-4">
      <thead className="bg-neutral-100">
        <tr>
          <th className="p-2 border">Appointment</th>
          <th className="p-2 border">Customer</th>
          <th className="p-2 border">Service</th>
          <th className="p-2 border">Amount</th>
          <th className="p-2 border">Method</th>
          <th className="p-2 border">Receipt</th>
          <th className="p-2 border">Submitted</th>
          <th className="p-2 border">Actions</th>
        </tr>
      </thead>

      <tbody>
        {payments.map((payment) => (
          <tr key={payment.id}>
            {/* Appointment */}
            <td className="p-2 border">
              <button
                onClick={() => onViewAppointment(payment.appointment?.id)}
                className="text-blue-600 underline"
              >
                #{payment.appointment?.id?.slice(0, 8)}
              </button>
            </td>

            {/* Customer */}
            <td className="p-2 border">
              <div>
                <p className="font-medium">
                  {payment.appointment?.customer?.name || "-"}
                </p>

                <p className="text-xs text-neutral-500">
                  {payment.appointment?.customer?.email || "-"}
                </p>
              </div>
            </td>

            {/* Service */}
            <td className="p-2 border">
              {payment.appointment?.service_name || "-"}
            </td>

            {/* Amount */}
            <td className="p-2 border">
              ₦{Number(payment.amount || 0).toLocaleString()}
            </td>

            {/* Payment Method */}
            <td className="p-2 border capitalize">
              {payment.payment_method?.replace("_", " ") || "-"}
            </td>

            {/* Receipt */}
            <td className="p-2 border">
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
                <span className="text-neutral-400">No receipt</span>
              )}
            </td>

            {/* Submitted */}
            <td className="p-2 border">
              {payment.created_at
                ? new Date(payment.created_at).toLocaleString()
                : "-"}
            </td>

            {/* Actions */}
            <td className="p-2 border">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onConfirm(payment.id)}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Confirm
                </button>

                <button
                  onClick={() => onReject(payment.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
