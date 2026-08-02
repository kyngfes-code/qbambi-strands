"use client";

import { CheckCircle2, XCircle } from "lucide-react";

export default function PricingStatusBadge({ active }) {
  if (active) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
      <XCircle className="h-3.5 w-3.5" />
      Inactive
    </span>
  );
}
