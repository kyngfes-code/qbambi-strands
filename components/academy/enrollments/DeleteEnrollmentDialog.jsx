"use client";

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

export default function DeleteEnrollmentDialog({
  open,
  onOpenChange,
  enrollment,
  loading = false,
  onDelete,
}) {
  if (!enrollment) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Enrollment?</AlertDialogTitle>

          <AlertDialogDescription>
            This will permanently delete the enrollment for{" "}
            <strong>
              {enrollment.first_name} {enrollment.last_name}
            </strong>
            .
            <br />
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            disabled={loading}
            onClick={(e) => {
              e.preventDefault();
              onDelete?.();
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Deleting..." : "Delete Enrollment"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
