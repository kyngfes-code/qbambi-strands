export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 rounded-xl bg-neutral-200" />

      <div className="grid gap-5 md:grid-cols-4">
        <div className="h-28 rounded-xl bg-neutral-200" />
        <div className="h-28 rounded-xl bg-neutral-200" />
        <div className="h-28 rounded-xl bg-neutral-200" />
        <div className="h-28 rounded-xl bg-neutral-200" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="h-60 rounded-xl bg-neutral-200" />
        <div className="h-60 rounded-xl bg-neutral-200" />
        <div className="h-60 rounded-xl bg-neutral-200" />
      </div>
    </div>
  );
}
