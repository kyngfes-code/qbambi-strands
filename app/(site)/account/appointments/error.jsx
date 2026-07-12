"use client";

export default function Error({ error, reset }) {
  return (
    <div className="rounded-xl border bg-white p-8 text-center">
      <h2 className="text-2xl font-semibold">Unable to load appointments</h2>

      <p className="mt-3 text-neutral-500">{error.message}</p>

      <button
        onClick={reset}
        className="mt-5 rounded-lg bg-black px-5 py-2 text-white"
      >
        Retry
      </button>
    </div>
  );
}
