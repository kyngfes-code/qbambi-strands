"use client";

import AppointmentStatusBadge from "./AppointmentStatusBadge";

export default function AppointmentCardHeader({ appointment }) {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
      <div>
        <h2 className="text-xl font-semibold">{appointment.service_name}</h2>

        <p className="text-sm text-neutral-500 mt-1">
          Booking ID: {appointment.id.slice(0, 8)}
        </p>

        <p className="text-sm text-neutral-500">
          Booked on {new Date(appointment.created_at).toLocaleDateString()}
        </p>
      </div>

      <AppointmentStatusBadge status={appointment.status} />
    </div>
  );
}
