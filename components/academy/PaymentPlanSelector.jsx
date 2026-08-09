"use client";

import { CheckCircle2 } from "lucide-react";

export default function PaymentPlanSelector({ pricing, setValue }) {
  const {
    availablePaymentPlans = [],
    loadingPaymentPlans,
    selectedPaymentPlan,
    selectPaymentPlan,
    paymentBreakdown,
    currency,
  } = pricing;

  const currencySymbols = {
    NGN: "₦",
    USD: "$",
    GBP: "£",
    EUR: "€",
  };

  const symbol = currencySymbols[currency] ?? currency;

  // ------------------------------------------------------
  // Loading
  // ------------------------------------------------------

  if (loadingPaymentPlans) {
    return (
      <section className="space-y-6">
        {" "}
        <div>
          {" "}
          <h3 className="text-xl font-bold text-neutral-900">
            Choose Payment Plan{" "}
          </h3>
          <p className="mt-2 text-sm leading-7 text-neutral-500">
            Select how you would like to pay for your training.
          </p>
        </div>
        <div className="rounded-3xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
          Loading payment plans...
        </div>
      </section>
    );
  }

  // ------------------------------------------------------
  // No plans
  // ------------------------------------------------------

  if (!availablePaymentPlans.length) {
    return (
      <section className="space-y-6">
        {" "}
        <div>
          {" "}
          <h3 className="text-xl font-bold text-neutral-900">
            Choose Payment Plan{" "}
          </h3>
          <p className="mt-2 text-sm leading-7 text-neutral-500">
            No payment plans are currently available for the selected training.
          </p>
        </div>
      </section>
    );
  }

  // ------------------------------------------------------
  // Render
  // ------------------------------------------------------

  return (
    <section className="space-y-6">
      {/* ================================================= */}
      {/* Header */}
      {/* ================================================= */}

      <div>
        <h3 className="text-xl font-bold text-neutral-900">
          Choose Payment Plan
        </h3>

        <p className="mt-2 text-sm leading-7 text-neutral-500">
          Select how you would like to pay for your training.
        </p>
      </div>

      {/* ================================================= */}
      {/* Plans */}
      {/* ================================================= */}

      <div className="space-y-5">
        {availablePaymentPlans.map((plan) => {
          const selected = selectedPaymentPlan?.id === plan.id;

          const courseFee = Number(paymentBreakdown?.courseFee ?? 0);

          const extraPercentage = Number(plan.extra_percentage ?? 0);

          const initialPercentage = Number(
            plan.initial_payment_percentage ?? 0,
          );

          const numberOfPayments = Number(plan.number_of_payments ?? 1);

          const paymentIntervalMonths = Number(
            plan.payment_interval_months ?? 1,
          );

          const total = courseFee * (1 + extraPercentage / 100);

          const deposit = total * (initialPercentage / 100);

          const remaining = Math.max(total - deposit, 0);

          const installments = Math.max(numberOfPayments - 1, 0);

          const installmentAmount =
            installments > 0 ? remaining / installments : 0;

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => {
                selectPaymentPlan(plan);

                setValue("payment_plan_id", plan.id, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
              className={`group w-full rounded-3xl border p-7 text-left transition-all duration-200 sm:p-8 ${
                selected
                  ? "border-[#C6A667] bg-[#C6A667]/10 shadow-md ring-2 ring-[#C6A667]/30"
                  : "border-neutral-200 bg-white hover:border-[#C6A667]/60 hover:shadow-lg"
              }`}
            >
              {/* ================================================= */}
              {/* Plan Header */}
              {/* ================================================= */}

              <div className="flex items-start justify-between gap-5">
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-neutral-900 sm:text-2xl">
                    {plan.name}
                  </h3>

                  {plan.description && (
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-neutral-500">
                      {plan.description}
                    </p>
                  )}
                </div>

                {selected && (
                  <CheckCircle2 className="mt-1 h-7 w-7 shrink-0 text-[#C6A667]" />
                )}
              </div>

              {/* ================================================= */}
              {/* Financial Details */}
              {/* ================================================= */}

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {/* Total Tuition */}

                <div className="rounded-2xl bg-[#C6A667]/10 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Total Tuition
                  </p>

                  <h4 className="mt-2 text-xl font-bold text-[#b48a5a]">
                    {symbol}
                    {total.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h4>
                </div>

                {/* Initial Payment */}

                <div className="rounded-2xl bg-neutral-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Initial Payment
                  </p>

                  <h4 className="mt-2 text-lg font-bold text-neutral-900">
                    {initialPercentage}%
                  </h4>

                  <p className="mt-1 text-sm text-neutral-500">
                    {symbol}
                    {deposit.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                {/* Extra Charge */}

                <div className="rounded-2xl bg-neutral-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Administrative Charge
                  </p>

                  <h4 className="mt-2 text-lg font-bold text-neutral-900">
                    {extraPercentage}%
                  </h4>
                </div>

                {/* Remaining */}

                <div className="rounded-2xl bg-neutral-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Remaining Balance
                  </p>

                  {installments === 0 ? (
                    <h4 className="mt-2 text-lg font-bold text-neutral-900">
                      None
                    </h4>
                  ) : (
                    <>
                      <h4 className="mt-2 text-lg font-bold text-neutral-900">
                        {installments} payment
                        {installments > 1 ? "s" : ""}
                      </h4>

                      <p className="mt-1 text-sm text-neutral-500">
                        {symbol}
                        {installmentAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        every {paymentIntervalMonths} month
                        {paymentIntervalMonths > 1 ? "s" : ""}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* ================================================= */}
              {/* Selected State */}
              {/* ================================================= */}

              {selected && (
                <div className="mt-6 rounded-2xl border border-[#C6A667]/20 bg-white/70 px-5 py-4">
                  <p className="text-sm font-semibold text-[#9a753f]">
                    This payment plan is selected.
                  </p>

                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    Your deposit and remaining payment schedule have been
                    calculated using this plan.
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
