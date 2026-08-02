"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Error({ error, reset }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-lg rounded-2xl border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-neutral-900">
          Unable to Load Payments
        </h1>

        <p className="mb-6 text-sm text-neutral-500">
          Something went wrong while loading the academy payment records.
        </p>

        {process.env.NODE_ENV === "development" && error?.message && (
          <div className="mb-6 rounded-lg bg-neutral-100 p-3 text-left text-xs text-red-600">
            {error.message}
          </div>
        )}

        <Button onClick={reset} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
