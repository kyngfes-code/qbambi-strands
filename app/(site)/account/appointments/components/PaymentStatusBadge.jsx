export default function PaymentStatusBadge({ status }) {
  const styles = {
    unpaid: "bg-red-100 text-red-700",

    deposit_paid: "bg-yellow-100 text-yellow-700",

    partial: "bg-blue-100 text-blue-700",

    settled: "bg-green-100 text-green-700",

    written_off: "bg-purple-100 text-purple-700",
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
