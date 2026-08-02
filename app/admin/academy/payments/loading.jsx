"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>

        <Skeleton className="h-10 w-44 rounded-lg" />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border bg-white p-5">
            <Skeleton className="mb-3 h-4 w-24" />
            <Skeleton className="h-8 w-28" />
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-4 lg:flex-row">
        <Skeleton className="h-11 flex-1 rounded-lg" />

        <Skeleton className="h-11 w-full lg:w-56" />

        <Skeleton className="h-11 w-full lg:w-56" />

        <Skeleton className="h-11 w-full lg:w-56" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="border-b px-6 py-4">
          <Skeleton className="h-6 w-48" />
        </div>

        <div className="divide-y">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 px-6 py-5">
              <Skeleton className="h-12 w-12 rounded-full" />

              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-52" />
                <Skeleton className="h-4 w-72" />
              </div>

              <Skeleton className="h-8 w-24 rounded-full" />

              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
