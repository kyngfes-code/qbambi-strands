"use client";

export default function AppointmentDetailsModal({ appointment, onClose }) {
  if (!appointment) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-6">
      <div
        className="
          bg-white rounded-2xl shadow-xl
          w-full max-w-5xl
          max-h-[95vh]
          overflow-y-auto
        "
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold">
              Appointment Details
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Booking ID: {appointment.id.slice(0, 8)}
            </p>
          </div>

          <button
            onClick={onClose}
            className="
              px-4 py-2
              rounded-lg
              border
              hover:bg-gray-100
            "
          >
            Close
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Status */}
          <div>
            <span
              className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${
                appointment.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : appointment.status === "confirmed"
                    ? "bg-blue-100 text-blue-700"
                    : appointment.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : appointment.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
              }`}
            >
              {appointment.status}
            </span>
          </div>

          {/* Customer + Appointment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer */}
            <div className="border rounded-2xl p-5">
              <h3 className="font-bold text-lg mb-4">Customer Information</h3>

              <div className="space-y-2 text-sm sm:text-base">
                <p>
                  <strong>Name:</strong> {appointment.user?.name || "-"}
                </p>

                <p>
                  <strong>Email:</strong> {appointment.user?.email || "-"}
                </p>

                <p>
                  <strong>User ID:</strong> {appointment.user_id}
                </p>
              </div>
            </div>

            {/* Appointment */}
            <div className="border rounded-2xl p-5">
              <h3 className="font-bold text-lg mb-4">
                Appointment Information
              </h3>

              <div className="space-y-2 text-sm sm:text-base">
                <p>
                  <strong>Service:</strong> {appointment.service_name}
                </p>

                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(appointment.appointment_date).toLocaleDateString()}
                </p>

                <p>
                  <strong>Time:</strong> {appointment.appointment_time}
                </p>

                <p>
                  <strong>Booked:</strong>{" "}
                  {new Date(appointment.created_at).toLocaleString()}
                </p>

                {appointment.notes && (
                  <p>
                    <strong>Customer Notes:</strong> {appointment.notes}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="border rounded-2xl p-5">
            <h3 className="font-bold text-lg mb-4">Pricing & Payments</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Service Amount</p>

                <p className="font-bold mt-1">
                  ₦{Number(appointment.service_amount || 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Deposit Required</p>

                <p className="font-bold mt-1">
                  ₦{Number(appointment.deposit_required || 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Amount Paid</p>

                <p className="font-bold mt-1 text-green-700">
                  ₦{Number(appointment.amount_paid || 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Balance Due</p>

                <p className="font-bold mt-1 text-red-600">
                  ₦{Number(appointment.balance_due || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {appointment.payment_type && (
              <p className="mt-4 text-sm">
                <strong>Payment Type:</strong> {appointment.payment_type}
              </p>
            )}
          </div>

          {/* Payment History */}
          <div className="border rounded-2xl p-5">
            <h3 className="font-bold text-lg mb-4">Payment History</h3>

            {!appointment.appointment_payments?.length ? (
              <p className="text-gray-500">No payments recorded.</p>
            ) : (
              <div className="space-y-4">
                {appointment.appointment_payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="
                        border rounded-xl p-4
                        flex flex-col gap-3
                        sm:flex-row
                        sm:justify-between
                      "
                  >
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Amount:</strong> ₦
                        {Number(payment.amount).toLocaleString()}
                      </p>

                      <p>
                        <strong>Method:</strong> {payment.payment_method}
                      </p>

                      <p>
                        <strong>Status:</strong> {payment.status}
                      </p>

                      <p>
                        <strong>Submitted:</strong>{" "}
                        {new Date(payment.created_at).toLocaleString()}
                      </p>

                      {payment.rejection_reason && (
                        <p className="text-red-600">
                          <strong>Reason:</strong> {payment.rejection_reason}
                        </p>
                      )}

                      {payment.customer_message && (
                        <p>
                          <strong>Message:</strong> {payment.customer_message}
                        </p>
                      )}
                    </div>

                    {payment.receipt_url && (
                      <div>
                        <a
                          href={payment.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                              inline-block
                              px-4 py-2
                              rounded-lg
                              bg-blue-600
                              text-white
                              hover:bg-blue-700
                            "
                        >
                          View Receipt
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cancellation */}
          {appointment.status === "cancelled" && (
            <div className="border border-red-200 bg-red-50 rounded-2xl p-5">
              <h3 className="font-bold text-red-700 mb-4">
                Cancellation Information
              </h3>

              <div className="space-y-2 text-sm sm:text-base">
                <p>
                  <strong>Reason:</strong>{" "}
                  {appointment.cancellation_reason || "-"}
                </p>

                <p>
                  <strong>Customer Message:</strong>{" "}
                  {appointment.cancellation_customer_message || "-"}
                </p>

                <p>
                  <strong>Admin Note:</strong>{" "}
                  {appointment.cancellation_admin_note || "-"}
                </p>

                {appointment.cancelled_at && (
                  <p>
                    <strong>Cancelled At:</strong>{" "}
                    {new Date(appointment.cancelled_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {appointment.admin_notes && (
            <div className="border rounded-2xl p-5">
              <h3 className="font-bold text-lg mb-3">Admin Notes</h3>

              <p className="whitespace-pre-wrap">{appointment.admin_notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
