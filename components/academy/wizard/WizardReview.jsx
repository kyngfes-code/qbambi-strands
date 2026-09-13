"use client";

import { useFormContext } from "react-hook-form";
import { CheckCircle2, Edit3 } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function WizardReview({
  pricing,
  wizard,
  steps = [],
  isExistingStudent = false,
}) {
  const { getValues } = useFormContext();

  const values = getValues();

  // ==========================================================
  // PRICING
  // ==========================================================

  const selectedPaymentPlan = pricing?.selectedPaymentPlan ?? null;

  const paymentBreakdown = pricing?.paymentBreakdown ?? null;

  const selectedCourses = pricing?.selectedCourses ?? [];

  // ==========================================================
  // CURRENCY
  // ==========================================================

  const currencySymbols = {
    NGN: "₦",
    USD: "$",
    GBP: "£",
    EUR: "€",
  };

  const currency = pricing?.currency ?? "NGN";

  const symbol = currencySymbols[currency] ?? currency;

  // ==========================================================
  // FORMAT AMOUNT
  // ==========================================================

  function formatAmount(value) {
    return `${symbol}${Number(value ?? 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  // ==========================================================
  // GO TO STEP
  // ==========================================================

  function goToStep(stepId) {
    const stepIndex = steps.findIndex((step) => step.id === stepId);

    if (stepIndex === -1) {
      console.warn(`[ACADEMY REVIEW] Step "${stepId}" was not found.`);

      return;
    }

    console.log(`[ACADEMY REVIEW] Navigating to step: ${stepId}`, stepIndex);

    // Try the navigation methods supported by useWizard
    if (typeof wizard?.goTo === "function") {
      wizard.goTo(stepIndex);
      return;
    }

    if (typeof wizard?.setCurrentStep === "function") {
      wizard.setCurrentStep(stepIndex);
      return;
    }

    if (typeof wizard?.goToStep === "function") {
      wizard.goToStep(stepIndex);
      return;
    }

    console.error(
      "[ACADEMY REVIEW] No valid wizard navigation method found.",
      wizard,
    );
  }

  // ==========================================================
  // REVIEW SECTIONS
  // ==========================================================

  const sections = [];

  // ----------------------------------------------------------
  // PERSONAL + ADDRESS
  // ----------------------------------------------------------

  if (!isExistingStudent) {
    sections.push(
      {
        title: "Personal Information",

        stepId: "personal",

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

        stepId: "address",

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
            label: "Street Address",

            value: values.street_address,
          },

          {
            label: "Postal Code",

            value: values.postal_code,
          },
        ],
      },
    );
  }

  // ----------------------------------------------------------
  // TRAINING
  // ----------------------------------------------------------

  sections.push({
    title: "Training",

    stepId: "training",

    items: [
      {
        label: "Learning Mode",

        value: values.learning_mode,
      },

      {
        label: "Preferred Start Date",

        value: values.preferred_start_date,
      },
    ],
  });

  // ----------------------------------------------------------
  // PAYMENT
  // ----------------------------------------------------------

  sections.push({
    title: "Payment",

    stepId: "payment",

    items: [
      {
        label: "Payment Plan",

        value: selectedPaymentPlan?.name ?? values.payment_plan_id,
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
          ? `${Number(paymentBreakdown.extraPercentage ?? 0)}% (${formatAmount(
              paymentBreakdown.extraAmount,
            )})`
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

        value: paymentBreakdown ? formatAmount(paymentBreakdown.deposit) : "-",
      },

      {
        label: "Remaining Balance",

        value: paymentBreakdown
          ? formatAmount(paymentBreakdown.remaining)
          : "-",
      },
    ],
  });

  // ----------------------------------------------------------
  // EMERGENCY + ADDITIONAL
  // ----------------------------------------------------------

  if (!isExistingStudent) {
    sections.push(
      {
        title: "Emergency Contact",

        stepId: "emergency",

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

        stepId: "additional",

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
            label: "Referral Source",

            value: values.referral_source,
          },

          {
            label: "Notes",

            value: values.notes,
          },
        ],
      },
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <section className="space-y-8">
      {/* ================================================== */}
      {/* REVIEW HEADER */}
      {/* ================================================== */}

      <div className="rounded-3xl border border-green-200 bg-green-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-green-700">
              {isExistingStudent
                ? "Review Your Course Enrollment"
                : "Review Your Application"}
            </h3>

            <p className="mt-2 leading-7 text-neutral-700">
              {isExistingStudent
                ? "Your student information is already on file. Please review your course selection and payment details before submitting."
                : "Please carefully review all your information before submitting your enrollment."}
            </p>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* INFORMATION SECTIONS */}
      {/* ================================================== */}

      {sections.map((section) => (
        <div
          key={section.title}
          className="rounded-3xl border bg-white shadow-sm"
        >
          <div className="flex flex-col gap-4 border-b p-6 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-semibold text-neutral-900">
              {section.title}
            </h3>

            <Button
              type="button"
              variant="outline"
              onClick={() => goToStep(section.stepId)}
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>

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

      {/* ================================================== */}
      {/* SELECTED COURSES */}
      {/* ================================================== */}

      <div className="rounded-3xl border bg-[#C6A667]/10 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-neutral-900">
              Selected Courses
            </h3>

            <p className="mt-1 text-sm text-neutral-500">
              Courses included in this enrollment.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => goToStep("training")}
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
                      {Number(course.duration) !== 1 ? "s" : ""}
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

      {/* ================================================== */}
      {/* FINAL PAYMENT SUMMARY */}
      {/* ================================================== */}

      <div className="rounded-3xl border border-[#C6A667]/30 bg-white p-6 shadow-md">
        <div className="border-b pb-5">
          <h3 className="text-xl font-semibold text-neutral-900">
            Final Payment Summary
          </h3>

          <p className="mt-1 text-sm text-neutral-500">
            This is the amount that will be used for this enrollment.
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
            <div className="flex items-center justify-between gap-4">
              <span className="text-neutral-500">Payment Plan</span>

              <strong className="text-right text-neutral-900">
                {selectedPaymentPlan?.name ?? "-"}
              </strong>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-neutral-500">Course Fee</span>

              <strong>{formatAmount(paymentBreakdown.courseFee)}</strong>
            </div>

            <div className="flex items-center justify-between gap-4 border-t pt-5">
              <span className="text-lg font-semibold text-neutral-900">
                Total Payable
              </span>

              <span className="text-2xl font-bold text-[#b48a5a]">
                {formatAmount(paymentBreakdown.adjustedTotal)}
              </span>
            </div>

            <div className="rounded-2xl bg-green-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                Deposit Due Today
              </p>

              <p className="mt-2 text-3xl font-bold text-green-700">
                {formatAmount(paymentBreakdown.deposit)}
              </p>

              <p className="mt-1 text-sm text-green-600">
                This amount is required to secure your enrollment.
              </p>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-neutral-500">Remaining Balance</span>

              <strong>{formatAmount(paymentBreakdown.remaining)}</strong>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
