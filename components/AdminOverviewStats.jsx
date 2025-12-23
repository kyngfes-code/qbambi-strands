export default function AdminOverviewStats({ overview }) {
  return (
    <section className="grid grid-cols-3 gap-4">
      <Stat title="Total Expected" value={overview.total_expected_revenue} />
      <Stat title="Collected" value={overview.total_collected} />
      <Stat title="Outstanding" value={overview.total_outstanding} />
    </section>
  );
}

function Stat({ title, value }) {
  return (
    <div className="bg-white rounded-xl p-4">
      <p className="text-sm text-neutral-500">{title}</p>
      <p className="text-xl font-bold">₦{Number(value).toLocaleString()}</p>
    </div>
  );
}
