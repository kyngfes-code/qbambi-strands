"use client";

import Link from "next/link";

export default function OrderActions({
  order,
  onRequestRefund,
  hideViewDetails = false,
}) {
  const canRequestRefund =
    order.status === "paid" || order.status === "delivered";

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-neutral-900">
        Order Actions
      </h3>

      <div
        className={`grid gap-3 ${
          !hideViewDetails && canRequestRefund
            ? "sm:grid-cols-2"
            : "sm:grid-cols-1"
        }`}
      >
        {!hideViewDetails && (
          <Link
            href={`/account/orders/${order.id}`}
            className="
            inline-flex items-center justify-center
            rounded-xl
            border border-neutral-300
            bg-white
            px-5 py-3
            font-medium
            text-neutral-800
            transition
            hover:border-neutral-400
            hover:bg-neutral-50
          "
          >
            View Details
          </Link>
        )}

        {canRequestRefund && (
          <button
            type="button"
            onClick={() => onRequestRefund(order)}
            className="
              rounded-xl
              bg-red-600
              px-5 py-3
              font-medium
              text-white
              transition
              hover:bg-red-700
            "
          >
            Request Refund
          </button>
        )}
      </div>
    </section>
  );
}
