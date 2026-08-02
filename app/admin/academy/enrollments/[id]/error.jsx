"use client";

import { Button } from "@/components/ui/button";

export default function EnrollmentDetailsError({ error, reset }) {
  return (
    <div className="flex min-h-[500px] items-center justify-center">
      <div className="max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <span className="text-3xl">⚠️</span>
        </div>

        <h1 className="text-3xl font-bold">Unable to Load Enrollment</h1>

        <p className="mt-4 text-neutral-500">
          {error?.message ||
            "Something went wrong while loading this enrollment."}
        </p>

        <Button className="mt-8" onClick={reset}>
          Try Again
        </Button>
      </div>
    </div>
  );
}
