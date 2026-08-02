"use client";

import clsx from "clsx";

const STATUS_STYLES = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700 border border-amber-200",
  },

  approved: {
    label: "Approved",
    className: "bg-green-100 text-green-700 border border-green-200",
  },

  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 border border-red-200",
  },

  completed: {
    label: "Completed",
    className: "bg-blue-100 text-blue-700 border border-blue-200",
  },

  cancelled: {
    label: "Cancelled",
    className: "bg-neutral-200 text-neutral-700 border border-neutral-300",
  },
};

export default function EnrollmentStatusBadge({ status = "pending" }) {
  const config = STATUS_STYLES[status] ?? {
    label: status,
    className: "bg-neutral-100 text-neutral-700 border border-neutral-200",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}
