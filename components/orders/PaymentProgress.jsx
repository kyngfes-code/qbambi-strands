"use client";

export default function PaymentProgress({ total = 0, paid = 0 }) {
  const progress = total > 0 ? Math.min((paid / total) * 100, 100) : 0;

  const progressColor =
    progress === 100
      ? "bg-green-600"
      : progress >= 50
        ? "bg-blue-600"
        : "bg-orange-500";

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Payment Progress</h3>

        <span className="text-sm font-semibold text-neutral-600">
          {progress.toFixed(0)}%
        </span>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-col gap-1 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
        <span>
          ₦{paid.toLocaleString()} of ₦{total.toLocaleString()} paid
        </span>

        {progress === 100 ? (
          <span className="font-medium text-green-600">Fully Paid</span>
        ) : (
          <span>₦{(total - paid).toLocaleString()} remaining</span>
        )}
      </div>
    </section>
  );
}
