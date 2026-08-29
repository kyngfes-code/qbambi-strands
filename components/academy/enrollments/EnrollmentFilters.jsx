"use client";

import { Button } from "@/components/ui/button";

export default function EnrollmentFilters({
  filters,
  onChange,
  onReset,
  paymentPlans = [],
}) {
  function update(key, value) {
    onChange({
      ...filters,
      [key]: value,
    });
  }

  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-800">Status</label>

          <select
            value={filters.status}
            onChange={(e) => update("status", e.target.value)}
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none focus:border-neutral-400"
          >
            <option value="">All Status</option>

            <option value="pending">Pending</option>

            <option value="contacted">Contacted</option>

            <option value="confirmed">Confirmed</option>

            <option value="payment_verified">Payment Verified</option>

            <option value="enrolled">Enrolled</option>

            <option value="rejected">Rejected</option>

            <option value="completed">Completed</option>

            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Learning Mode */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-800">
            Learning Mode
          </label>

          <select
            value={filters.learningMode}
            onChange={(e) => update("learningMode", e.target.value)}
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none focus:border-neutral-400"
          >
            <option value="">All Modes</option>

            <option value="physical">Physical</option>

            <option value="online">Online</option>
          </select>
        </div>

        {/* Payment Plan */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-800">
            Payment Plan
          </label>

          <select
            value={filters.paymentPlan}
            onChange={(e) => update("paymentPlan", e.target.value)}
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none focus:border-neutral-400"
          >
            <option value="">All Plans</option>

            {paymentPlans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-800">
            Date From
          </label>

          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => update("dateFrom", e.target.value)}
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none focus:border-neutral-400"
          />
        </div>

        {/* Date To */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-800">
            Date To
          </label>

          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => update("dateTo", e.target.value)}
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none focus:border-neutral-400"
          />
        </div>
      </div>

      {/* Reset */}
      <div className="mt-5 flex justify-end">
        <Button type="button" variant="outline" onClick={onReset}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
