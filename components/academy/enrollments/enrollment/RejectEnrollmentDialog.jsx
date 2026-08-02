"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function RejectEnrollmentDialog({
  open,
  onOpenChange,

  enrollment,

  loading = false,

  onSubmit,
}) {
  const [reason, setReason] = useState("");

  //------------------------------------------------------
  // Reset
  //------------------------------------------------------

  useEffect(() => {
    if (open) {
      setReason("");
    }
  }, [open]);

  //------------------------------------------------------
  // Submit
  //------------------------------------------------------

  async function handleSubmit(e) {
    e.preventDefault();

    await onSubmit({
      status: "rejected",

      rejection_reason: reason,

      admin_notes: reason,
    });
  }

  //------------------------------------------------------

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!loading) {
          onOpenChange(value);
        }
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Reject Enrollment</DialogTitle>

          <DialogDescription>
            This action will mark the enrollment as rejected. Please provide a
            reason for your records.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl border bg-neutral-50 p-5">
          <p className="text-sm text-neutral-500">Student</p>

          <p className="mt-1 font-semibold">
            {enrollment?.first_name} {enrollment?.last_name}
          </p>

          <p className="mt-1 text-sm text-neutral-500">{enrollment?.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="reason">Rejection Reason *</Label>

            <textarea
              id="reason"
              rows={6}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this enrollment is being rejected..."
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-[#C6A667]"
            />

            <p className="text-xs text-neutral-500">
              This note will be stored with the enrollment record for future
              reference.
            </p>
          </div>

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="destructive"
              disabled={loading || !reason.trim()}
            >
              {loading ? "Rejecting..." : "Reject Enrollment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
