"use client";

export default function OrderHeader({ order }) {
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-800",
    rejected: "bg-red-100 text-red-700",
    paid: "bg-green-100 text-green-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-gray-200 text-gray-700",
    payment_plan_active: "bg-blue-100 text-blue-700",
  };
  return (
    <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h2 className="text-lg sm:text-xl font-semibold">
          Order #{order.id.slice(0, 8).toUpperCase()}
        </h2>

        <p className="text-sm text-neutral-500">
          Placed:{" "}
          {new Date(order.created_at).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="self-start sm:self-auto">
        <span
          className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide ${
            statusStyles[order.status] ?? "bg-neutral-100 text-neutral-700"
          }`}
        >
          {order.status.replaceAll("_", " ")}
        </span>
      </div>
    </div>
  );
}
