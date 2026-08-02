"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Error({ error, reset }) {
  console.error(error);

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-8">
      <Card className="w-full max-w-xl border-0 shadow-lg">
        <CardContent className="flex flex-col items-center p-10 text-center">
          <div className="mb-6 rounded-full bg-red-100 p-5">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold">Something went wrong</h1>

          <p className="mt-3 max-w-md text-neutral-500">
            We couldn't load the Academy dashboard. Please try again. If the
            problem continues, contact your administrator.
          </p>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-6 w-full rounded-lg bg-neutral-100 p-4 text-left">
              <p className="mb-2 text-xs font-semibold uppercase text-neutral-500">
                Development Error
              </p>

              <pre className="overflow-auto whitespace-pre-wrap break-words text-xs text-red-600">
                {error?.message}
              </pre>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button onClick={reset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
