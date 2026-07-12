export default function AppointmentStatusBadge({ status }) {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800",

    confirmed: "bg-blue-100 text-blue-800",

    completed: "bg-green-100 text-green-800",

    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        styles[status] || "bg-neutral-100 text-neutral-700"
      }`}
    >
      {status}
    </span>
  );
}
