"use client";

import { useFormContext } from "react-hook-form";
import { CheckCircle2, Edit3 } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function WizardReview({ pricing, wizard }) {
  const { getValues } = useFormContext();

  const values = getValues();

  // ------------------------------------------------------
  // Pricing State
  // ------------------------------------------------------

  const selectedPaymentPlan = pricing?.selectedPaymentPlan ?? null;

  const paymentBreakdown = pricing?.paymentBreakdown ?? null;

  const selectedCourses = pricing?.selectedCourses ?? [];

  // ------------------------------------------------------
  // Currency
  // ------------------------------------------------------

  const currencySymbols = {
    NGN: "₦",
    USD: "$",
    GBP: "£",
    EUR: "€",
  };

  const currency = pricing?.currency ?? "NGN";

  const symbol = currencySymbols[currency] ?? currency;

  // ------------------------------------------------------
  // Helpers
  // ------------------------------------------------------

  function formatAmount(value) {
    return `${symbol}${Number(value ?? 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  // ------------------------------------------------------
  // Review Sections
  // ------------------------------------------------------

  const sections = [
    {
      title: "Personal Information",
      step: 0,
      items: [
        {
          label: "Full Name",
          value: [values.first_name, values.last_name, values.other_name]
            .filter(Boolean)
            .join(" "),
        },
        {
          label: "Gender",
          value: values.gender,
        },
        {
          label: "Date of Birth",
          value: values.date_of_birth,
        },
        {
          label: "Email",
          value: values.email,
        },
        {
          label: "Phone",
          value: values.phone,
        },
        {
          label: "WhatsApp",
          value: values.whatsapp,
        },
      ],
    },

    {
      title: "Address",
      step: 1,
      items: [
        {
          label: "Country",
          value: values.country,
        },
        {
          label: "State",
          value: values.state,
        },
        {
          label: "City",
          value: values.city,
        },
        {
          label: "Street",
          value: values.street_address,
        },
        {
          label: "Postal Code",
          value: values.postal_code,
        },
      ],
    },

    {
      title: "Training",
      step: 2,
      items: [
        {
          label: "Learning Mode",
          value: values.learning_mode,
        },
        {
          label: "Preferred Start",
          value: values.preferred_start_date,
        },
      ],
    },

    {
      title: "Payment",
      step: 3,
      items: [
        {
          label: "Payment Plan",
          value: selectedPaymentPlan?.name,
        },
        {
          label: "Course Fee",
          value: paymentBreakdown
            ? formatAmount(paymentBreakdown.courseFee)
            : "-",
        },
        {
          label: "Administrative Charge",
          value: paymentBreakdown
            ? `${Number(
                paymentBreakdown.extraPercentage ?? 0,
              )}% (${formatAmount(paymentBreakdown.extraAmount)})`
            : "-",
        },
        {
          label: "Total Payable",
          value: paymentBreakdown
            ? formatAmount(paymentBreakdown.adjustedTotal)
            : "-",
        },
        {
          label: "Deposit Due Today",
          value: paymentBreakdown
            ? formatAmount(paymentBreakdown.deposit)
            : "-",
        },
        {
          label: "Remaining Balance",
          value: paymentBreakdown
            ? formatAmount(paymentBreakdown.remaining)
            : "-",
        },
      ],
    },

    {
      title: "Emergency Contact",
      step: 4,
      items: [
        {
          label: "Name",
          value: values.emergency_contact_name,
        },
        {
          label: "Phone",
          value: values.emergency_contact_phone,
        },
        {
          label: "Relationship",
          value: values.emergency_contact_relationship,
        },
      ],
    },

    {
      title: "Additional Information",
      step: 5,
      items: [
        {
          label: "Occupation",
          value: values.occupation,
        },
        {
          label: "Education",
          value: values.education_level,
        },
        {
          label: "Referral",
          value: values.referral_source,
        },
        {
          label: "Notes",
          value: values.notes,
        },
      ],
    },
  ];

  // ------------------------------------------------------
  // Render
  // ------------------------------------------------------

  return (
    <section className="space-y-8">
      {/* ================================================= */}
      {/* Review Header */}
      {/* ================================================= */}

      <div className="rounded-3xl border border-green-200 bg-green-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-green-700">
              Review Your Application
            </h3>

            <p className="mt-2 leading-7 text-neutral-700">
              Please carefully review all the information below before
              submitting your enrollment. If you notice anything incorrect,
              click the <strong>Edit</strong> button beside the relevant
              section.
            </p>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* Information Sections */}
      {/* ================================================= */}

      {sections.map((section) => (
        <div
          key={section.title}
          className="rounded-3xl border bg-white shadow-sm"
        >
          {/* Section Header */}

          <div className="flex flex-col gap-4 border-b p-6 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-semibold text-neutral-900">
              {section.title}
            </h3>

            <Button
              type="button"
              variant="outline"
              onClick={() => wizard?.goTo(section.step)}
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>

          {/* Section Values */}

          <div className="grid gap-6 p-6 sm:grid-cols-2 xl:grid-cols-3">
            {section.items.map((item) => (
              <div key={item.label} className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  {item.label}
                </p>

                <p className="mt-2 break-words font-medium text-neutral-800">
                  {item.value || "-"}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* ================================================= */}
      {/* Selected Courses */}
      {/* ================================================= */}

      <div className="rounded-3xl border bg-[#C6A667]/10 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-neutral-900">
              Selected Courses
            </h3>

            <p className="mt-1 text-sm text-neutral-500">
              Courses included in your academy enrollment.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => wizard?.goTo(2)}
          >
            <Edit3 className="mr-2 h-4 w-4" />
            Edit Courses
          </Button>
        </div>

        <div className="mt-6 space-y-4">
          {selectedCourses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
              No courses selected.
            </div>
          ) : (
            selectedCourses.map((course) => {
              const courseData = pricing?.getCourse?.(course.courseId);

              return (
                <div
                  key={course.courseId}
                  className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="break-words font-semibold text-neutral-900">
                      {courseData?.title ?? course.title ?? "Selected Course"}
                    </p>

                    <p className="mt-1 text-sm text-neutral-500">
                      {course.duration} Month
                      {Number(course.duration) > 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="shrink-0 text-lg font-bold text-[#b48a5a]">
                    {formatAmount(course.price)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================================================= */}
      {/* Final Payment Summary */}
      {/* ================================================= */}

      <div className="rounded-3xl border border-[#C6A667]/30 bg-white p-6 shadow-md">
        <div className="border-b pb-5">
          <h3 className="text-xl font-semibold text-neutral-900">
            Final Payment Summary
          </h3>

          <p className="mt-1 text-sm text-neutral-500">
            This is the amount that will be used for your enrollment payment.
          </p>
        </div>

        {!paymentBreakdown ? (
          <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
            <p className="font-medium text-neutral-700">
              Payment information unavailable
            </p>

            <p className="mt-2 text-sm text-neutral-500">
              Please return to the Payment step and select a payment plan.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {/* Payment Plan */}

            <div className="flex items-center justify-between gap-4">
              <span className="text-neutral-500">Payment Plan</span>

              <strong className="text-right text-neutral-900">
                {selectedPaymentPlan?.name ?? "-"}
              </strong>
            </div>

            {/* Course Fee */}

            <div className="flex items-center justify-between gap-4">
              <span className="text-neutral-500">Course Fee</span>

              <strong>{formatAmount(paymentBreakdown.courseFee)}</strong>
            </div>

            {/* Administrative Charge */}

            <div className="flex items-center justify-between gap-4">
              <span className="text-neutral-500">Administrative Charge</span>

              <strong className="text-right">
                {Number(paymentBreakdown.extraPercentage ?? 0)}%{" "}
                <span className="text-neutral-500">
                  ({formatAmount(paymentBreakdown.extraAmount)})
                </span>
              </strong>
            </div>

            {/* Total Payable */}

            <div className="flex items-center justify-between gap-4 border-t pt-5">
              <span className="text-lg font-semibold text-neutral-900">
                Total Payable
              </span>

              <span className="text-2xl font-bold text-[#b48a5a]">
                {formatAmount(paymentBreakdown.adjustedTotal)}
              </span>
            </div>

            {/* Deposit */}

            <div className="rounded-2xl bg-green-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                Deposit Due Today
              </p>

              <p className="mt-2 text-3xl font-bold text-green-700">
                {formatAmount(paymentBreakdown.deposit)}
              </p>

              <p className="mt-1 text-sm text-green-600">
                This is the amount required to secure your enrollment.
              </p>
            </div>

            {/* Remaining */}

            <div className="flex items-center justify-between gap-4">
              <span className="text-neutral-500">Remaining Balance</span>

              <strong>{formatAmount(paymentBreakdown.remaining)}</strong>
            </div>

            {/* Future Payments */}

            {Number(paymentBreakdown.remainingPayments ?? 0) > 0 && (
              <div className="flex items-start justify-between gap-4">
                <span className="text-neutral-500">Future Payments</span>

                <div className="text-right">
                  <strong>
                    {paymentBreakdown.remainingPayments} Payment
                    {Number(paymentBreakdown.remainingPayments) > 1
                      ? "s"
                      : ""}{" "}
                    × {formatAmount(paymentBreakdown.installmentAmount)}
                  </strong>

                  <p className="mt-1 text-xs text-neutral-500">
                    Every {selectedPaymentPlan?.payment_interval_months ?? 1}{" "}
                    month
                    {(selectedPaymentPlan?.payment_interval_months ?? 1) > 1
                      ? "s"
                      : ""}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
