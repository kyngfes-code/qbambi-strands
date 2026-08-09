"use client";

import { CreditCard, Receipt, Wallet } from "lucide-react";

export default function PaymentHistoryCard({ payments = [], enrollment }) {
  if (!enrollment) return null;

  ////////////////////////////////////////////////////////////
  // Currency
  ////////////////////////////////////////////////////////////

  const currency =
    enrollment.currency ||
    enrollment.student_payment_plan?.payment_plan?.currency ||
    enrollment.payment_plan?.currency ||
    enrollment.courses?.find((course) => course?.pricing?.currency)?.pricing
      ?.currency ||
    "NGN";

  ////////////////////////////////////////////////////////////
  // Currency Formatter
  ////////////////////////////////////////////////////////////

  function formatCurrency(amount) {
    const numericAmount = Number(amount || 0);

    try {
      return new Intl.NumberFormat("en", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(numericAmount);
    } catch {
      return `${currency} ${numericAmount.toLocaleString("en")}`;
    }
  }

  ////////////////////////////////////////////////////////////
  // Total Tuition
  ////////////////////////////////////////////////////////////

  const totalFee = Number(
    enrollment.total_tuition ??
      enrollment.total_payable ??
      enrollment.total_course_fee ??
      0,
  );

  ////////////////////////////////////////////////////////////
  // Amount Paid
  ////////////////////////////////////////////////////////////

  const totalPaid = Number(enrollment.amount_paid ?? 0);

  ////////////////////////////////////////////////////////////
  // Balance
  ////////////////////////////////////////////////////////////

  const balance = Math.max(
    Number(enrollment.balance_due ?? totalFee - totalPaid),
    0,
  );

  ////////////////////////////////////////////////////////////
  // Payment Progress
  ////////////////////////////////////////////////////////////

  const progress =
    totalFee > 0 ? Math.min((totalPaid / totalFee) * 100, 100) : 0;

  ////////////////////////////////////////////////////////////

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">
            Payment History
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Academy payment records.
          </p>
        </div>

        <Receipt className="h-6 w-6 text-[#b48a5a]" />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-neutral-100 p-5">
          <p className="text-xs uppercase text-neutral-500">Tuition</p>

          <p className="mt-2 text-2xl font-bold">{formatCurrency(totalFee)}</p>
        </div>

        <div className="rounded-2xl bg-green-50 p-5">
          <p className="text-xs uppercase text-green-600">Paid</p>

          <p className="mt-2 text-2xl font-bold text-green-700">
            {formatCurrency(totalPaid)}
          </p>
        </div>

        <div className="rounded-2xl bg-red-50 p-5">
          <p className="text-xs uppercase text-red-600">Balance</p>

          <p className="mt-2 text-2xl font-bold text-red-700">
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      <div className="mt-8">
        {!payments.length ? (
          <div className="rounded-2xl border border-dashed py-12 text-center text-neutral-500">
            No payments have been recorded.
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-col gap-4 rounded-2xl border p-5 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-neutral-100 p-3">
                    <CreditCard className="h-5 w-5 text-[#b48a5a]" />
                  </div>

                  <div>
                    <h4 className="font-semibold">
                      {formatCurrency(payment.amount)}
                    </h4>

                    <p className="text-sm text-neutral-500">
                      {payment.payment_method || "Payment"}
                    </p>
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-sm font-medium capitalize">
                    {payment.status || "Completed"}
                  </p>

                  <p className="text-xs text-neutral-500">
                    {payment.created_at
                      ? new Date(payment.created_at).toLocaleString()
                      : "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 rounded-2xl bg-[#C6A667]/10 p-5">
        <div className="flex items-center gap-3">
          <Wallet className="h-5 w-5 text-[#b48a5a]" />

          <div>
            <p className="text-sm text-neutral-600">Payment Progress</p>

            <p className="mt-1 font-semibold">
              {totalFee > 0
                ? `${Math.round(progress)}% Complete`
                : "0% Complete"}
            </p>
          </div>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-[#b48a5a]"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
