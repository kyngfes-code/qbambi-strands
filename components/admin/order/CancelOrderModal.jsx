"use client";

export default function CancelOrderModal({
  open,
  reason,
  setReason,
  message,
  setMessage,
  adminNote,
  setAdminNote,
  onClose,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-6">Cancel Order</h2>

        <div className="space-y-5">
          {/* Cancellation Reason */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Cancellation Reason
            </label>

            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded-lg p-3"
            >
              <option value="">Select reason</option>

              <option value="out_of_stock">Product Out Of Stock</option>

              <option value="product_discontinued">Product Discontinued</option>

              <option value="delivery_unavailable">Delivery Unavailable</option>

              <option value="fraud_detected">Fraud Detected</option>

              <option value="duplicate_order">Duplicate Order</option>

              <option value="customer_requested">
                Customer Requested Cancellation
              </option>

              <option value="other">Other</option>
            </select>
          </div>

          {/* Customer Message */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Customer Message
            </label>

            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain why this order is being cancelled..."
              className="w-full border rounded-lg p-3 resize-none"
            />
          </div>

          {/* Admin Note */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Admin Note (Internal Only)
            </label>

            <textarea
              rows={3}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Internal note visible only to admins..."
              className="w-full border rounded-lg p-3 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 border rounded-lg hover:bg-gray-100"
            >
              Close
            </button>

            <button
              onClick={onConfirm}
              className="px-5 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800"
            >
              Confirm Cancellation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
