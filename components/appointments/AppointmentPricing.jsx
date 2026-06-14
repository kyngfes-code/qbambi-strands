"use client";

export default function AppointmentPricing({ appointment }) {
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
      </div>
    </div>
  );
}
