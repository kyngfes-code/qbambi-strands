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

export default function RejectEnrollmentDialog({
  open,
  onOpenChange,
  enrollment,
  loading = false,
  onReject,
}) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNote, setAdminNote] = useState("");

  if (!enrollment) return null;

  //----------------------------------------------------------
  // Submit
  //----------------------------------------------------------

  function handleReject(e) {
    e.preventDefault();

    const reason = rejectionReason.trim();
    const note = adminNote.trim();

    if (!reason) {
      return;
    }

    onReject?.(reason, note || "");
  }

  //----------------------------------------------------------
  // Close
  //----------------------------------------------------------

  function handleOpenChange(value) {
    if (loading) {
      return;
    }

    if (!value) {
      setRejectionReason("");
      setAdminNote("");
    }

    onOpenChange?.(value);
  }

  //----------------------------------------------------------
  // Render
  //----------------------------------------------------------

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Reject Enrollment?</AlertDialogTitle>

          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                You are about to reject the enrollment application for{" "}
                <strong>
                  {enrollment.first_name} {enrollment.last_name}
                </strong>
                .
              </p>

              <p>
                The student will be notified by email using the rejection reason
                below.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Rejection Reason */}

        <div className="space-y-2">
          <label
            htmlFor="rejection-reason"
            className="text-sm font-medium text-neutral-900"
          >
            Rejection Reason <span className="text-red-600">*</span>
          </label>

          <textarea
            id="rejection-reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            disabled={loading}
            placeholder="Enter the reason for rejecting this enrollment..."
            rows={4}
            className="w-full resize-none rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-100"
          />

          {!rejectionReason.trim() && (
            <p className="text-xs text-neutral-500">
              This reason will be sent to the student by email.
            </p>
          )}
        </div>

        {/* Admin Note */}

        <div className="space-y-2">
          <label
            htmlFor="admin-note"
            className="text-sm font-medium text-neutral-900"
          >
            Internal Admin Note{" "}
            <span className="font-normal text-neutral-400">(optional)</span>
          </label>

          <textarea
            id="admin-note"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            disabled={loading}
            placeholder="Optional note for other academy administrators..."
            rows={3}
            className="w-full resize-none rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-100"
          />

          <p className="text-xs text-neutral-500">
            This note is internal and will not be sent to the student.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            disabled={loading || !rejectionReason.trim()}
            onClick={handleReject}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {loading ? "Rejecting..." : "Reject Enrollment"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
