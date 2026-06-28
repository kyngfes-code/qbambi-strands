"use client";

export default function SearchInput({
  value = "",
  onChange,
  placeholder = "Search...",
  className = "",
  disabled = false,
}) {
  return (
    <div className={`relative w-full ${className}`}>
      {/* Search Icon */}
      <svg
        className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-4.35-4.35m1.35-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="
          w-full
          rounded-xl
          border
          bg-white
          py-2.5
          pl-10
          pr-10
          text-sm
          shadow-sm
          outline-none
          transition
          focus:border-black
          focus:ring-2
          focus:ring-black/10
          disabled:cursor-not-allowed
          disabled:bg-neutral-100
        "
      />

      {/* Clear Button */}
      {value && (
        <button
          type="button"
          onClick={() => onChange?.("")}
          className="
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-neutral-400
            hover:text-black
            transition
          "
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
