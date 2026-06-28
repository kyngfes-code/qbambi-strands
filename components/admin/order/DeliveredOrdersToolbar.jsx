"use client";

export default function DeliveredOrdersToolbar({
  sort = "newest",
  onSortChange,
}) {
  const clearFilters = () => {
    onSortChange?.("newest");
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <label className="block text-sm font-medium mb-2">
          Sort Delivered Orders
        </label>

        <select
          value={sort}
          onChange={(e) => onSortChange?.(e.target.value)}
          className="w-56 rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Amount</option>
          <option value="lowest">Lowest Amount</option>
        </select>
      </div>

      <button
        onClick={clearFilters}
        className="self-start rounded-xl border px-4 py-2 hover:bg-neutral-100 transition"
      >
        Reset Sort
      </button>
    </div>
  );
}
