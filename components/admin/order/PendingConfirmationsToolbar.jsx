"use client";

export default function PendingConfirmationsToolbar({
  status = "all",
  onStatusChange,
  sort = "newest",
  onSortChange,
}) {
  const reset = () => {
    onStatusChange?.("all");
    onSortChange?.("newest");
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-col gap-4 md:flex-row">
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>

          <select
            value={status}
            onChange={(e) => onStatusChange?.(e.target.value)}
            className="w-56 rounded-xl border px-4 py-2"
          >
            <option value="all">All Pending</option>
            <option value="awaiting_confirmation">
              Awaiting Payment Confirmation
            </option>
            <option value="paid">Awaiting Delivery Confirmation</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Sort</label>

          <select
            value={sort}
            onChange={(e) => onSortChange?.(e.target.value)}
            className="w-56 rounded-xl border px-4 py-2"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>
        </div>
      </div>

      <button
        onClick={reset}
        className="rounded-xl border px-4 py-2 hover:bg-neutral-100"
      >
        Reset
      </button>
    </div>
  );
}
