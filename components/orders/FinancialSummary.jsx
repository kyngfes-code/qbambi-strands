"use client";

export default function FinancialSummary({
  total = 0,
  paid = 0,
  netPaid = 0,
  balanceDue = 0,
  refunded = 0,
}) {
  const summaryCards = [
    {
      label: "Total",
      value: total,
      color: "text-black",
    },
    {
      label: "Paid",
      value: paid,
      color: "text-green-600",
    },
    {
      label: "Net Paid",
      value: netPaid,
      color: "text-emerald-700",
    },
    {
      label: "Refunded",
      value: refunded,
      color: "text-red-600",
    },
    {
      label: "Outstanding",
      value: balanceDue,
      color: "text-orange-600",
    },
  ];

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">Financial Summary</h3>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border bg-neutral-50 p-4"
          >
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              {card.label}
            </p>

            <p className={`mt-2 text-xl font-bold ${card.color}`}>
              ₦{card.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
