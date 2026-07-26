export default function FinancialSummaryCard({ summary }) {
  const refunded = Number(summary.refunded_amount || 0);

  const netPaid = Number(summary.amount_paid || 0) - refunded;
  return (
    <section className="rounded-xl border bg-white p-6">
      <h2 className="mb-5 text-lg font-semibold">Financial Summary</h2>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <Money label="Service Amount" value={summary.service_amount} />

        <Money label="Deposit Required" value={summary.deposit_required} />

        <Money label="Amount Paid" value={summary.amount_paid} />

        <Money label="Refunded" value={summary.refunded_amount} />

        <Money label="Net Paid" value={netPaid} />

        <Money label="Balance Due" value={summary.balance_due} />

        <div>
          <div className="text-sm text-neutral-500">Payment Status</div>

          <div className="font-medium">
            {summary.payment_completion_status || "-"}
          </div>
        </div>
      </div>
    </section>
  );
}

function Money({ label, value }) {
  return (
    <div>
      <div className="text-sm text-neutral-500">{label}</div>

      <div className="font-semibold">
        ₦{Number(value || 0).toLocaleString()}
      </div>
    </div>
  );
}
