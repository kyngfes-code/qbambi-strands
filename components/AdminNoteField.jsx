"use client";

export default function AdminNoteField({
  value,
  onChange,
  loading = false,
  label = "Admin Note",
  placeholder = "Add notes about this appointment...",
  rows = 4,
  optional = true,
}) {
  return (
    <div>
      <label className="block font-medium mb-2">
        {label}

        {optional && (
          <span className="text-sm text-gray-500 ml-2">(Optional)</span>
        )}
      </label>

      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        placeholder={placeholder}
        className="
          w-full rounded-xl border
          px-4 py-3
          resize-none
          focus:outline-none
          focus:ring-2 focus:ring-green-500
          disabled:opacity-50
          disabled:bg-gray-50
        "
      />
    </div>
  );
}
