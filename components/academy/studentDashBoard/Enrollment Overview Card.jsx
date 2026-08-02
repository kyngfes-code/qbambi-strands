"use client";

import { GraduationCap, BookOpen, CalendarDays, UserCheck } from "lucide-react";

export default function EnrollmentOverviewCard({ enrollment }) {
  if (!enrollment) return null;

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-700",
    enrolled: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    completed: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-[#C6A667]">
            Enrollment
          </p>

          <h2 className="mt-2 text-2xl font-bold">{enrollment.course_name}</h2>
        </div>

        <GraduationCap className="h-10 w-10 text-[#C6A667]" />
      </div>

      <div className="mt-8 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-neutral-500" />
            <span className="text-neutral-500">Course</span>
          </div>

          <span className="font-medium">{enrollment.course_name}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-neutral-500" />
            <span className="text-neutral-500">Enrolled</span>
          </div>

          <span className="font-medium">
            {formatDate(enrollment.created_at)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCheck className="h-5 w-5 text-neutral-500" />
            <span className="text-neutral-500">Status</span>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
              statusColor[enrollment.status] ??
              "bg-neutral-100 text-neutral-700"
            }`}
          >
            {enrollment.status}
          </span>
        </div>

        {enrollment.intake_name && (
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Intake</span>

            <span className="font-medium">{enrollment.intake_name}</span>
          </div>
        )}

        {enrollment.class_name && (
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Class</span>

            <span className="font-medium">{enrollment.class_name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
