"use client";

import { Button } from "@/components/ui/button";

export default function Error({ error, reset }) {
  return (
    <div className="flex min-h-[450px] flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-bold">Unable to load pricing</h2>

      <p className="mt-3 max-w-lg text-neutral-500">
        {error?.message ||
          "Something went wrong while loading academy pricing."}
      </p>

      <Button className="mt-8" onClick={reset}>
        Try Again
      </Button>
    </div>
  );
}
