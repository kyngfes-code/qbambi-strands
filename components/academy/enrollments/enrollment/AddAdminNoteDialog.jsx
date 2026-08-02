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

export default function AddAdminNoteDialog({
  open,
  onOpenChange,

  enrollment,

  loading = false,

  onSubmit,
}) {
  //------------------------------------------------------
  // State
  //------------------------------------------------------

  const [note, setNote] = useState("");

  //------------------------------------------------------
  // Reset
  //------------------------------------------------------

  useEffect(() => {
    if (!open) return;

    setNote("");
  }, [open]);

  //------------------------------------------------------
  // Submit
  //------------------------------------------------------

  async function handleSubmit(e) {
    e.preventDefault();

    if (!note.trim()) return;

    await onSubmit({
      note: note.trim(),
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
          <DialogTitle>Add Admin Note</DialogTitle>

          <DialogDescription>
            Record an internal note for this enrollment. This note is only
            visible to administrators.
          </DialogDescription>
        </DialogHeader>

        {/* Student */}

        <div className="rounded-2xl border bg-neutral-50 p-5">
          <h3 className="font-semibold">
            {enrollment?.first_name} {enrollment?.last_name}
          </h3>

          <p className="mt-1 text-sm text-neutral-500">{enrollment?.email}</p>

          {enrollment?.status && (
            <div className="mt-4">
              <span className="inline-flex rounded-full bg-neutral-200 px-3 py-1 text-xs font-medium capitalize">
                {enrollment.status}
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="admin_note">
              Internal Note <span className="text-red-500">*</span>
            </Label>

            <textarea
              id="admin_note"
              rows={8}
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Example:
• Student requested to start next month.
• Waiting for payment confirmation.
• Verified submitted documents.
• Follow up after pricing assignment."
              className="w-full rounded-xl border px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#C6A667]"
            />

            <p className="text-xs text-neutral-500">
              This note will be saved to the enrollment history and will not be
              visible to the student.
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

            <Button type="submit" disabled={loading || !note.trim()}>
              {loading ? "Saving..." : "Save Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
