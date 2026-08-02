"use client";

import { CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function EmptyState({
  title = "No payments found",

  description = "There are no academy payment records matching your current filters.",

  actionLabel,

  onAction,
}) {
  return (
    <div className="rounded-xl border border-dashed bg-white">
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          <CreditCard className="h-8 w-8 text-neutral-500" />
        </div>

        <h3 className="mt-6 text-xl font-semibold">{title}</h3>

        <p className="mt-2 max-w-md text-sm text-neutral-500">{description}</p>

        {actionLabel && onAction && (
          <Button className="mt-6" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
