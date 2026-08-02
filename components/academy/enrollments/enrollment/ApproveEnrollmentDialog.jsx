"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

export default function ApproveEnrollmentDialog({
  open,
  onOpenChange,

  enrollment,

  loading = false,

  onSubmit,
}) {
  const [status, setStatus] = useState("approved");

  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (open) {
      setStatus("approved");
      setAdminNotes("");
    }
  }, [open]);

  function handleSubmit(e) {
    e.preventDefault();

    onSubmit({
      status,
      admin_notes: adminNotes,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Update Enrollment</DialogTitle>

          <DialogDescription>
            Update the student's enrollment status.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border px-4 py-3"
            >
              <option value="approved">Approved</option>

              <option value="waitlisted">Waitlisted</option>

              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Admin Notes</label>

            <textarea
              rows={5}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full rounded-xl border px-4 py-3"
              placeholder="Internal remarks..."
            />
          </div>

          <div className="rounded-xl bg-neutral-100 p-4 text-sm">
            Student:
            <span className="ml-2 font-semibold">
              {enrollment?.first_name} {enrollment?.last_name}
            </span>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button disabled={loading} type="submit">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
