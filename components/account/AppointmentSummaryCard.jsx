export default function AppointmentSummaryCard({ appointment }) {
  return (
    <section className="rounded-xl border bg-white p-6">
      <h2 className="mb-5 text-lg font-semibold">Appointment</h2>

      <div className="grid gap-5 md:grid-cols-2">
        <Item label="Service" value={appointment.service_name} />

        <Item label="Status" value={appointment.status} />

        <Item label="Date" value={appointment.appointment_date} />

        <Item label="Time" value={appointment.appointment_time} />

        <Item label="Notes" value={appointment.notes || "-"} />

        <Item label="Created" value={appointment.created_at} />
      </div>
    </section>
  );
}

function Item({ label, value }) {
  return (
    <div>
      <div className="text-sm text-neutral-500">{label}</div>

      <div className="font-medium">{value}</div>
    </div>
  );
}
