"use client";

export default function Error({ error, reset }) {
  return (
    <div className="rounded-xl border bg-white p-8 text-center">
      <h2 className="text-xl font-semibold">Unable to load your account.</h2>

      <p className="mt-2 text-neutral-600">{error.message}</p>

      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-black px-5 py-2 text-white"
      >
        Try Again
      </button>
    </div>
  );
}
