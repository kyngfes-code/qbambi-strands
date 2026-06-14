"use client";

export default function ErrorBanner({ message }) {
  if (!message) return null;

  return (
    <div
      className="
        bg-red-50
        border border-red-200
        rounded-2xl
        p-4
        text-red-700
      "
    >
      {message}
    </div>
  );
}
