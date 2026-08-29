"use client";

import { useFormContext } from "react-hook-form";
import PaymentPlanSelector from "../PaymentPlanSelector";

export default function PaymentInformation({ courses = [], pricing }) {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext();

  console.log("========== PAYMENT INFORMATION ==========");
  console.log("pricing:", pricing);
  console.log("selectedCourses:", pricing?.selectedCourses);
  console.log("availablePaymentPlans:", pricing?.availablePaymentPlans);
  console.log("loadingPaymentPlans:", pricing?.loadingPaymentPlans);
  console.log("selectedPaymentPlan:", pricing?.selectedPaymentPlan);
  console.log("paymentBreakdown:", pricing?.paymentBreakdown);
  console.log("==========================================");
  //------------------------------------------------------
  // Payment state comes from pricing
  //------------------------------------------------------

  const selectedCourses = pricing?.selectedCourses ?? [];
  const selectedPaymentPlan = pricing?.selectedPaymentPlan ?? null;
  const paymentBreakdown = pricing?.paymentBreakdown ?? null;

  //------------------------------------------------------
  // Currency
  //------------------------------------------------------

  const currencySymbols = {
    NGN: "₦",
    USD: "$",
    GBP: "£",
    EUR: "€",
  };

  const currency = pricing?.currency ?? selectedCourses?.[0]?.currency ?? "NGN";

  const symbol = currencySymbols[currency] ?? currency;

  //------------------------------------------------------
  // Get the original course object
  //
  // TrainingInformation uses the original `courses`
  // array, where course.title exists.
  //------------------------------------------------------

  function getCourse(courseId) {
    return courses.find((course) => String(course.id) === String(courseId));
  }

  //------------------------------------------------------
  // Render
  //------------------------------------------------------

  return (
    <section className="space-y-8">
      {/* ================================================= */}
      {/* Hidden Payment Plan Field */}
      {/* ================================================= */}
      <input type="hidden" {...register("payment_plan_id")} />
      {/* ================================================= */}
      {/* Heading */}
      {/* ================================================= */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">
          Payment Information
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-7 text-neutral-500">
          Select a payment plan for your selected training. Your payment
          schedule will update automatically.
        </p>
      </div>

      {/* ================================================= */}
      {/* Payment Plan Selector */}
      {/* ================================================= */}
      <PaymentPlanSelector pricing={pricing} setValue={setValue} />
      {errors.payment_plan_id && (
        <p className="text-sm text-red-500">{errors.payment_plan_id.message}</p>
      )}
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
            selectedCourses.map((selectedCourse) => {
              /*
               * selectedCourse contains the selected course ID.
               *
               * Find the original course from `courses`,
               * just like TrainingInformation gets its title
               * from `visibleCourses`.
               */
              const course = getCourse(selectedCourse.courseId);

              return (
                <div
                  key={selectedCourse.courseId}
                  className="rounded-2xl border bg-neutral-50 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      {/* ================================================= */}
                      {/* REAL COURSE TITLE */}
                      {/* ================================================= */}

                      <h4 className="font-semibold text-neutral-900">
                        {course?.title ?? "Course"}
                      </h4>

                      <p className="mt-1 text-sm text-neutral-500">
                        Duration {selectedCourse.duration} Month
                        {selectedCourse.duration > 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="text-2xl font-bold text-[#C6A667]">
                      {symbol}
                      {Number(selectedCourse.price ?? 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ================================================= */}
        {/* Payment Summary */}
        {/* ================================================= */}

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
              {/* ================================================= */}
              {/* Payment Breakdown */}
              {/* ================================================= */}

              <div className="mt-6 space-y-4">
                {/* Course Fee */}

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Course Fee</span>

                  <strong>
                    {symbol}
                    {Number(paymentBreakdown.courseFee ?? 0).toLocaleString()}
                  </strong>
                </div>

                {/* Selected Plan */}

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Selected Plan</span>

                  <strong>{selectedPaymentPlan?.name ?? "—"}</strong>
                </div>

                {/* Administrative Charge */}

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">
                    Administrative Charge
                  </span>

                  <strong>
                    {Number(paymentBreakdown.extraPercentage ?? 0)}% ({symbol}
                    {Number(paymentBreakdown.extraAmount ?? 0).toLocaleString()}
                    )
                  </strong>
                </div>

                {/* Total */}

                <div className="flex items-center justify-between border-b pb-5">
                  <span className="font-medium">Total Payable</span>

                  <strong className="text-xl text-[#C6A667]">
                    {symbol}
                    {Number(
                      paymentBreakdown.adjustedTotal ?? 0,
                    ).toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* ================================================= */}
              {/* Deposit */}
              {/* ================================================= */}

              <div className="mt-8 rounded-3xl bg-green-50 p-6">
                <p className="text-sm uppercase tracking-wide text-green-700">
                  Deposit Due Today
                </p>

                <h2 className="mt-2 text-4xl font-bold text-green-700">
                  {symbol}
                  {Number(paymentBreakdown.deposit ?? 0).toLocaleString()}
                </h2>

                <p className="mt-2 text-sm text-green-600">
                  This is the amount required to secure your enrollment.
                </p>
              </div>

              {/* ================================================= */}
              {/* Remaining Balance */}
              {/* ================================================= */}

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Remaining Balance</span>

                  <strong>
                    {symbol}
                    {Number(paymentBreakdown.remaining ?? 0).toLocaleString()}
                  </strong>
                </div>

                {paymentBreakdown.remainingPayments > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Future Payments</span>

                    <div className="text-right">
                      <strong>
                        {paymentBreakdown.remainingPayments} Payments × {symbol}
                        {Number(
                          paymentBreakdown.installmentAmount ?? 0,
                        ).toLocaleString()}
                      </strong>

                      <p className="text-xs text-neutral-500">
                        Every{" "}
                        {selectedPaymentPlan?.payment_interval_months ?? 1}{" "}
                        month
                        {(selectedPaymentPlan?.payment_interval_months ?? 1) > 1
                          ? "s"
                          : ""}
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
