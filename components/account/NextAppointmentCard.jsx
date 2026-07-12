export default function NextAppointmentCard({ appointment }) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <h2 className="font-semibold">Next Appointment</h2>

      {appointment?.id ? (
        <>
          <p className="mt-4 font-medium">{appointment.service}</p>

          <p className="text-sm text-neutral-500">{appointment.date}</p>

          <p className="text-sm text-neutral-500">{appointment.time}</p>
        </>
      ) : (
        <p className="mt-4 text-neutral-500">No upcoming appointments.</p>
      )}
    </div>
  );
}
