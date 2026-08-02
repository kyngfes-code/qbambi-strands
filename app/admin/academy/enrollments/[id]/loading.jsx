export default function EnrollmentDetailsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="rounded-3xl border bg-white p-8">
        <div className="h-8 w-64 rounded bg-neutral-200" />

        <div className="mt-4 h-4 w-96 rounded bg-neutral-200" />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-40 rounded-xl bg-neutral-200" />
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="rounded-3xl border bg-white p-6">
              <div className="mb-6 h-6 w-56 rounded bg-neutral-200" />

              <div className="space-y-4">
                {Array.from({ length: 4 }).map((__, row) => (
                  <div key={row} className="h-5 rounded bg-neutral-100" />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-8">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="rounded-3xl border bg-white p-6">
              <div className="mb-6 h-6 w-40 rounded bg-neutral-200" />

              <div className="space-y-4">
                {Array.from({ length: 5 }).map((__, row) => (
                  <div key={row} className="h-5 rounded bg-neutral-100" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
