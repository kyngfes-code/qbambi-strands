"use client";

import Link from "next/link";
import { CreditCard, ArrowRight } from "lucide-react";

function formatCurrency(value = 0) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export default function PaymentSummaryCard({ summary, loading = false }) {
  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-8 w-8 rounded bg-neutral-200" />

          <div className="mt-5 h-4 w-36 rounded bg-neutral-200" />

          <div className="mt-4 h-8 w-44 rounded bg-neutral-200" />

          <div className="mt-8 h-2 w-full rounded bg-neutral-200" />

          <div className="mt-6 h-4 w-48 rounded bg-neutral-200" />

          <div className="mt-8 h-10 w-full rounded-xl bg-neutral-200" />
        </div>
      </div>
    );
  }

  const {
    totalTuition = 0,
    amountPaid = 0,
    balanceDue = 0,
    progressPercentage = 0,
    nextDueDate,
    nextDueAmount = 0,
    status = "active",
  } = summary || {};

  const statusColor =
    status === "fully_paid"
      ? "text-green-600"
      : status === "overdue"
        ? "text-red-600"
        : "text-[#C6A667]";

  const statusLabel =
    status === "fully_paid"
      ? "Fully Paid"
      : status === "overdue"
        ? "Overdue"
        : "Active";

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <CreditCard className="h-8 w-8 text-[#C6A667]" />

          <p className="mt-5 text-sm text-neutral-500">Payment Summary</p>
        </div>

        <span
          className={`rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold ${statusColor}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="mt-6">
        <p className="text-sm text-neutral-500">Outstanding Balance</p>

        <h2 className="mt-1 text-3xl font-bold">
          {formatCurrency(balanceDue)}
        </h2>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">Paid</span>

          <span className="font-semibold">
            {formatCurrency(amountPaid)} / {formatCurrency(totalTuition)}
          </span>
        </div>

        <div className="mt-3 h-3 overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full rounded-full bg-[#C6A667] transition-all duration-500"
            style={{
              width: `${Math.min(progressPercentage, 100)}%`,
            }}
          />
        </div>

        <div className="mt-2 flex justify-end text-sm font-medium text-[#C6A667]">
          {progressPercentage}%
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-neutral-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Next Payment
            </p>

            <p className="mt-2 text-lg font-semibold">
              {nextDueAmount > 0
                ? formatCurrency(nextDueAmount)
                : "No payment due"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Due Date
            </p>

            <p className="mt-2 font-medium">
              {nextDueDate
                ? new Date(nextDueDate).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </div>
        </div>
      </div>

      <Link
        href="/academy/dashboard/payments"
        className="mt-8 flex items-center justify-center rounded-xl border border-[#C6A667] px-5 py-3 font-medium text-[#C6A667] transition hover:bg-[#C6A667] hover:text-white"
      >
        View Payments
        <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
    </div>
  );
}
