"use client";

const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "pos", label: "POS" },
  { value: "other", label: "Other" },
];

export default function AdditionalPaymentSection({
  amountReceivedToday,
  setAmountReceivedToday,
  paymentMethod,
  setPaymentMethod,
  outstandingCollected = 0,
  calculatedTip = 0,
  errors = {},
  loading = false,
}) {
  return (
    <div className="border rounded-2xl p-4 sm:p-5 space-y-5">
      <div>
        <label className="block font-medium mb-2">Amount Received Today</label>

        <input
          type="number"
          min="0"
          step="0.01"
          value={amountReceivedToday}
          onChange={(e) => setAmountReceivedToday(e.target.value)}
          disabled={loading}
          placeholder="Enter amount received"
          className="
            w-full rounded-xl border
            px-4 py-3
            focus:outline-none
            focus:ring-2 focus:ring-green-500
          "
        />

        {errors.amountReceivedToday && (
          <p className="mt-2 text-sm text-red-600">
            {errors.amountReceivedToday}
          </p>
        )}
      </div>

      {Number(amountReceivedToday || 0) > 0 && (
        <div className="rounded-xl border bg-neutral-50 p-4 space-y-3">
          <h4 className="font-medium text-sm text-neutral-700">
            Payment Breakdown
          </h4>

          <div className="flex justify-between text-sm">
            <span>Outstanding Payment</span>

            <span className="font-semibold text-green-700">
              ₦{outstandingCollected.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Tip</span>

            <span className="font-semibold text-purple-700">
              ₦{calculatedTip.toLocaleString()}
            </span>
          </div>

          <div className="border-t pt-3 flex justify-between font-semibold">
            <span>Total Received</span>

            <span>₦{Number(amountReceivedToday || 0).toLocaleString()}</span>
          </div>

          {calculatedTip > 0 && (
            <p className="text-xs text-neutral-500">
              Any amount above the outstanding balance will automatically be
              recorded as a tip.
            </p>
          )}
        </div>
      )}

      {Number(amountReceivedToday || 0) > 0 && (
        <div>
          <label className="block font-medium mb-3">Payment Method</label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method.value}
                className="
                  flex items-center gap-3
                  border rounded-xl
                  p-3 cursor-pointer
                "
              >
                <input
                  type="radio"
                  name="additionalPaymentMethod"
                  value={method.value}
                  checked={paymentMethod === method.value}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={loading}
                />

                <span>{method.label}</span>
              </label>
            ))}
          </div>

          {errors.paymentMethod && (
            <p className="mt-2 text-sm text-red-600">{errors.paymentMethod}</p>
          )}
        </div>
      )}
    </div>
  );
}
