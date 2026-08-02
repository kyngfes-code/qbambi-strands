"use client";

import { Button } from "@/components/ui/button";

export default function EnrollmentPagination({
  page = 1,
  totalPages = 1,
  totalRecords = 0,
  pageSize = 20,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;

  const end = Math.min(page * pageSize, totalRecords);

  return (
    <div className="flex flex-col gap-4 border-t pt-6 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-neutral-500">
        Showing <strong>{start}</strong> – <strong>{end}</strong> of{" "}
        <strong>{totalRecords}</strong> enrollments
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>

        <span className="px-3 text-sm font-medium">
          Page {page} of {totalPages}
        </span>

        <Button
          variant="outline"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
