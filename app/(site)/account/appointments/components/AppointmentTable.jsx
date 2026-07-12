import Link from "next/link";

import AppointmentStatusBadge from "./AppointmentStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";

export default function AppointmentTable({ appointments }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="min-w-full">
        <thead className="bg-neutral-100">
          <tr>
            <th className="px-5 py-3 text-left">Service</th>

            <th>Date</th>

            <th>Status</th>

            <th>Paid</th>

            <th>Balance</th>

            <th>Payment</th>

            <th />
          </tr>
        </thead>

        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment.id} className="border-t">
              <td className="px-5 py-4">{appointment.service_name}</td>

              <td>{appointment.appointment_date}</td>

              <td>
                <AppointmentStatusBadge status={appointment.status} />
              </td>

              <td>₦{Number(appointment.amount_paid).toLocaleString()}</td>

              <td>₦{Number(appointment.balance_due).toLocaleString()}</td>

              <td>
                <PaymentStatusBadge
                  status={appointment.payment_completion_status}
                />
              </td>

              <td>
                <Link href={`/account/appointments/${appointment.id}`}>
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
