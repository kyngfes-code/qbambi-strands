"use client";

import { useState } from "react";

export default function ProcessPendingEmailsButton({
  pendingCount = 0,
  onProcessed,
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleProcessEmails() {
    if (loading) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/email-worker/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.error || "Unable to process pending emails.");
      }

      const sent = Number(data.sent || 0);
      const retried = Number(data.retried || 0);
      const failed = Number(data.failed || 0);
      const skipped = Number(data.skipped || 0);

      setMessage(
        `Processed ${data.processed || 0} email${
          data.processed === 1 ? "" : "s"
        }: ${sent} sent${retried ? `, ${retried} scheduled for retry` : ""}${
          failed ? `, ${failed} failed` : ""
        }${skipped ? `, ${skipped} skipped` : ""}.`,
      );

      if (typeof onProcessed === "function") {
        await onProcessed(data);
      }
    } catch (err) {
      console.error("Process pending emails error:", err);

      setError(err?.message || "Unable to process pending emails.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleProcessEmails}
        disabled={loading || pendingCount === 0}
        className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Processing Emails..."
          : pendingCount > 0
            ? `Process Pending Emails (${pendingCount})`
            : "No Pending Emails"}
      </button>

      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
