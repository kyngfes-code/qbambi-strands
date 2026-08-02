"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { AlertTriangle } from "lucide-react";

export default function DeletePricingDialog({
  open,
  onOpenChange,
  pricing,
  loading = false,
  onDelete,
}) {
  if (!pricing) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!loading) onOpenChange(value);
      }}
    >
      <DialogContent className="w-[95vw] max-w-md rounded-2xl">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 shadow-sm">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>

          <DialogTitle className="text-center text-xl">
            Delete Pricing
          </DialogTitle>

          <DialogDescription className="text-center leading-7">
            You are about to permanently delete this pricing record.
          </DialogDescription>
        </DialogHeader>

        {/* Pricing Summary */}

        <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Course</span>

              <span className="max-w-[180px] text-right font-semibold text-[#8b6b2f]">
                {pricing.course?.title}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-500">Learning Mode</span>

              <span className="rounded-full bg-[#C6A667]/15 px-3 py-1 text-xs font-semibold capitalize text-[#8b6b2f]">
                {pricing.learning_mode}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-500">Duration</span>

              <span>
                {pricing.duration_months} Month
                {pricing.duration_months > 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-500">Price</span>

              <span className="font-semibold text-[#b48a5a]">
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: pricing.currency || "NGN",
                }).format(Number(pricing.price))}
              </span>
            </div>
          </div>
        </div>

        {/* Warning */}

        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
          This action permanently removes this pricing configuration. Existing
          enrollments will remain unchanged, but this pricing option will no
          longer be available for future students.
        </div>

        <DialogFooter className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            className="w-full sm:w-auto"
            disabled={loading}
            onClick={onDelete}
          >
            {loading ? "Deleting..." : "Delete Pricing"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
