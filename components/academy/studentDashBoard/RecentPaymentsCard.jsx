"use client";

import Link from "next/link";
import {
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

const STATUS = {
  approved: {
    icon: CheckCircle2,
    color: "text-green-600",
    badge: "bg-green-100 text-green-700",
  },

  pending: {
    icon: Clock3,
    color: "text-amber-600",
    badge: "bg-amber-100 text-amber-700",
  },

  rejected: {
    icon: XCircle,
    color: "text-red-600",
    badge: "bg-red-100 text-red-700",
  },
};

export default function RecentPaymentsCard({ payments = [] }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="h-7 w-7 text-[#C6A667]" />

          <h2 className="text-xl font-bold">Recent Payments</h2>
        </div>

        <Link
          href="/academy/dashboard/payments"
          className="text-sm font-medium text-[#C6A667]"
        >
          View All
        </Link>
      </div>

      {!payments.length ? (
        <div className="mt-8 rounded-2xl border border-dashed p-8 text-center text-neutral-500">
          No payment history yet.
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {payments.map((payment) => {
            const config = STATUS[payment.status] ?? STATUS.pending;

            const Icon = config.icon;

            return (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-2xl border p-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`rounded-full bg-neutral-100 p-3 ${config.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-semibold">
                      ₦{Number(payment.amount).toLocaleString()}
                    </p>

                    <p className="text-sm text-neutral-500">
                      {new Date(payment.payment_date).toLocaleDateString(
                        "en-NG",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${config.badge}`}
                >
                  {payment.status}
                </span>
              </div>
            );
          })}

          <div className="pt-2">
            <Link
              href="/academy/dashboard/payments"
              className="inline-flex items-center font-medium text-[#C6A667]"
            >
              Payment History
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
