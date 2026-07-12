import Link from "next/link";

import AppointmentStatusBadge from "./AppointmentStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";

export default function AppointmentCard({ appointment }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">{appointment.service_name}</h2>

          <p className="text-sm text-neutral-500">
            {appointment.appointment_date}
          </p>

          <p className="text-sm text-neutral-500">
            {appointment.appointment_time}
          </p>
        </div>

        <AppointmentStatusBadge status={appointment.status} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-neutral-500">Amount Paid</p>

          <p>₦{Number(appointment.amount_paid).toLocaleString()}</p>
        </div>

        <div>
          <p className="text-neutral-500">Balance</p>

          <p>₦{Number(appointment.balance_due).toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <PaymentStatusBadge status={appointment.payment_completion_status} />

        <Link
          href={`/account/appointments/${appointment.id}`}
          className="rounded-lg border px-4 py-2 text-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
