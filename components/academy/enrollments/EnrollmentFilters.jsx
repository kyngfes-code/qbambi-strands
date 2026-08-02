"use client";

import { Button } from "@/components/ui/button";

export default function EnrollmentFilters({ filters, onChange, onReset }) {
  function update(key, value) {
    onChange({
      ...filters,
      [key]: value,
    });
  }

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {/* Status */}

        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>

          <select
            value={filters.status}
            onChange={(e) => update("status", e.target.value)}
            className="h-11 w-full rounded-xl border px-4"
          >
            <option value="">All Status</option>

            <option value="pending">Pending</option>

            <option value="approved">Approved</option>

            <option value="rejected">Rejected</option>

            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Learning Mode */}

        <div className="space-y-2">
          <label className="text-sm font-medium">Learning Mode</label>

          <select
            value={filters.learningMode}
            onChange={(e) => update("learningMode", e.target.value)}
            className="h-11 w-full rounded-xl border px-4"
          >
            <option value="">All Modes</option>

            <option value="physical">Physical</option>

            <option value="online">Online</option>
          </select>
        </div>

        {/* Payment */}

        <div className="space-y-2">
          <label className="text-sm font-medium">Payment Plan</label>

          <select
            value={filters.paymentPlan}
            onChange={(e) => update("paymentPlan", e.target.value)}
            className="h-11 w-full rounded-xl border px-4"
          >
            <option value="">All Plans</option>

            <option value="full">Full Payment</option>

            <option value="installments">Installments</option>
          </select>
        </div>

        {/* Date From */}

        <div className="space-y-2">
          <label className="text-sm font-medium">Date From</label>

          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => update("dateFrom", e.target.value)}
            className="h-11 w-full rounded-xl border px-4"
          />
        </div>

        {/* Date To */}

        <div className="space-y-2">
          <label className="text-sm font-medium">Date To</label>

          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => update("dateTo", e.target.value)}
            className="h-11 w-full rounded-xl border px-4"
          />
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <Button type="button" variant="outline" onClick={onReset}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
