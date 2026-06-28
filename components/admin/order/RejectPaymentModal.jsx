"use client";

export default function RejectPaymentModal({
  isOpen,
  rejectReason,
  setRejectReason,
  rejectMessage,
  setRejectMessage,
  adminNote,
  setAdminNote,
  onClose,
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-6">Reject Payment</h2>

        <div className="space-y-5">
          {/* Rejection Reason */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Rejection Reason
            </label>

            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border rounded-lg p-3"
            >
              <option value="">Select reason</option>

              <option value="amount_mismatch">
                Amount paid differs from order total
              </option>

              <option value="payment_not_received">Payment not received</option>

              <option value="invalid_receipt">Invalid receipt uploaded</option>

              <option value="bank_reversal">Bank reversed transaction</option>
            </select>
          </div>

          {/* Customer Message */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Customer Message
            </label>

            <textarea
              rows={4}
              value={rejectMessage}
              onChange={(e) => setRejectMessage(e.target.value)}
              placeholder="Explain why the payment is being rejected..."
              className="w-full border rounded-lg p-3 resize-none"
            />
          </div>

          {/* Internal Note */}
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

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 border rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
