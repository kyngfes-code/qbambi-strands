import SummaryCard from "./SummaryCard";

export default function SummaryCards({ summary }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard title="Orders" value={summary.orders.total_orders} />

      <SummaryCard title="Appointments" value={summary.appointments.active} />

      <SummaryCard
        title="Outstanding"
        value={`₦${Number(
          summary.payments.outstanding_balance,
        ).toLocaleString()}`}
      />

      <SummaryCard title="Refunds" value={summary.refunds.pending} />
    </div>
  );
}
