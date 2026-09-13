"use client";

import Link from "next/link";
import { CreditCard, ArrowRight } from "lucide-react";

// ==========================================================
// HELPERS
// ==========================================================

function formatCurrency(value = 0) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function clampPercentage(value) {
  return Math.min(Math.max(Number(value) || 0, 0), 100);
}

// ==========================================================
// COMPONENT
// ==========================================================

export default function PaymentSummaryCard({ summary, loading = false }) {
  // ==========================================================
  // LOADING
  // ==========================================================

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

  // ==========================================================
  // NORMALIZE SUMMARY
  //
  // Supports both old and new field names.
  // ==========================================================

  const totalTuition = Number(
    summary?.totalTuition ?? summary?.total_tuition ?? 0,
  );

  const amountPaid = Number(
    summary?.amountPaid ??
      summary?.totalPaid ??
      summary?.amount_paid ??
      summary?.total_paid ??
      0,
  );

  const balanceDue = Number(
    summary?.balanceDue ??
      summary?.outstandingBalance ??
      summary?.balance_due ??
      summary?.outstanding_balance ??
      Math.max(totalTuition - amountPaid, 0),
  );

  // ==========================================================
  // PAYMENT PROGRESS
  //
  // Prefer the value supplied by the backend.
  // If unavailable, calculate it automatically.
  // ==========================================================

  const suppliedProgress =
    summary?.progressPercentage ??
    summary?.paymentProgress ??
    summary?.progress_percentage ??
    summary?.payment_progress;

  const calculatedProgress =
    totalTuition > 0 ? (amountPaid / totalTuition) * 100 : 0;

  const progressPercentage = clampPercentage(
    suppliedProgress ?? calculatedProgress,
  );

  // ==========================================================
  // OTHER DATA
  // ==========================================================

  const nextDueDate = summary?.nextDueDate ?? summary?.next_due_date ?? null;

  const nextDueAmount = Number(
    summary?.nextDueAmount ?? summary?.next_due_amount ?? 0,
  );

  // ==========================================================
  // STATUS
  // ==========================================================

  let status = summary?.status ?? "active";

  // Automatically ensure status matches payment state.

  if (totalTuition > 0 && amountPaid >= totalTuition) {
    status = "fully_paid";
  }

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

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      {/* ======================================================
          HEADER
      ====================================================== */}

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

      {/* ======================================================
          OUTSTANDING BALANCE
      ====================================================== */}

      <div className="mt-6">
        <p className="text-sm text-neutral-500">Outstanding Balance</p>

        <h2 className="mt-1 text-3xl font-bold text-neutral-900">
          {formatCurrency(balanceDue)}
        </h2>
      </div>

      {/* ======================================================
          PAYMENT PROGRESS
      ====================================================== */}

      <div className="mt-8">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">Payment Progress</span>

          <span className="font-semibold text-neutral-900">
            {formatCurrency(amountPaid)} / {formatCurrency(totalTuition)}
          </span>
        </div>

        <div className="mt-3 h-3 overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full rounded-full bg-[#C6A667] transition-all duration-500"
            style={{
              width: `${progressPercentage}%`,
            }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-neutral-500">Amount paid</span>

          <span className="text-sm font-semibold text-[#C6A667]">
            {Math.round(progressPercentage)}%
          </span>
        </div>
      </div>

      {/* ======================================================
          NEXT PAYMENT
      ====================================================== */}

      <div className="mt-8 rounded-2xl bg-neutral-50 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Next Payment
            </p>

            <p className="mt-2 text-lg font-semibold text-neutral-900">
              {nextDueAmount > 0
                ? formatCurrency(nextDueAmount)
                : "No payment due"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Due Date
            </p>

            <p className="mt-2 font-medium text-neutral-900">
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

      {/* ======================================================
          VIEW PAYMENTS
      ====================================================== */}

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
