"use client";

import { CreditCard, Wallet, Banknote } from "lucide-react";

export default function PaymentInformationCard({ enrollment }) {
  if (!enrollment) return null;

  const paymentPlan =
    enrollment.payment_plan === "full"
      ? "Full Payment"
      : enrollment.payment_plan === "installments"
        ? "Installment Plan"
        : "—";

  const Item = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 rounded-xl border p-4">
      <div className="rounded-lg bg-neutral-100 p-2">
        <Icon className="h-4 w-4 text-[#b48a5a]" />
      </div>

      <div className="flex-1">
        <p className="text-xs uppercase tracking-wide text-neutral-500">
          {label}
        </p>

        <p className="mt-1 font-medium">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="rounded-3xl border bg-white p-8 shadow-sm">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Payment Information</h2>

        <p className="mt-1 text-sm text-neutral-500">
          Tuition and payment details.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
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
              Total Tuition
            </p>

            <h2 className="mt-2 text-4xl font-bold text-[#b48a5a]">
              ₦{Number(enrollment.total_course_fee || 0).toLocaleString()}
            </h2>
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
