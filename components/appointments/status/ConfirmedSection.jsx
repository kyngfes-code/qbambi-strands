"use client";

export default function ConfirmedSection({ appointment }) {
  return (
    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
      <p className="font-medium text-blue-700">Appointment Confirmed</p>

      <p className="text-sm text-blue-600 mt-1">
        We look forward to seeing you. Please arrive on time.
      </p>

      <div className="mt-3 space-y-1">
        <p>
          <strong>Total Cost:</strong> ₦
          {Number(appointment.service_amount || 0).toLocaleString()}
        </p>

        <p>
          <strong>Amount Paid:</strong> ₦
          {Number(appointment.amount_paid || 0).toLocaleString()}
        </p>

        <p>
          <strong>Outstanding Balance:</strong> ₦
          {Number(appointment.balance_due || 0).toLocaleString()}
        </p>
      </div>

      {appointment.confirmed_at && (
        <p className="text-xs text-blue-500 mt-3">
          Confirmed on {new Date(appointment.confirmed_at).toLocaleString()}
        </p>
      )}
    </div>
  );
}
