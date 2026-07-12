export default function PaymentHistoryTimeline({ payments }) {
  return (
    <section className="rounded-xl border bg-white p-6">
      <h2 className="mb-5 text-lg font-semibold">Payment History</h2>

      {payments.length === 0 ? (
        <p className="text-neutral-500">No payment history.</p>
      ) : (
        <div className="space-y-4">
          {payments.map((item) => (
            <div key={item.id} className="rounded-lg border p-4">
              <div className="flex justify-between gap-5">
                <div>
                  <div className="font-semibold">{item.description}</div>

                  <div className="mt-1 text-sm text-neutral-500">
                    {item.transaction_type}
                  </div>

                  <div className="text-sm text-neutral-500">
                    {item.created_at}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold">
                    ₦{Number(item.amount).toLocaleString()}
                  </div>

                  {Number(item.tip_amount) > 0 && (
                    <div className="text-green-600 text-sm">
                      Tip ₦{Number(item.tip_amount).toLocaleString()}
                    </div>
                  )}

                  <div className="text-xs text-neutral-500">{item.status}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
