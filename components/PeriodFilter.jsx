"use client";

export default function PeriodFilter({ value = "all", onChange }) {
  const periods = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
    { value: "all", label: "All Time" },
  ];

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-2 flex flex-wrap gap-2">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onChange?.(period.value)}
          className={`px-4 py-2 rounded-xl transition ${
            value === period.value
              ? "bg-black text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
