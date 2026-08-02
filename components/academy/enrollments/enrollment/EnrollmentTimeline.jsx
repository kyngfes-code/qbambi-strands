"use client";

import {
  CheckCircle2,
  Clock3,
  CreditCard,
  GraduationCap,
  UserCheck,
  XCircle,
} from "lucide-react";

const iconMap = {
  submitted: Clock3,
  reviewed: UserCheck,
  approved: CheckCircle2,
  rejected: XCircle,
  payment: CreditCard,
  started: GraduationCap,
  completed: CheckCircle2,
};

export default function EnrollmentTimeline({ timeline = [] }) {
  return (
    <div className="rounded-3xl border bg-white p-8 shadow-sm">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Enrollment Timeline</h2>

        <p className="mt-1 text-sm text-neutral-500">
          Activity history for this enrollment.
        </p>
      </div>

      {timeline.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-neutral-500">
          No activity has been recorded yet.
        </div>
      ) : (
        <div className="relative ml-3">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-neutral-200" />

          <div className="space-y-8">
            {timeline.map((event) => {
              const Icon = iconMap[event.type] ?? Clock3;

              return (
                <div key={event.id} className="relative flex gap-5">
                  <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border bg-white">
                    <Icon className="h-5 w-5 text-[#b48a5a]" />
                  </div>

                  <div className="flex-1 pb-2">
                    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                      <h3 className="font-semibold">{event.title}</h3>

                      <span className="text-xs text-neutral-500">
                        {new Date(event.created_at).toLocaleString()}
                      </span>
                    </div>

                    {event.description && (
                      <p className="mt-2 text-sm leading-7 text-neutral-600">
                        {event.description}
                      </p>
                    )}

                    {event.created_by && (
                      <p className="mt-2 text-xs text-neutral-400">
                        By {event.created_by}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
