"use client";

export default function RefundSection({
  refundAmount,
  setRefundAmount,
  refundReason,
  setRefundReason,
  errors = {},
  loading = false,
}) {
  return (
    <div className="border rounded-2xl p-4 sm:p-5 space-y-5">
      <div>
        <label className="block font-medium mb-2">Refund Amount</label>

        <input
          type="number"
          min="0"
          step="0.01"
          value={refundAmount}
          onChange={(e) => setRefundAmount(e.target.value)}
          disabled={loading}
          className="
            w-full rounded-xl border
            px-4 py-3
            focus:outline-none
            focus:ring-2 focus:ring-green-500
          "
        />

        {errors.refundAmount && (
          <p className="mt-2 text-sm text-red-600">{errors.refundAmount}</p>
        )}
      </div>

      <div>
        <label className="block font-medium mb-2">Refund Reason</label>

        <textarea
          rows={3}
          value={refundReason}
          onChange={(e) => setRefundReason(e.target.value)}
          disabled={loading}
          className="
            w-full rounded-xl border
            px-4 py-3
            resize-none
            focus:outline-none
            focus:ring-2 focus:ring-green-500
          "
        />

        {errors.refundReason && (
          <p className="mt-2 text-sm text-red-600">{errors.refundReason}</p>
        )}
      </div>
    </div>
  );
}
