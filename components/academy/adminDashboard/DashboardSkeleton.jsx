"use client";

import { Card, CardContent } from "@/components/ui/card";

//////////////////////////////////////////////////////////////

function StatCardSkeleton() {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="flex items-center justify-between p-6">
        <div className="space-y-3">
          <div className="h-4 w-28 animate-pulse rounded bg-neutral-200" />

          <div className="h-8 w-24 animate-pulse rounded bg-neutral-100" />

          <div className="h-3 w-20 animate-pulse rounded bg-neutral-100" />
        </div>

        <div className="h-14 w-14 animate-pulse rounded-xl bg-neutral-100" />
      </CardContent>
    </Card>
  );
}

//////////////////////////////////////////////////////////////

function LargeCardSkeleton({ height = "h-[360px]" }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="mb-6 space-y-3">
          <div className="h-5 w-48 animate-pulse rounded bg-neutral-200" />

          <div className="h-4 w-36 animate-pulse rounded bg-neutral-100" />
        </div>

        <div className={`${height} animate-pulse rounded-xl bg-neutral-100`} />
      </CardContent>
    </Card>
  );
}

//////////////////////////////////////////////////////////////

function ListSkeleton({ rows = 5 }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="mb-6 space-y-3">
          <div className="h-5 w-52 animate-pulse rounded bg-neutral-200" />

          <div className="h-4 w-40 animate-pulse rounded bg-neutral-100" />
        </div>

        <div className="space-y-4">
          {Array.from({
            length: rows,
          }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-xl border p-4"
            >
              <div className="h-12 w-12 animate-pulse rounded-full bg-neutral-100" />

              <div className="flex-1 space-y-3">
                <div className="h-4 w-52 animate-pulse rounded bg-neutral-200" />

                <div className="h-3 w-40 animate-pulse rounded bg-neutral-100" />

                <div className="h-3 w-28 animate-pulse rounded bg-neutral-100" />
              </div>

              <div className="h-9 w-20 animate-pulse rounded bg-neutral-100" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

//////////////////////////////////////////////////////////////

export default function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="h-8 w-72 animate-pulse rounded bg-neutral-200" />

          <div className="h-4 w-64 animate-pulse rounded bg-neutral-100" />
        </div>

        <div className="h-10 w-36 animate-pulse rounded bg-neutral-100" />
      </div>

      {/* Stats */}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Quick Actions */}

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="mb-6 space-y-3">
            <div className="h-5 w-44 animate-pulse rounded bg-neutral-200" />

            <div className="h-4 w-52 animate-pulse rounded bg-neutral-100" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-xl bg-neutral-100"
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}

      <div className="grid gap-6 xl:grid-cols-2">
        <LargeCardSkeleton />
        <LargeCardSkeleton />
      </div>

      {/* Revenue */}

      <LargeCardSkeleton height="h-[300px]" />

      {/* Main Content */}

      <div className="grid gap-6 xl:grid-cols-2">
        <ListSkeleton rows={5} />
        <ListSkeleton rows={5} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ListSkeleton rows={5} />
        <ListSkeleton rows={5} />
      </div>

      <ListSkeleton rows={7} />

      <div className="grid gap-6 xl:grid-cols-2">
        <LargeCardSkeleton height="h-[320px]" />
        <ListSkeleton rows={5} />
      </div>
    </div>
  );
}
