"use client";

export default function AppointmentPricing({ appointment }) {
  const amountPaid = Number(appointment.amount_paid || 0);

  const totalTips =
    appointment.appointment_payment_adjustments?.reduce(
      (sum, adjustment) => sum + Number(adjustment.tip_amount || 0),
      0,
    ) || 0;

  const refundedAmount = Number(appointment.refunded_amount || 0);

  const netPayment = amountPaid + totalTips - refundedAmount;

  return (
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

        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Amount Paid</p>

          <p className="font-bold mt-1 text-green-700">
            ₦{Number(appointment.amount_paid || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Balance Due</p>

          <p className="font-bold mt-1 text-red-600">
            ₦{Number(appointment.balance_due || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Tips</p>

          <p className="font-bold mt-1 text-purple-700">
            ₦{totalTips.toLocaleString()}
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Refunded</p>

          <p className="font-bold mt-1 text-orange-700">
            ₦{refundedAmount.toLocaleString()}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Net Payment</p>

          <p className="font-bold mt-1 text-blue-700">
            ₦{netPayment.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
