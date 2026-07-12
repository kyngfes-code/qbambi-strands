export default function PricingHistoryCard({ history }) {
  return (
    <section className="rounded-xl border bg-white p-6">
      <h2 className="mb-5 text-lg font-semibold">Pricing History</h2>

      {history.length === 0 ? (
        <p className="text-neutral-500">No pricing changes.</p>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="rounded-lg border p-4">
              <div className="font-semibold">
                ₦{Number(item.old_service_amount).toLocaleString()}
                {" → "}₦{Number(item.new_service_amount).toLocaleString()}
              </div>

              <div className="mt-1 text-sm text-neutral-500">
                {item.reason || "-"}
              </div>

              <div className="text-xs text-neutral-500">{item.created_at}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
