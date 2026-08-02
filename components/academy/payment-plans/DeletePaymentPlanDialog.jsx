"use client";

import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DeletePaymentPlanDialog({
  open,
  onOpenChange,
  plan,
  onConfirm,
}) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!plan) return;

    try {
      setLoading(true);
      await onConfirm?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        if (!loading) {
          onOpenChange(value);
        }
      }}
    >
      <AlertDialogContent
        className="
    w-[95vw]
    max-w-md
    max-h-[85dvh]
    rounded-2xl
    p-0
    overflow-hidden
    flex
    flex-col

    sm:max-w-xl
  "
      >
        {/* Header */}

        <AlertDialogHeader className="shrink-0 border-b bg-gradient-to-r from-red-600 via-red-500 to-rose-500 px-5 py-6 text-left text-white sm:px-6">
          <AlertDialogTitle className="text-xl font-semibold sm:text-2xl">
            Delete Payment Plan
          </AlertDialogTitle>

          <AlertDialogDescription className="mt-2 text-sm leading-6 text-red-50 sm:text-base">
            You are about to permanently remove this payment plan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Body */}

        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm leading-7 text-neutral-700 sm:text-base">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-red-700">
                {plan?.name ?? "this payment plan"}
              </span>
              ?
            </p>

            <div className="mt-5 space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-800">
                Before deleting:
              </p>

              <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-amber-900">
                <li>This action cannot be undone.</li>

                <li>
                  If this payment plan is currently assigned to one or more
                  academy courses, deletion will fail.
                </li>

                <li>
                  Remove all course assignments first or deactivate the payment
                  plan instead.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}

        <AlertDialogFooter
          className="
            shrink-0
            border-t
            bg-neutral-50
            px-5
            py-4

            flex-col-reverse
            gap-3

            sm:flex-row
            sm:justify-end
            sm:px-6
          "
        >
          <AlertDialogCancel disabled={loading} className="w-full sm:w-auto">
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="
              w-full
              bg-red-600
              hover:bg-red-700
              focus:ring-red-600

              sm:w-auto
            "
          >
            {loading ? "Deleting..." : "Delete Payment Plan"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
