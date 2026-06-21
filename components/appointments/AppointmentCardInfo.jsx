"use client";

export default function AppointmentCardInfo({ appointment }) {
  return (
    <div className="mt-6 space-y-2">
      <p>
        <strong>Appointment Date:</strong>{" "}
        {new Date(appointment.appointment_date).toLocaleDateString()}
      </p>

      <p>
        <strong>Appointment Time:</strong> {appointment.appointment_time}
      </p>
      <p>Kindly keep to the appointment time</p>
    </div>
  );
}
