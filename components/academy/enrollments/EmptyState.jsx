"use client";

import { GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function EmptyState({
  title = "No enrollments found",
  description = "There are currently no academy enrollments matching your filters.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="rounded-3xl border bg-white py-20 text-center shadow-sm">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
        <GraduationCap className="h-10 w-10 text-neutral-500" />
      </div>

      <h2 className="mt-6 text-2xl font-semibold">{title}</h2>

      <p className="mx-auto mt-3 max-w-lg text-neutral-500">{description}</p>

      {actionLabel && (
        <Button className="mt-8" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
