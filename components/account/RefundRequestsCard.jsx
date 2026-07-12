export default function RefundRequestsCard({ refunds }) {
  return (
    <section className="rounded-xl border bg-white p-6">
      <h2 className="mb-5 text-lg font-semibold">Refund Requests</h2>

      {refunds.length === 0 ? (
        <p className="text-neutral-500">No refund requests.</p>
      ) : (
        <div className="space-y-4">
          {refunds.map((refund) => (
            <div key={refund.id} className="rounded-lg border p-4">
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">
                    ₦{Number(refund.requested_amount).toLocaleString()}
                  </div>

                  <div className="text-sm text-neutral-500">
                    {refund.reason}
                  </div>

                  <div className="text-xs text-neutral-500">
                    {refund.created_at}
                  </div>
                </div>

                <div className="font-medium">{refund.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
