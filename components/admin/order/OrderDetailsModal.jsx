"use client";

export default function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;

  const statusColor = {
    paid: "bg-green-600",
    rejected: "bg-red-600",
    delivered: "bg-blue-600",
    cancelled: "bg-gray-600",
    pending: "bg-yellow-600",
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-xl">Order #{order.id?.slice(0, 8)}</h2>

          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-700 font-medium"
          >
            Close
          </button>
        </div>

        {/* Customer */}
        <div className="space-y-2">
          <p>
            <strong>Customer:</strong> {order.customer?.name || "-"}
          </p>

          <p>
            <strong>Email:</strong> {order.customer?.email || "-"}
          </p>

          <p>
            <strong>Status:</strong>

            <span
              className={`ml-2 px-2 py-1 rounded text-white text-sm ${
                statusColor[order.status] || "bg-yellow-600"
              }`}
            >
              {order.status}
            </span>
          </p>

          {order.status === "delivered" && (
            <>
              <p>
                <strong>Delivered At:</strong>{" "}
                {order.delivered_at
                  ? new Date(order.delivered_at).toLocaleString()
                  : "-"}
              </p>

              <p>
                <strong>Delivered By:</strong>{" "}
                {order.delivered_admin?.name || "-"}
              </p>
            </>
          )}

          <p>
            <strong>Total:</strong> ₦
            {Number(order.total_amount || 0).toLocaleString()}
          </p>
        </div>

        {/* Order Items */}
        <div className="mt-8">
          <h3 className="font-semibold text-lg mb-4">Order Items</h3>

          <div className="space-y-4">
            {order.order_items?.length ? (
              order.order_items.map((item) => (
                <div key={item.id} className="border rounded-lg p-3 flex gap-4">
                  <img
                    src={item.store?.image}
                    alt={item.store?.title}
                    className="w-20 h-20 rounded object-cover"
                  />

                  <div className="flex-1">
                    <p className="font-semibold">{item.store?.title}</p>

                    <p>Quantity: {item.quantity}</p>

                    <p>₦{Number(item.price || 0).toLocaleString()}</p>

                    <p className="font-medium mt-1">
                      Line Total: ₦
                      {(
                        Number(item.price || 0) * Number(item.quantity || 0)
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-neutral-500">No order items found.</p>
            )}
          </div>
        </div>

        {/* Payment Rejections */}
        {order.payment_rejections?.length > 0 && (
          <div className="mt-8 p-4 border border-red-300 bg-red-50 rounded-xl">
            <h3 className="font-bold text-red-700 mb-4">
              Payment Rejection History
            </h3>

            <div className="space-y-4">
              {order.payment_rejections.map((rejection) => (
                <div
                  key={rejection.id}
                  className="border-b last:border-0 pb-3 last:pb-0"
                >
                  <p>
                    <strong>Reason:</strong> {rejection.rejection_reason}
                  </p>

                  <p>
                    <strong>Customer Message:</strong>{" "}
                    {rejection.customer_message}
                  </p>

                  <p>
                    <strong>Admin Note:</strong> {rejection.admin_note || "-"}
                  </p>

                  <p className="text-xs text-neutral-500 mt-2">
                    {new Date(rejection.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
