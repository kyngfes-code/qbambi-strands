"use client";

import { Button } from "@/components/ui/button";

export default function Error({ error, reset }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-lg rounded-2xl border bg-white p-10 text-center shadow">
        <h2 className="text-2xl font-bold">Something went wrong</h2>

        <p className="mt-4 text-neutral-500">
          {error?.message ||
            "An unexpected error occurred while loading academy courses."}
        </p>

        <Button onClick={reset} className="mt-8">
          Try Again
        </Button>
      </div>
    </div>
  );
}
