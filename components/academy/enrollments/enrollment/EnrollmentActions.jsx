"use client";

import { Button } from "@/components/ui/button";

import { CheckCircle2, XCircle, Clock3 } from "lucide-react";

export default function EnrollmentActions({
  enrollment,
  loading = false,

  onApprove,
  onReject,
  onWaitlist,
}) {
  if (!enrollment) return null;

  const status = enrollment.status;

  return (
    <div className="rounded-3xl border bg-white p-8 shadow-sm">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Enrollment Actions</h2>

        <p className="mt-1 text-sm text-neutral-500">
          Manage this student's enrollment.
        </p>
      </div>

      <div className="space-y-4">
        <Button
          className="h-11 w-full"
          disabled={loading || status === "approved"}
          onClick={onApprove}
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Approve Enrollment
        </Button>

        <Button
          variant="secondary"
          className="h-11 w-full"
          disabled={loading || status === "waitlisted"}
          onClick={onWaitlist}
        >
          <Clock3 className="mr-2 h-4 w-4" />
          Move To Waitlist
        </Button>

        <Button
          variant="destructive"
          className="h-11 w-full"
          disabled={loading || status === "rejected"}
          onClick={onReject}
        >
          <XCircle className="mr-2 h-4 w-4" />
          Reject Enrollment
        </Button>
      </div>
    </div>
  );
}
