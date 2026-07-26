export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-10">
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="h-[600px] rounded-3xl bg-neutral-200" />

        <div className="space-y-6">
          <div className="h-10 w-2/3 rounded bg-neutral-200" />
          <div className="h-6 w-32 rounded bg-neutral-200" />
          <div className="h-40 rounded bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}
