"use client";

import { Calendar, Clock3, CheckCircle2, UserCircle2 } from "lucide-react";

import EnrollmentStatusBadge from "../EnrollmentStatusBadge";

export default function EnrollmentStatusCard({ enrollment }) {
  if (!enrollment) return null;

  const formatDate = (value) =>
    value ? new Date(value).toLocaleString() : "—";

  return (
    <div className="rounded-3xl border bg-white p-8 shadow-sm">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Enrollment Status</h2>

        <p className="mt-1 text-sm text-neutral-500">
          Current enrollment progress.
        </p>
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between rounded-xl border p-4">
          <span className="font-medium">Current Status</span>

          <EnrollmentStatusBadge status={enrollment.status} />
        </div>

        <div className="flex items-center gap-3 rounded-xl border p-4">
          <Calendar className="h-5 w-5 text-[#b48a5a]" />

          <div>
            <p className="text-xs uppercase text-neutral-500">Submitted</p>

            <p className="font-medium">{formatDate(enrollment.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border p-4">
          <Clock3 className="h-5 w-5 text-[#b48a5a]" />

          <div>
            <p className="text-xs uppercase text-neutral-500">Last Updated</p>

            <p className="font-medium">{formatDate(enrollment.updated_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border p-4">
          <UserCircle2 className="h-5 w-5 text-[#b48a5a]" />

          <div>
            <p className="text-xs uppercase text-neutral-500">Student ID</p>

            <p className="font-mono text-sm">{enrollment.id}</p>
          </div>
        </div>

        {enrollment.approved_at && (
          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
            <CheckCircle2 className="h-5 w-5 text-green-600" />

            <div>
              <p className="text-xs uppercase text-green-600">Approved On</p>

              <p className="font-medium">
                {formatDate(enrollment.approved_at)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
