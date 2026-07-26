"use client";

import FinancialSummary from "./FinancialSummary";
import PaymentProgress from "./PaymentProgress";
import DeliveryNotice from "./DeliveryNotice";
import StatusCard from "./StatusCard";
import OrderActions from "./OrderActions";
import PaymentSection from "./PaymentSection";

export default function OrderCard({
  order,
  expanded,
  onToggle,
  onReload,
  onOpenOrder,
  onRefund,
}) {
  const financial = order.financialSummary || {};

  const total = Number(financial.totalAmount || 0);
  const paid = Number(financial.totalPaid || 0);
  const refunded = Number(financial.refundedAmount || 0);
  const balanceDue = Number(financial.balanceDue || 0);
  const netPaid = Number(financial.netReceived || 0);

  const showPaymentSection =
    balanceDue > 0 &&
    (order.status === "pending" ||
      order.status === "rejected" ||
      (order.status === "payment_plan_active" &&
        order.payment_plan?.status === "active"));

  const itemCount =
    order.order_items?.reduce(
      (total, item) => total + Number(item.quantity || 1),
      0,
    ) || 0;

  return (
    <article className="rounded-3xl border bg-white shadow-sm hover:shadow-md transition overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between p-5 text-left hover:bg-neutral-50 transition"
      >
        <div>
          <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>

          <p className="mt-1 text-sm text-neutral-500">
            Placed {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex -space-x-3">
          {order.order_items.slice(0, 3).map((item) => (
            <img
              key={item.id}
              src={item.store.image}
              alt={item.store.title}
              className="h-14 w-14 rounded-xl border-2 border-white object-cover"
            />
          ))}

          {order.order_items.length > 3 && (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-white bg-neutral-100 text-sm font-semibold">
              +{order.order_items.length - 3}
            </div>
          )}
        </div>

        <p className="text-sm text-neutral-500">
          {itemCount} {itemCount === 1 ? "Item" : "Items"} • ₦
          {Number(financial.totalAmount).toLocaleString()}
        </p>

        <div className="flex items-center gap-4">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              order.status === "completed"
                ? "bg-green-100 text-green-700"
                : order.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-neutral-100 text-neutral-700"
            }`}
          >
            {order.status.replaceAll("_", " ")}
          </span>

          <svg
            className={`h-5 w-5 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>
      {expanded && (
        <div className="p-5 sm:p-6 lg:p-7 space-y-6">
          <FinancialSummary
            total={total}
            paid={paid}
            netPaid={netPaid}
            refunded={refunded}
            balanceDue={balanceDue}
          />

          <PaymentProgress total={total} paid={paid} />

          <DeliveryNotice />

          {order.status === "pending" && !order.payment_plan && (
            <div className="rounded-2xl border bg-neutral-50 p-5 text-center">
              <p className="font-medium">
                Flexible payment plans coming soon ✨
              </p>

              <p className="mt-1 text-sm text-neutral-500">
                We're working on making split payments available.
              </p>
            </div>
          )}

          {showPaymentSection && (
            <PaymentSection
              order={order}
              balanceDue={balanceDue}
              onReload={onReload}
            />
          )}

          <StatusCard order={order} />

          <OrderActions
            order={order}
            onViewDetails={onOpenOrder}
            onRequestRefund={onRefund}
          />
        </div>
      )}
    </article>
  );
}
