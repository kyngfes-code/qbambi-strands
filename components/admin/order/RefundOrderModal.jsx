"use client";

export default function RefundOrderModal({
  isOpen,
  refund,
  onClose,
  onConfirm,
}) {
  if (!isOpen || !refund.order) return null;

  const balance = Number(refund.order.financialSummary?.refundableBalance ?? 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-lg font-bold sm:text-xl">Issue Refund</h2>

            <p className="mt-1 text-sm text-neutral-500">
              Order #{refund.order.id.slice(0, 8)}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded px-3 py-1 text-red-600 hover:bg-red-50"
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain p-4 sm:p-6">
          {/* Financial Summary */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-neutral-500">Total Paid</p>
              <p className="text-lg font-bold sm:text-xl text-green-600">
                ₦
                {Number(
                  refund.order.financialSummary?.totalPaid ?? 0,
                ).toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-neutral-500">Already Refunded</p>
              <p className="text-lg font-bold sm:text-xl  text-red-600">
                ₦
                {Number(
                  refund.order.financialSummary?.totalRefunded ?? 0,
                ).toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg border bg-blue-50 p-4">
              <p className="text-sm text-neutral-500">Refundable Balance</p>
              <p className="text-lg font-bold sm:text-xl text-blue-700">
                ₦{balance.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Refund Amount */}
          <div>
            <label className="mb-2 block font-medium">Refund Amount</label>

            <input
              type="number"
              min="1"
              max={balance}
              value={refund.amount}
              onChange={(e) => refund.setAmount(e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-sm sm:text-base"
              placeholder="Enter amount"
            />

            <p className="mt-2 text-xs text-neutral-500">
              Maximum refundable amount: ₦{balance.toLocaleString()}
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="mb-2 block font-medium">Refund Reason</label>

            <select
              value={refund.reason}
              onChange={(e) => refund.setReason(e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-sm sm:text-base"
            >
              <option value="">Select reason</option>

              <option value="customer_request">Customer Request</option>

              <option value="damaged_product">Damaged Product</option>

              <option value="wrong_item">Wrong Item Delivered</option>

              <option value="duplicate_payment">Duplicate Payment</option>

              <option value="out_of_stock">Out of Stock</option>

              <option value="other">Other</option>
            </select>
          </div>

          {/* Customer Message */}
          <div>
            <label className="mb-2 block font-medium">Customer Message</label>

            <textarea
              rows={3}
              value={refund.customerMessage}
              onChange={(e) => refund.setCustomerMessage(e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-sm sm:text-base"
              placeholder="Optional message sent to customer"
            />
          </div>

          {/* Admin Note */}
          <div>
            <label className="mb-2 block font-medium">
              Internal Admin Note
            </label>

            <textarea
              rows={4}
              value={refund.adminNote}
              onChange={(e) => refund.setAdminNote(e.target.value)}
              className="min-h-[110px] w-full rounded-lg border px-3 py-2.5 text-sm sm:text-base"
              placeholder="Visible only to admins"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t p-4 sm:flex-row sm:justify-end sm:p-6">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-neutral-300 px-5 py-2 hover:bg-neutral-100 sm:w-auto"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={refund.submitting}
            className={`w-full rounded-lg px-5 py-2 font-medium text-white sm:w-auto ${
              refund.submitting
                ? "bg-red-300 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {refund.submitting ? "Issuing Refund..." : "Issue Refund"}
          </button>
        </div>
      </div>
    </div>
  );
}
