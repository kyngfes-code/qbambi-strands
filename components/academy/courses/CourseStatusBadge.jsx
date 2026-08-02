"use client";

import { CheckCircle2, XCircle } from "lucide-react";

export default function CourseStatusBadge({ active = true, className = "" }) {
  if (active) {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ${className}`}
      >
        <CheckCircle2 className="h-4 w-4" />
        Active
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 ${className}`}
    >
      <XCircle className="h-4 w-4" />
      Inactive
    </span>
  );
}
