"use client";

export default function CompletedSection({ appointment }) {
  return (
    <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
      <p className="font-medium text-green-700">Appointment Completed</p>

      <p className="text-sm text-green-600 mt-1">
        Thank you for choosing Q-Bambi.
      </p>

      {appointment.completed_at && (
        <p className="text-xs text-green-500 mt-2">
          Completed on {new Date(appointment.completed_at).toLocaleString()}
        </p>
      )}

      {Number(appointment.balance_due || 0) > 0 ? (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="font-medium text-red-700">
            Outstanding Balance: ₦
            {Number(appointment.balance_due).toLocaleString()}
          </p>
        </div>
      ) : (
        <div className="mt-4 rounded-lg bg-green-100 border border-green-200 p-3">
          <p className="font-medium text-green-700">Payment fully settled.</p>
        </div>
      )}
    </div>
  );
}
