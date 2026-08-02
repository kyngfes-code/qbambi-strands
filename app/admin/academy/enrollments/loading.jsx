export default function LoadingAcademyEnrollments() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-64 rounded bg-neutral-200" />
        <div className="h-4 w-80 rounded bg-neutral-200" />
      </div>

      <div className="h-12 rounded-xl bg-neutral-200" />

      <div className="h-14 rounded-xl bg-neutral-200" />

      <div className="rounded-2xl border bg-white overflow-hidden">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="flex items-center gap-6 border-b p-5">
            <div className="h-5 w-48 rounded bg-neutral-200" />
            <div className="h-5 w-40 rounded bg-neutral-200" />
            <div className="h-5 w-28 rounded bg-neutral-200" />
            <div className="h-5 w-24 rounded bg-neutral-200" />
            <div className="ml-auto h-8 w-20 rounded bg-neutral-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
