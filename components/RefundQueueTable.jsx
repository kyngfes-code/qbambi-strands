"use client";

export default function RefundQueueTable({
  refunds = [],
  onViewAppointment,
  onProcessRefund,
  onRejectRefund,
}) {
  return (
    <div className="w-full">
      {/* ==============================
          Mobile / Tablet Cards
      ============================== */}

      <div className="block xl:hidden space-y-4">
        {refunds.length === 0 ? (
          <div className="rounded-2xl border bg-white p-6 text-center text-gray-500">
            No refund requests found.
          </div>
        ) : (
          refunds.map((refund) => {
            const refundAmount =
              refund.status !== "rejected"
                ? Number(refund.approved_amount ?? refund.requested_amount ?? 0)
                : Number(refund.requested_amount ?? 0);

            return (
              <div
                key={refund.id}
                className="space-y-4 rounded-2xl border bg-white p-4 shadow-sm"
              >
                {/* Header */}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {refund.appointment?.user?.name || "Unknown Customer"}
                    </p>

                    <p className="break-all text-sm text-gray-500">
                      {refund.appointment?.user?.email || "-"}
                    </p>
                  </div>

                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      refund.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : refund.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {refund.status
                      ? refund.status.charAt(0).toUpperCase() +
                        refund.status.slice(1)
                      : "Unknown"}
                  </span>
                </div>

                {/* Appointment */}

                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-gray-500">Service</p>

                    <p className="font-medium">
                      {refund.appointment?.service_name || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Appointment ID</p>

                    <p className="font-medium">
                      {refund.appointment?.id?.slice(0, 8) || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Appointment Date</p>

                    <p className="font-medium">
                      {refund.appointment?.appointment_date
                        ? new Date(
                            refund.appointment.appointment_date,
                          ).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Requested</p>

                    <p className="font-medium">
                      {refund.created_at
                        ? new Date(refund.created_at).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* Refund Amount */}

                <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                  <p className="text-sm text-gray-500">Requested Amount</p>

                  <p className="text-xl font-bold text-red-600">
                    ₦{Number(refundAmount || 0).toLocaleString()}
                  </p>
                </div>

                {/* Refund Reason */}

                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Refund Reason
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {refund.reason || "-"}
                  </p>
                </div>

                {refund.status === "rejected" && refund.rejection_reason && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                    <p className="text-sm font-medium text-red-700">
                      Rejection Reason
                    </p>

                    <p className="mt-1 text-sm text-red-600">
                      {refund.rejection_reason}
                    </p>
                  </div>
                )}

                {/* Customer Message */}

                {refund.customer_message && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Customer Message
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      {refund.customer_message}
                    </p>
                  </div>
                )}

                {/* Request Details */}

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500">Requested By</p>

                    <p className="font-medium">
                      {refund.requested_by?.name ||
                        refund.requester?.name ||
                        "Unknown"}
                    </p>
                  </div>

                  {refund.status === "approved" && (
                    <>
                      <div>
                        <p className="text-gray-500">Processed By</p>

                        <p className="font-medium">
                          {refund.processor?.name || "Unknown"}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500">Processed At</p>

                        <p className="font-medium">
                          {refund.processed_at
                            ? new Date(refund.processed_at).toLocaleString()
                            : "-"}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Admin Note */}

                {refund.admin_note && (
                  <div className="rounded-xl border bg-neutral-50 p-3">
                    <p className="text-sm font-medium text-gray-700">
                      Admin Note
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      {refund.admin_note}
                    </p>
                  </div>
                )}

                {/* Actions */}

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <button
                    onClick={() => onViewAppointment?.(refund.appointment)}
                    className="flex-1 rounded-xl border px-4 py-3 transition hover:bg-gray-50"
                  >
                    View Appointment
                  </button>

                  {refund.status === "pending" && (
                    <>
                      <button
                        onClick={() => onProcessRefund?.(refund)}
                        className="rounded-lg bg-green-600 px-4 py-3 text-white hover:bg-green-700"
                      >
                        Process
                      </button>
                      <button
                        onClick={() => onRejectRefund(refund)}
                        className="rounded-lg bg-red-600 px-3 py-2 text-white"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ==============================
          Desktop Table
      ============================== */}
      <div className="hidden xl:block overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-sm text-gray-600">
              <th className="px-6 py-4 font-semibold">Customer</th>

              <th className="px-6 py-4 font-semibold">Service</th>

              <th className="px-6 py-4 font-semibold">Appointment</th>

              <th className="px-6 py-4 font-semibold">Requested Amount</th>

              <th className="px-6 py-4 font-semibold">Requested By</th>

              <th className="px-6 py-4 font-semibold">Requested At</th>

              <th className="px-6 py-4 font-semibold">Processed By</th>

              <th className="px-6 py-4 font-semibold">Processed At</th>

              <th className="px-6 py-4 font-semibold">Reason</th>

              <th className="px-6 py-4 font-semibold">Status</th>

              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {refunds.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No refund requests found.
                </td>
              </tr>
            ) : (
              refunds.map((refund) => {
                const refundAmount =
                  refund.status !== "rejected"
                    ? Number(
                        refund.approved_amount ?? refund.requested_amount ?? 0,
                      )
                    : Number(refund.requested_amount ?? 0);

                return (
                  <tr key={refund.id} className="border-b hover:bg-gray-50">
                    {/* Customer */}
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-medium">
                          {refund.appointment?.user?.name || "Unknown"}
                        </p>

                        <p className="text-sm text-gray-500">
                          {refund.appointment?.user?.email || "-"}
                        </p>
                      </div>
                    </td>

                    {/* Service */}
                    <td className="px-6 py-5">
                      {refund.appointment?.service_name || "-"}
                    </td>

                    {/* Appointment */}
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <p className="font-medium">
                          {refund.appointment?.id?.slice(0, 8)}
                        </p>

                        <p className="text-sm text-gray-500">
                          {refund.appointment?.appointment_date
                            ? new Date(
                                refund.appointment.appointment_date,
                              ).toLocaleDateString()
                            : "-"}
                        </p>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-5">
                      <span className="font-bold text-red-600">
                        ₦{Number(refundAmount || 0).toLocaleString()}
                      </span>
                    </td>

                    {/* Requested By */}
                    <td className="px-6 py-5">
                      {refund.requested_by?.name ||
                        refund.requester?.name ||
                        "Unknown"}
                    </td>

                    {/* Requested At */}
                    <td className="px-6 py-5 text-sm">
                      {refund.created_at
                        ? new Date(refund.created_at).toLocaleString()
                        : "-"}
                    </td>

                    {/* Approved By */}
                    <td className="px-6 py-5">
                      {refund.status !== "pending"
                        ? refund.processed?.name ||
                          refund.processor?.name ||
                          "Unknown"
                        : "-"}
                    </td>

                    {/* Approved At */}
                    <td className="px-6 py-5 text-sm">
                      {refund.status !== "pending"
                        ? refund.processed_at
                          ? new Date(refund.processed_at).toLocaleString()
                          : "-"
                        : "-"}
                    </td>

                    {/* Reason */}
                    <td className="px-6 py-5 max-w-xs">
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-semibold text-gray-500">
                            Refund
                          </p>

                          <p className="text-sm text-gray-700 line-clamp-2">
                            {refund.reason || "-"}
                          </p>
                        </div>

                        {refund.status === "rejected" &&
                          refund.rejection_reason && (
                            <div>
                              <p className="text-xs font-semibold text-red-600">
                                Rejection
                              </p>

                              <p className="text-sm text-red-600 line-clamp-2">
                                {refund.rejection_reason}
                              </p>
                            </div>
                          )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          refund.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : refund.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {refund.status
                          ? refund.status.charAt(0).toUpperCase() +
                            refund.status.slice(1)
                          : "Unknown"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() =>
                            onViewAppointment?.(refund.appointment)
                          }
                          className="px-4 py-2 rounded-lg border hover:bg-gray-100"
                        >
                          View
                        </button>

                        {refund.status === "pending" && (
                          <>
                            <button
                              onClick={() => onProcessRefund?.(refund)}
                              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                            >
                              Process
                            </button>
                            <button
                              onClick={() => onRejectRefund(refund)}
                              className="rounded-lg bg-red-600 px-3 py-2 text-white"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
