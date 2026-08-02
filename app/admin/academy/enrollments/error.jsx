"use client";

import { Button } from "@/components/ui/button";

export default function Error({ error, reset }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-lg rounded-2xl border bg-white p-10 text-center shadow-sm">
        <h2 className="text-2xl font-bold">Unable to load enrollments</h2>

        <p className="mt-3 text-neutral-500">
          {error?.message ||
            "Something went wrong while loading academy enrollments."}
        </p>

        <Button className="mt-8" onClick={reset}>
          Try Again
        </Button>
      </div>
    </div>
  );
}
