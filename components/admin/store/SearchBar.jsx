"use client";

import { Search, X } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search products...",
}) {
  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          h-11
          w-full
          rounded-xl
          border
          border-neutral-300
          bg-white
          pl-11
          pr-11
          text-sm
          outline-none
          transition
          focus:border-[#B33863]
          focus:ring-2
          focus:ring-[#B33863]/20
        "
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            rounded-full
            p-1
            text-neutral-400
            transition
            hover:bg-neutral-100
            hover:text-neutral-700
          "
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
