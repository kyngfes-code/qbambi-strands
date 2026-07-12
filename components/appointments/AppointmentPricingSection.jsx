"use client";

import { useMemo } from "react";

export default function AppointmentPricingSection({
  appointment,
  onEditPricing,
  loading = false,
}) {
  const serviceAmount = Number(appointment.service_amount || 0);
  const depositRequired = Number(appointment.deposit_required || 0);
  const amountPaid = Number(appointment.amount_paid || 0);
  const balanceDue = Number(appointment.balance_due || 0);

  const paymentProgress = useMemo(() => {
    if (serviceAmount <= 0) return 0;

    return Math.min((amountPaid / serviceAmount) * 100, 100);
  }, [amountPaid, serviceAmount]);

  return (
    <section className="rounded-2xl border bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            Appointment Pricing
          </h3>

          <p className="mt-1 text-sm text-neutral-500">
            Review or update the pricing for this appointment.
          </p>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => onEditPricing?.(appointment)}
          className="
            inline-flex
            items-center
            justify-center
            rounded-lg
            bg-black
            px-5
            py-2.5
            text-sm
            font-medium
            text-white
            transition
            hover:bg-neutral-800
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {loading ? "Updating..." : "Edit Pricing"}
        </button>
      </div>

      {/* Pricing */}
      <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <PricingCard
          label="Service Amount"
          value={serviceAmount}
          color="text-neutral-900"
        />

        <PricingCard
          label="Deposit Required"
          value={depositRequired}
          color="text-amber-700"
        />

        <PricingCard
          label="Amount Paid"
          value={amountPaid}
          color="text-emerald-700"
        />

        <PricingCard
          label="Balance Due"
          value={balanceDue}
          color={balanceDue > 0 ? "text-red-600" : "text-emerald-700"}
        />
      </div>

      {/* Progress */}
      <div className="border-t p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-600">
            Payment Progress
          </span>

          <span className="text-sm font-semibold">
            {paymentProgress.toFixed(0)}%
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{
              width: `${paymentProgress}%`,
            }}
          />
        </div>
      </div>

      {/* Status */}
      <div className="border-t bg-neutral-50 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <div>
            <p className="text-sm text-neutral-500">Payment Status</p>

            <p className="mt-1 font-semibold capitalize">
              {appointment.payment_completion_status || "Pending"}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-sm text-neutral-500">Appointment Status</p>

            <p className="mt-1 font-semibold capitalize">
              {appointment.status}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingCard({ label, value, color }) {
  return (
    <div className="rounded-xl border bg-neutral-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </p>

      <p className={`mt-2 text-2xl font-bold ${color}`}>
        ₦{Number(value).toLocaleString()}
      </p>
    </div>
  );
}
