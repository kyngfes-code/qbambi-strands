"use client";

export default function AppointmentFinancialHistory({
  appointment,
  variant = "customer",
}) {
  const customerLedger = [
    ...(appointment.appointment_payments || []).map((payment) => ({
      label: "Deposit Payment",
      amount: payment.amount,
      paymentMethod: payment.payment_method,
      createdAt: payment.created_at,
      status: payment.status,
    })),

    ...(appointment.appointment_payment_adjustments || [])
      .filter((adjustment) =>
        [
          "outstanding_payment",
          "refund",
          "overpayment_refund",
          "write_off",
        ].includes(adjustment.adjustment_type),
      )
      .map((adjustment) => ({
        label:
          adjustment.adjustment_type === "outstanding_payment"
            ? "Balance Payment"
            : adjustment.adjustment_type === "refund"
              ? "Refund"
              : adjustment.adjustment_type === "overpayment_refund"
                ? "Overpayment Refund"
                : "Write Off",

        amount: adjustment.amount,

        paymentMethod: adjustment.payment_method || adjustment.refund_method,

        createdAt: adjustment.refunded_at || adjustment.created_at,

        status: adjustment.status,
        adminNote: adjustment.reason,
      })),
  ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div className="border rounded-2xl p-5">
      <h3 className="font-bold text-lg mb-4">Financial History</h3>

      {customerLedger.length === 0 ? (
        <p>No payments recorded.</p>
      ) : (
        <div className="space-y-4">
          {customerLedger.map((entry, index) => {
            const isNegative =
              entry.label === "Refund" ||
              entry.label === "Overpayment Refund" ||
              entry.label === "Write Off";

            return (
              <div
                key={index}
                className="border rounded-xl p-4 flex justify-between"
              >
                <div>
                  <p className="font-medium">{entry.label}</p>

                  <p className="text-sm text-gray-500">
                    {new Date(entry.createdAt).toLocaleString()}
                  </p>

                  {entry.paymentMethod && (
                    <p className="text-sm text-gray-500">
                      Method:{" "}
                      {entry.paymentMethod.replaceAll("_", " ").toUpperCase()}
                    </p>
                  )}
                  {variant === "admin" && entry.adminNote && (
                    <p className="text-sm text-blue-600 mt-1">
                      Admin Note: {entry.adminNote}
                    </p>
                  )}
                </div>

                <p
                  className={`font-semibold ${
                    isNegative ? "text-red-600" : "text-green-700"
                  }`}
                >
                  {isNegative ? "-" : "+"}₦
                  {Number(entry.amount).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-sm text-gray-500">Outstanding Payment</p>

        <p className="font-bold mt-1 text-red-600">
          ₦{Number(appointment.balance_due || 0).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
