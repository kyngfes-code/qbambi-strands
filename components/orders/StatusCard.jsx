"use client";

const statusConfig = {
  paid: {
    icon: "✅",
    title: "Payment Received",
    color: "green",
  },
  delivered: {
    icon: "📦",
    title: "Order Delivered",
    color: "emerald",
  },
  rejected: {
    icon: "❌",
    title: "Payment Rejected",
    color: "red",
  },
  cancelled: {
    icon: "🚫",
    title: "Order Cancelled",
    color: "gray",
  },
};

const statusCardClasses = {
  green: "bg-green-50 border-green-200 text-green-700",
  emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
  red: "bg-red-50 border-red-200 text-red-700",
  gray: "bg-gray-100 border-gray-300 text-gray-700",
};

export default function StatusCard({ order }) {
  const config = statusConfig[order.status];

  if (!config) return null;

  return (
    <section
      className={`rounded-2xl border p-5 ${statusCardClasses[config.color]}`}
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl shrink-0">{config.icon}</div>

        <div className="flex-1 space-y-3">
          <h3 className="text-lg font-semibold">{config.title}</h3>

          {/* PAID */}
          {order.status === "paid" && (
            <>
              <p>Payment has been received successfully.</p>

              <p className="text-sm">
                Our team will contact you shortly regarding pickup or delivery
                arrangements.
              </p>

              <div className="rounded-xl bg-white/70 p-3">
                <p className="font-medium">Customer Support</p>

                <p className="mt-1 text-sm">07036308292</p>
              </div>
            </>
          )}

          {/* DELIVERED */}
          {order.status === "delivered" && (
            <>
              <p>Your order has been delivered successfully.</p>

              <p className="text-sm">
                Thank you for shopping with us. We hope you enjoy your purchase.
              </p>
            </>
          )}

          {/* REJECTED */}
          {order.status === "rejected" && (
            <>
              <p>Your payment could not be confirmed.</p>

              {order.rejection?.rejection_reason && (
                <div className="rounded-xl bg-white/70 p-3">
                  <p className="font-medium">Reason</p>

                  <p className="mt-1 text-sm">
                    {order.rejection.rejection_reason.replaceAll("_", " ")}
                  </p>
                </div>
              )}

              {order.rejection?.customer_message && (
                <div className="rounded-xl bg-white/70 p-3">
                  <p className="font-medium">Additional Information</p>

                  <p className="mt-1 text-sm">
                    {order.rejection.customer_message}
                  </p>
                </div>
              )}

              {order.rejection?.created_at && (
                <p className="text-xs opacity-80">
                  Rejected on{" "}
                  {new Date(order.rejection.created_at).toLocaleString()}
                </p>
              )}
            </>
          )}

          {/* CANCELLED */}
          {order.status === "cancelled" && (
            <>
              <p>Unfortunately this order has been cancelled.</p>

              {order.cancellation?.cancellation_reason && (
                <div className="rounded-xl bg-white/70 p-3">
                  <p className="font-medium">Reason</p>

                  <p className="mt-1 text-sm">
                    {order.cancellation.cancellation_reason}
                  </p>
                </div>
              )}

              {order.cancellation?.customer_message && (
                <div className="rounded-xl bg-white/70 p-3">
                  <p className="font-medium">Additional Information</p>

                  <p className="mt-1 text-sm">
                    {order.cancellation.customer_message}
                  </p>
                </div>
              )}

              {order.cancellation?.created_at && (
                <p className="text-xs opacity-80">
                  Cancelled on{" "}
                  {new Date(order.cancellation.created_at).toLocaleString()}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
