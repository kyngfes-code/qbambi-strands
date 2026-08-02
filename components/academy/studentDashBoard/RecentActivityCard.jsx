"use client";

import {
  Activity,
  CheckCircle2,
  CreditCard,
  UserCheck,
  BookOpen,
  AlertCircle,
} from "lucide-react";

const EVENT_CONFIG = {
  student_activated: {
    icon: UserCheck,
    color: "text-green-600",
    bg: "bg-green-100",
  },

  payment_received: {
    icon: CreditCard,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },

  payment_approved: {
    icon: CreditCard,
    color: "text-green-600",
    bg: "bg-green-100",
  },

  payment_rejected: {
    icon: AlertCircle,
    color: "text-red-600",
    bg: "bg-red-100",
  },

  refund: {
    icon: CreditCard,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },

  partial_refund: {
    icon: CreditCard,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },

  enrollment_created: {
    icon: BookOpen,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },

  default: {
    icon: CheckCircle2,
    color: "text-[#C6A667]",
    bg: "bg-[#C6A667]/10",
  },
};

export default function RecentActivityCard({ timeline = [] }) {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm">
      <div className="flex items-center gap-3">
        <Activity className="h-7 w-7 text-[#C6A667]" />

        <h2 className="text-2xl font-bold">Recent Activity</h2>
      </div>

      {!timeline.length ? (
        <div className="mt-8 rounded-2xl border border-dashed p-10 text-center text-neutral-500">
          No recent activity yet.
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {timeline.map((item) => {
            const config =
              EVENT_CONFIG[item.event_type] ?? EVENT_CONFIG.default;

            const Icon = config.icon;

            return (
              <div key={item.id} className="flex gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${config.bg}`}
                >
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </div>

                <div className="flex-1">
                  <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
                    <h3 className="font-semibold">{item.title}</h3>

                    <span className="text-sm text-neutral-500">
                      {new Date(item.created_at).toLocaleString("en-NG", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>

                  {item.description && (
                    <p className="mt-2 text-sm text-neutral-600">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
