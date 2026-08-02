"use client";

import {
  Landmark,
  CreditCard,
  Wallet,
  Smartphone,
  Banknote,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

const METHODS = {
  cash: {
    label: "Cash",
    icon: Banknote,
    className: "bg-green-100 text-green-700 hover:bg-green-100",
  },

  bank_transfer: {
    label: "Bank Transfer",
    icon: Landmark,
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  },

  transfer: {
    label: "Transfer",
    icon: Landmark,
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  },

  card: {
    label: "Card",
    icon: CreditCard,
    className: "bg-violet-100 text-violet-700 hover:bg-violet-100",
  },

  pos: {
    label: "POS",
    icon: Wallet,
    className: "bg-cyan-100 text-cyan-700 hover:bg-cyan-100",
  },

  online: {
    label: "Online",
    icon: Smartphone,
    className: "bg-indigo-100 text-indigo-700 hover:bg-indigo-100",
  },
};

export default function PaymentMethodBadge({ method }) {
  const config = METHODS[method] || {
    label: method || "Unknown",
    icon: Wallet,
    className: "bg-neutral-100 text-neutral-700 hover:bg-neutral-100",
  };

  const Icon = config.icon;

  return (
    <Badge variant="secondary" className={`gap-1 ${config.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}
