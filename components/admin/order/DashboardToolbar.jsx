"use client";

import PeriodFilter from "@/components/PeriodFilter";

export default function DashboardToolbar({
  title = "Dashboard",
  description,
  period = "all",
  onPeriodChange,
  onRefresh,
  refreshing = false,
  actions,
}) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>

          {description && (
            <p className="mt-2 text-sm text-neutral-500">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {actions}

          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <polyline points="21 3 21 9 15 9" />
            </svg>

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <PeriodFilter value={period} onChange={onPeriodChange} />
    </div>
  );
}
