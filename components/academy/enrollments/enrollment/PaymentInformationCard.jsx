"use client";

import { CreditCard, Wallet, Banknote } from "lucide-react";

export default function PaymentInformationCard({ enrollment }) {
  if (!enrollment) return null;

  ////////////////////////////////////////////////////////////
  // Payment Plan
  ////////////////////////////////////////////////////////////

  const paymentPlan =
    typeof enrollment.payment_plan === "string"
      ? enrollment.payment_plan
      : enrollment.payment_plan?.name || "—";

  ////////////////////////////////////////////////////////////
  // Currency
  ////////////////////////////////////////////////////////////

  const currency =
    enrollment.currency ||
    enrollment.student_payment_plan?.payment_plan?.currency ||
    enrollment.payment_plan?.currency ||
    enrollment.courses?.find((course) => course?.pricing?.currency)?.pricing
      ?.currency ||
    "NGN";

  ////////////////////////////////////////////////////////////
  // Currency Formatter
  ////////////////////////////////////////////////////////////

  function formatCurrency(amount) {
    const numericAmount = Number(amount || 0);

    try {
      return new Intl.NumberFormat("en", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(numericAmount);
    } catch {
      return `${currency} ${numericAmount.toLocaleString("en")}`;
    }
  }

  ////////////////////////////////////////////////////////////
  // Course Fee
  ////////////////////////////////////////////////////////////

  const courseFee = Number(enrollment.total_course_fee || 0);

  ////////////////////////////////////////////////////////////
  // Admin Charge
  //
  // Example:
  // Course Fee = 100,000
  // Additional Fee = 10%
  // Admin Charge = 10,000
  ////////////////////////////////////////////////////////////

  const additionalFeePercentage = Number(
    enrollment.additional_fee_percentage || 0,
  );

  const adminCharge = courseFee * (additionalFeePercentage / 100);

  ////////////////////////////////////////////////////////////
  // Total Tuition
  ////////////////////////////////////////////////////////////

  const calculatedTotalTuition = courseFee + adminCharge;

  const totalTuition = Number(
    enrollment.total_tuition ??
      enrollment.total_payable ??
      calculatedTotalTuition,
  );

  ////////////////////////////////////////////////////////////
  // Item
  ////////////////////////////////////////////////////////////

  const Item = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3">
      <div className="rounded-xl bg-neutral-100 p-3">
        <Icon className="h-5 w-5 text-[#b48a5a]" />
      </div>

      <div className="flex-1">
        <p className="text-xs uppercase tracking-wide text-neutral-500">
          {label}
        </p>

        <p className="mt-1 font-medium text-neutral-900">{value || "—"}</p>
      </div>
    </div>
  );

  ////////////////////////////////////////////////////////////
  // Render
  ////////////////////////////////////////////////////////////

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900">
          Payment Information
        </h2>

        <p className="mt-1 text-sm text-neutral-500">
          Tuition and payment details.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Item icon={CreditCard} label="Payment Plan" value={paymentPlan} />

        <Item
          icon={Wallet}
          label="Enrollment Status"
          value={enrollment.status}
        />
      </div>

      <div className="mt-8 rounded-2xl bg-[#C6A667]/10 p-8">
        <div className="flex items-center gap-3">
          <Banknote className="h-6 w-6 text-[#b48a5a]" />

          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Tuition Breakdown
            </p>

            <h2 className="mt-2 text-4xl font-bold text-[#b48a5a]">
              {formatCurrency(totalTuition)}
            </h2>
          </div>
        </div>

        <div className="mt-6 space-y-4 rounded-xl bg-white/70 p-5">
          {/* Course Fee */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-neutral-600">Course Fee</span>

            <span className="font-semibold text-neutral-900">
              {formatCurrency(courseFee)}
            </span>
          </div>

          {/* Admin Charge */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-sm text-neutral-600">Admin Charges</span>

              {additionalFeePercentage > 0 && (
                <span className="ml-2 text-xs text-neutral-400">
                  ({additionalFeePercentage}%)
                </span>
              )}
            </div>

            <span className="font-semibold text-neutral-900">
              {formatCurrency(adminCharge)}
            </span>
          </div>

          <div className="border-t border-neutral-200 pt-4">
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-neutral-900">
                Total Tuition
              </span>

              <span className="text-xl font-bold text-[#b48a5a]">
                {formatCurrency(totalTuition)}
              </span>
            </div>
          </div>
        </div>

        {paymentPlan === "Installment Plan" && (
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
            Student selected installment payment during enrollment.
          </div>
        )}

        {paymentPlan === "Full Payment" && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            Student selected full payment during enrollment.
          </div>
        )}
      </div>
    </div>
  );
}
