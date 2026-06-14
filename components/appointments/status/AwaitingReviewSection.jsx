"use client";

export default function AwaitingReviewSection() {
  return (
    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
      <p className="font-medium text-yellow-700">Awaiting Review</p>

      <p className="text-sm text-yellow-600 mt-1">
        Our team is reviewing your request and will provide pricing shortly.
      </p>
    </div>
  );
}
