export default function AppointmentFilters({ status, setStatus }) {
  return (
    <select
      value={status}
      onChange={(e) => setStatus(e.target.value)}
      className="rounded-lg border bg-white px-4 py-2"
    >
      <option value="all">All Appointments</option>

      <option value="pending">Pending</option>

      <option value="confirmed">Confirmed</option>

      <option value="completed">Completed</option>

      <option value="cancelled">Cancelled</option>
    </select>
  );
}
