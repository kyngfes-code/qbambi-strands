"use client";

import { AlertTriangle, Trash2 } from "lucide-react";

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

import { Button } from "@/components/ui/button";

export default function DeleteCourseDialog({
  open,
  onOpenChange,
  course,
  onDelete,
  loading = false,
}) {
  if (!course) return null;

  async function handleDelete() {
    await onDelete(course);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>

          <AlertDialogTitle className="mt-4 text-center text-xl">
            Delete Course?
          </AlertDialogTitle>

          <AlertDialogDescription className="space-y-4 text-center">
            <p>You are about to permanently delete</p>

            <div className="rounded-xl border bg-neutral-50 p-4">
              <h3 className="font-semibold">{course.title}</h3>

              {course.category && (
                <p className="mt-1 text-sm text-neutral-500">
                  {course.category}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-left text-sm text-yellow-800">
              <p className="font-semibold">Before deleting:</p>

              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Any pricing attached to this course should be removed first.
                </li>

                <li>
                  Courses linked to existing student enrollments cannot be
                  deleted.
                </li>

                <li>This action cannot be undone.</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={loading}>
              Cancel
            </Button>
          </AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              disabled={loading}
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />

              {loading ? "Deleting..." : "Delete Course"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
