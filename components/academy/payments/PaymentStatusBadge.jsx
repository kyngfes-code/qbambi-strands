"use client";

import { Badge } from "@/components/ui/badge";

const STATUS_STYLES = {
  completed: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  },

  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  },

  refunded: {
    label: "Refunded",
    className: "bg-red-100 text-red-700 hover:bg-red-100",
  },

  partially_refunded: {
    label: "Partially Refunded",
    className: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  },

  written_off: {
    label: "Written Off",
    className: "bg-slate-200 text-slate-700 hover:bg-slate-200",
  },

  failed: {
    label: "Failed",
    className: "bg-red-100 text-red-700 hover:bg-red-100",
  },
};

export default function PaymentStatusBadge({ status }) {
  const config = STATUS_STYLES[status] || {
    label: status || "Unknown",
    className: "bg-neutral-100 text-neutral-700 hover:bg-neutral-100",
  };

  return <Badge className={config.className}>{config.label}</Badge>;
}
