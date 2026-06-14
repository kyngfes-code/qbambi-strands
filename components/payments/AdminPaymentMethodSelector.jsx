"use client";

const METHODS = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "pos", label: "POS" },
  { value: "other", label: "Other" },
];

export default function AdminPaymentMethodSelector({
  value,
  onChange,
  error,
  loading = false,
}) {
  return (
    <div>
      <label className="block font-medium mb-3">Payment Method</label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {METHODS.map((method) => (
          <label
            key={method.value}
            className="flex items-center gap-3 border rounded-xl p-3 cursor-pointer"
          >
            <input
              type="radio"
              value={method.value}
              checked={value === method.value}
              onChange={(e) => onChange(e.target.value)}
              disabled={loading}
            />

            <span>{method.label}</span>
          </label>
        ))}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
