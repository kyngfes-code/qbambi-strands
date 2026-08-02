"use client";

import Link from "next/link";
import { CalendarDays, ArrowRight } from "lucide-react";

export default function NextPaymentCard({ payment }) {
  if (!payment) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-7 w-7 text-[#C6A667]" />

          <h2 className="text-xl font-bold">Next Payment</h2>
        </div>

        <div className="mt-8 rounded-2xl border border-dashed p-8 text-center text-neutral-500">
          No upcoming payment.
        </div>
      </div>
    );
  }

  const dueDate = new Date(payment.due_date);

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-7 w-7 text-[#C6A667]" />

          <h2 className="text-xl font-bold">Next Payment</h2>
        </div>

        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          {payment.status}
        </span>
      </div>

      <div className="mt-8 space-y-5">
        <div>
          <p className="text-sm text-neutral-500">Amount Due</p>

          <h3 className="mt-1 text-3xl font-bold">
            ₦{Number(payment.amount).toLocaleString()}
          </h3>
        </div>

        <div>
          <p className="text-sm text-neutral-500">Due Date</p>

          <p className="mt-1 font-medium">
            {dueDate.toLocaleDateString("en-NG", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <Link
          href="/academy/dashboard/payments"
          className="inline-flex items-center font-medium text-[#C6A667]"
        >
          View Payments
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
