export default function SummaryCard({ title, value }) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <p className="text-sm text-neutral-500">{title}</p>

      <h2 className="mt-2 text-3xl font-bold">{value}</h2>
    </div>
  );
}
