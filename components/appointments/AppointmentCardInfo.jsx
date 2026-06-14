"use client";

export default function AppointmentCardInfo({ appointment }) {
  return (
    <div className="mt-6 space-y-2">
      <p>
        <strong>Date:</strong>{" "}
        {new Date(appointment.appointment_date).toLocaleDateString()}
      </p>

      <p>
        <strong>Time:</strong> {appointment.appointment_time}
      </p>
    </div>
  );
}
