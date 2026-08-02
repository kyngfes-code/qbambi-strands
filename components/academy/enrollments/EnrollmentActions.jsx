"use client";

import Link from "next/link";

import { Eye, Pencil, CheckCircle2, XCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function EnrollmentActions({
  enrollment,

  onEdit,
  onApprove,
  onReject,
  onDelete,
}) {
  if (!enrollment) return null;

  const isPending = enrollment.status === "pending";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* View */}

      <Button asChild variant="outline" size="sm">
        <Link href={`/admin/academy/enrollments/${enrollment.id}`}>
          <Eye className="mr-2 h-4 w-4" />
          View
        </Link>
      </Button>

      {/* Edit */}

      <Button size="sm" variant="outline" onClick={() => onEdit?.(enrollment)}>
        <Pencil className="mr-2 h-4 w-4" />
        Edit
      </Button>

      {/* Approve */}

      {isPending && (
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700"
          onClick={() => onApprove?.(enrollment)}
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Approve
        </Button>
      )}

      {/* Reject */}

      {isPending && (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onReject?.(enrollment)}
        >
          <XCircle className="mr-2 h-4 w-4" />
          Reject
        </Button>
      )}

      {/* Delete */}

      <Button
        size="sm"
        variant="outline"
        className="text-red-600 hover:text-red-700"
        onClick={() => onDelete?.(enrollment)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>
    </div>
  );
}
