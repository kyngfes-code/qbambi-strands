export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-64 rounded-xl bg-neutral-200" />

      <div className="h-20 rounded-2xl bg-neutral-200" />

      <div className="rounded-2xl border bg-white">
        <div className="h-14 border-b bg-neutral-100" />

        <div className="space-y-4 p-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-neutral-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
