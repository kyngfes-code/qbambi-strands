"use client";

export default function RefundQueueTable({
  refunds = [],
  onViewAppointment,
  onProcessRefund,
}) {
  return (
    <div className="w-full">
      {/* ==============================
          Mobile / Tablet Cards
      ============================== */}
      <div className="block xl:hidden space-y-4">
        {refunds.length === 0 ? (
          <div className="bg-white border rounded-2xl p-6 text-center text-gray-500">
            No pending refunds found.
          </div>
        ) : (
          refunds.map((refund) => (
            <div
              key={refund.id}
              className="
                bg-white border rounded-2xl
                shadow-sm p-4 space-y-4
              "
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    {refund.appointment?.user?.name || "Unknown Customer"}
                  </p>

                  <p className="text-sm text-gray-500 break-all">
                    {refund.appointment?.user?.email || "-"}
                  </p>
                </div>

                <span
                  className={`shrink-0 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    refund.refund_status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {refund.refund_status === "completed"
                    ? "Completed"
                    : "Pending"}
                </span>
              </div>

              {/* Appointment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
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
              <div
                className="
                  bg-red-50 border border-red-100
                  rounded-xl p-4
                "
              >
                <p className="text-sm text-gray-500">Refund Amount</p>

                <p className="text-xl font-bold text-red-600">
                  ₦{Number(refund.amount || 0).toLocaleString()}
                </p>
              </div>

              {/* Reason */}
              {refund.note && (
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Refund Reason
                  </p>

                  <p className="text-sm text-gray-600 mt-1">{refund.note}</p>
                </div>
              )}

              {/* Requested By */}
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Requested By</p>

                  <p className="font-medium">
                    {refund.recorder?.name || "Unknown"}
                  </p>
                </div>

                {refund.refund_status === "completed" && (
                  <>
                    <div>
                      <p className="text-gray-500">Approved By</p>

                      <p className="font-medium">
                        {refund.approver?.name || "Unknown"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Approved At</p>

                      <p className="font-medium">
                        {refund.approved_at
                          ? new Date(refund.approved_at).toLocaleString()
                          : "-"}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div
                className="
                  flex flex-col sm:flex-row
                  gap-3 pt-2
                "
              >
                <button
                  onClick={() => onViewAppointment?.(refund.appointment)}
                  className="
                    flex-1
                    px-4 py-3
                    rounded-xl
                    border
                    hover:bg-gray-50
                    transition
                  "
                >
                  View Appointment
                </button>

                {refund.refund_status === "pending" && (
                  <button
                    onClick={() => onProcessRefund?.(refund)}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white"
                  >
                    Process
                  </button>
                )}
              </div>
            </div>
          ))
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

              <th className="px-6 py-4 font-semibold">Refund Amount</th>

              <th className="px-6 py-4 font-semibold">Requested By</th>

              <th className="px-6 py-4 font-semibold">Requested At</th>

              <th className="px-6 py-4 font-semibold">Approved By</th>

              <th className="px-6 py-4 font-semibold">Approved At</th>

              <th className="px-6 py-4 font-semibold">Reason</th>

              <th className="px-6 py-4 font-semibold">Status</th>

              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {refunds.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="
                    px-6 py-12
                    text-center text-gray-500
                  "
                >
                  No pending refunds found.
                </td>
              </tr>
            ) : (
              refunds.map((refund) => (
                <tr
                  key={refund.id}
                  className="
                    border-b
                    hover:bg-gray-50
                  "
                >
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
                      ₦{Number(refund.amount || 0).toLocaleString()}
                    </span>
                  </td>

                  {/* Recorder */}
                  <td className="px-6 py-5">
                    {refund.recorder?.name || "Unknown"}
                  </td>

                  {/* Date */}
                  <td className="px-6 py-5 text-sm">
                    {refund.created_at
                      ? new Date(refund.created_at).toLocaleString()
                      : "-"}
                  </td>

                  {/* Approved By */}
                  <td className="px-6 py-5">
                    {refund.refund_status === "completed"
                      ? refund.approver?.name || "Unknown"
                      : "-"}
                  </td>

                  {/* Approved At */}
                  <td className="px-6 py-5 text-sm">
                    {refund.refund_status === "completed"
                      ? refund.approved_at
                        ? new Date(refund.approved_at).toLocaleString()
                        : "-"
                      : "-"}
                  </td>

                  {/* Reason */}
                  <td className="px-6 py-5 max-w-xs">
                    <p
                      className="
                        text-sm text-gray-600
                        line-clamp-2
                      "
                    >
                      {refund.refund_note || "-"}
                    </p>
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        refund.refund_status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {refund.refund_status === "completed"
                        ? "Completed"
                        : "Pending"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => onViewAppointment?.(refund.appointment)}
                        className="
                          px-4 py-2
                          rounded-lg
                          border
                          hover:bg-gray-100
                        "
                      >
                        View
                      </button>

                      {refund.refund_status === "pending" && (
                        <button
                          onClick={() => onProcessRefund?.(refund)}
                          className="
                          px-4 py-2
                          rounded-lg
                          bg-green-600
                          text-white
                          hover:bg-green-700
                        "
                        >
                          Process
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
