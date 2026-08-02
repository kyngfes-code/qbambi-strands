"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function PaymentPagination({
  page = 1,

  totalPages = 1,

  totalItems = 0,

  pageSize = 20,

  onPageChange,
}) {
  //----------------------------------------------------------

  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;

  const end = Math.min(page * pageSize, totalItems);

  //----------------------------------------------------------

  function previousPage() {
    if (page <= 1) return;

    onPageChange?.(page - 1);
  }

  //----------------------------------------------------------

  function nextPage() {
    if (page >= totalPages) return;

    onPageChange?.(page + 1);
  }

  //----------------------------------------------------------

  function renderPages() {
    const pages = [];

    const maxVisible = 5;

    let startPage = Math.max(1, page - 2);

    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          size="icon"
          variant={i === page ? "default" : "outline"}
          onClick={() => onPageChange?.(i)}
        >
          {i}
        </Button>,
      );
    }

    return pages;
  }

  //----------------------------------------------------------

  if (totalPages <= 1 && totalItems <= pageSize) {
    return null;
  }

  //----------------------------------------------------------

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-white px-5 py-4 md:flex-row md:items-center md:justify-between">
      <div className="text-sm text-neutral-500">
        Showing <span className="font-medium text-neutral-900">{start}</span> to{" "}
        <span className="font-medium text-neutral-900">{end}</span> of{" "}
        <span className="font-medium text-neutral-900">{totalItems}</span>{" "}
        payments
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={previousPage}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {renderPages()}

        <Button
          variant="outline"
          size="icon"
          onClick={nextPage}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
