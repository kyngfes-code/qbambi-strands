"use client";

import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { CheckCircle2, CreditCard, Loader2 } from "lucide-react";

export default function PaymentInformation({
  selectedCourses = [],

  availablePaymentPlans = [],
  loadingPaymentPlans = false,

  selectedPaymentPlan,
  onSelectPaymentPlan,

  paymentBreakdown,
}) {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext();

  //------------------------------------------------------
  // Select Payment Plan
  //------------------------------------------------------

  function handleSelect(plan) {
    setValue("payment_plan_id", plan.id, {
      shouldValidate: true,
    });

    onSelectPaymentPlan(plan);
  }

  return (
    <section className="space-y-8">
      {/* Hidden RHF Field */}

      <input type="hidden" {...register("payment_plan_id")} />

      {/* ================================================= */}
      {/* Heading */}
      {/* ================================================= */}

      <div>
        <h2 className="text-2xl font-bold text-neutral-900">
          Payment Information
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-7 text-neutral-500">
          Select one of the available payment plans for your chosen courses.
          Your payment schedule updates automatically.
        </p>
      </div>

      {/* ================================================= */}
      {/* Payment Plans */}
      {/* ================================================= */}

      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C6A667]/10">
            <CreditCard className="h-5 w-5 text-[#C6A667]" />
          </div>

          <div>
            <h3 className="font-semibold">Available Payment Plans</h3>

            <p className="text-sm text-neutral-500">
              These plans are available for the courses you selected.
            </p>
          </div>
        </div>

        {/* Loading */}

        {loadingPaymentPlans && (
          <div className="flex items-center justify-center rounded-2xl border border-dashed p-10">
            <Loader2 className="mr-3 h-5 w-5 animate-spin text-[#C6A667]" />

            <span className="text-sm text-neutral-500">
              Loading available payment plans...
            </span>
          </div>
        )}

        {/* Empty */}

        {!loadingPaymentPlans && availablePaymentPlans.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
            <p className="font-medium text-neutral-700">
              No Payment Plans Available
            </p>

            <p className="mt-2 text-sm text-neutral-500">
              Select your courses first. Available payment plans will
              automatically appear here.
            </p>
          </div>
        )}

        {/* Cards */}

        {!loadingPaymentPlans && availablePaymentPlans.length > 0 && (
          <div className="grid gap-5 lg:grid-cols-2">
            {availablePaymentPlans.map((plan) => {
              const selected = selectedPaymentPlan?.id === plan.id;

              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => handleSelect(plan)}
                  className={`rounded-3xl border p-6 text-left transition-all duration-200

                    ${
                      selected
                        ? "border-[#C6A667] bg-[#C6A667]/10 shadow-md ring-2 ring-[#C6A667]/20"
                        : "hover:border-[#C6A667]/70 hover:shadow-sm"
                    }
                    `}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-semibold">{plan.name}</h4>

                      <p className="mt-1 text-sm text-neutral-500">
                        {plan.number_of_payments} Payment
                        {plan.number_of_payments > 1 ? "s" : ""}
                      </p>
                    </div>

                    {selected && (
                      <CheckCircle2 className="h-7 w-7 text-[#C6A667]" />
                    )}
                  </div>

                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Initial Deposit</span>

                      <strong>{plan.initial_payment_percentage}%</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-neutral-500">Interest</span>

                      <strong>{plan.additional_fee_percentage}%</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-neutral-500">Frequency</span>

                      <strong>
                        Every {plan.monthly_interval} month
                        {plan.monthly_interval > 1 ? "s" : ""}
                      </strong>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {errors.payment_plan_id && (
          <p className="mt-5 text-sm text-red-500">
            {errors.payment_plan_id.message}
          </p>
        )}
      </div>
      {/* ================================================= */}
      {/* Enrollment Summary */}
      {/* ================================================= */}

      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-neutral-900">
          Enrollment Summary
        </h3>

        <div className="mt-6 space-y-4">
          {selectedCourses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
              No courses selected yet.
            </div>
          ) : (
            selectedCourses.map((course) => (
              <div
                key={course.courseId}
                className="rounded-2xl border bg-neutral-50 p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="font-semibold text-neutral-900">
                      {course.title}
                    </h4>

                    <p className="mt-1 text-sm text-neutral-500">
                      Duration {course.duration} Month
                      {course.duration > 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="text-2xl font-bold text-[#C6A667]">
                    ₦{Number(course.price).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ============================================= */}
        {/* Payment Summary */}
        {/* ============================================= */}

        <div className="mt-8 rounded-3xl border bg-[#C6A667]/5 p-6">
          <h3 className="text-lg font-semibold">Payment Summary</h3>

          {!paymentBreakdown ? (
            <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center">
              <p className="font-medium">Select a payment plan</p>

              <p className="mt-2 text-sm text-neutral-500">
                Your payment schedule will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Course Fee</span>

                  <strong>
                    ₦{paymentBreakdown.courseFee.toLocaleString()}
                  </strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Selected Plan</span>

                  <strong>{selectedPaymentPlan?.name}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Interest</span>

                  <strong>{paymentBreakdown.additionalFee}%</strong>
                </div>

                <div className="flex items-center justify-between border-b pb-5">
                  <span className="font-medium">Total Payable</span>

                  <strong className="text-xl text-[#C6A667]">
                    ₦{paymentBreakdown.adjustedTotal.toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Deposit Card */}

              <div className="mt-8 rounded-3xl bg-green-50 p-6">
                <p className="text-sm uppercase tracking-wide text-green-700">
                  Deposit Due Today
                </p>

                <h2 className="mt-2 text-4xl font-bold text-green-700">
                  ₦{paymentBreakdown.deposit.toLocaleString()}
                </h2>

                <p className="mt-2 text-sm text-green-600">
                  This is the amount required to secure your enrollment.
                </p>
              </div>

              {/* Remaining */}

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Remaining Balance</span>

                  <strong>
                    ₦{paymentBreakdown.remaining.toLocaleString()}
                  </strong>
                </div>

                {paymentBreakdown.remainingPayments > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Future Payments</span>

                    <div className="text-right">
                      <strong>
                        {paymentBreakdown.remainingPayments} Payments × ₦
                        {paymentBreakdown.installmentAmount.toLocaleString()}
                      </strong>

                      <p className="text-xs text-neutral-500">
                        Every {selectedPaymentPlan.monthly_interval} month
                        {selectedPaymentPlan.monthly_interval > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
