"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function AdminEmailOutboxPage() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [statusFilter, setStatusFilter] = useState("pending");

  // ============================================================
  // LOAD EMAILS
  // ============================================================

  const loadEmails = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/email-outbox", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to load email outbox.");
      }

      setEmails(data?.emails || []);
    } catch (err) {
      console.error(err);

      setError(err?.message || "Unable to load email outbox.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmails();
  }, [loadEmails]);

  // ============================================================
  // PROCESS EMAILS
  // ============================================================

  const processEmails = async () => {
    try {
      setProcessing(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/admin/email-outbox/process", {
        method: "POST",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to process emails.");
      }

      setSuccess(
        `Email processing completed. ${data?.sent ?? 0} email(s) sent, ${
          data?.retried ?? 0
        } retried, ${data?.failed ?? 0} failed.`,
      );

      await loadEmails();
    } catch (err) {
      console.error(err);

      setError(err?.message || "Unable to process emails.");
    } finally {
      setProcessing(false);
    }
  };
  // ============================================================
  // FILTER
  // ============================================================

  const filteredEmails = useMemo(() => {
    if (statusFilter === "all") {
      return emails;
    }

    return emails.filter((email) => email.status === statusFilter);
  }, [emails, statusFilter]);

  // ============================================================
  // COUNTS
  // ============================================================

  const pendingCount = emails.filter(
    (email) => email.status === "pending",
  ).length;

  const processingCount = emails.filter(
    (email) => email.status === "processing",
  ).length;

  const sentCount = emails.filter((email) => email.status === "sent").length;

  const failedCount = emails.filter(
    (email) => email.status === "failed",
  ).length;

  // ============================================================
  // FORMATTERS
  // ============================================================

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatEmailType = (value) => {
    if (!value) return "—";

    return value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const statusClasses = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "processing":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "sent":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "failed":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-neutral-50 text-neutral-600 border-neutral-200";
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-neutral-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* ======================================================
            HEADER
        ====================================================== */}

        {/* ======================================================
    HEADER
====================================================== */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              Email Outbox
            </h1>

            <p className="mt-1 text-sm text-neutral-500">
              Review queued emails and manually process the email delivery
              queue.
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
            {/* Refresh */}
            <button
              type="button"
              onClick={loadEmails}
              disabled={loading || processing}
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            {/* Process Emails */}
            <button
              type="button"
              onClick={processEmails}
              disabled={processing || loading || pendingCount === 0}
              className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? "Processing Emails..." : "Process Emails"}
            </button>

            {/* Back to Academy */}
            <Link
              href="/admin/academy"
              className="ml-auto rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Back to Academy
            </Link>
          </div>
        </div>

        {/* ======================================================
            ALERTS
        ====================================================== */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {/* ======================================================
            STATS
        ====================================================== */}

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Pending"
            value={pendingCount}
            description="Waiting to be sent"
          />

          <StatCard
            label="Processing"
            value={processingCount}
            description="Currently being handled"
          />

          <StatCard
            label="Sent"
            value={sentCount}
            description="Successfully delivered to provider"
          />

          <StatCard
            label="Failed"
            value={failedCount}
            description="Requires attention"
          />
        </div>

        {/* ======================================================
            FILTERS
        ====================================================== */}

        <div className="mb-4 flex flex-wrap gap-2">
          {[
            ["pending", "Pending"],
            ["processing", "Processing"],
            ["sent", "Sent"],
            ["failed", "Failed"],
            ["all", "All"],
          ].map(([value, label]) => {
            const active = statusFilter === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={[
                  "rounded-full border px-4 py-2 text-sm font-medium transition",
                  active
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ======================================================
            TABLE
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-sm text-neutral-500">
              Loading email outbox...
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-medium text-neutral-700">
                No emails found.
              </p>

              <p className="mt-1 text-sm text-neutral-500">
                There are no emails matching the selected status.
              </p>
            </div>
          ) : (
            <>
              {/* ==================================================
                  DESKTOP TABLE
              ================================================== */}

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50 text-left">
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Email
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Type
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Attempts
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Created
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Next Attempt
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-neutral-100">
                    {filteredEmails.map((email) => (
                      <tr
                        key={email.id}
                        className="transition hover:bg-neutral-50"
                      >
                        <td className="px-5 py-4">
                          <div className="max-w-[360px]">
                            <p className="truncate text-sm font-medium text-neutral-900">
                              {email.to_email}
                            </p>

                            <p className="mt-1 truncate text-xs text-neutral-500">
                              {email.subject}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm text-neutral-700">
                            {formatEmailType(email.email_type)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={[
                              "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
                              statusClasses(email.status),
                            ].join(" ")}
                          >
                            {email.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm text-neutral-700">
                            {email.attempts ?? 0}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm text-neutral-600">
                            {formatDate(email.created_at)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm text-neutral-600">
                            {formatDate(email.next_attempt_at)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ==================================================
                  MOBILE CARDS
              ================================================== */}

              <div className="divide-y divide-neutral-200 lg:hidden">
                {filteredEmails.map((email) => (
                  <div key={email.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-neutral-900">
                          {email.to_email}
                        </p>

                        <p className="mt-1 text-sm text-neutral-600">
                          {email.subject}
                        </p>
                      </div>

                      <span
                        className={[
                          "shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
                          statusClasses(email.status),
                        ].join(" ")}
                      >
                        {email.status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <InfoItem
                        label="Type"
                        value={formatEmailType(email.email_type)}
                      />

                      <InfoItem label="Attempts" value={email.attempts ?? 0} />

                      <InfoItem
                        label="Created"
                        value={formatDate(email.created_at)}
                      />

                      <InfoItem
                        label="Next Attempt"
                        value={formatDate(email.next_attempt_at)}
                      />
                    </div>

                    {email.last_error && (
                      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                          Last Error
                        </p>

                        <p className="mt-1 break-words text-sm text-red-700">
                          {email.last_error}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({ label, value, description }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold text-neutral-900">{value}</p>

      <p className="mt-1 text-xs text-neutral-500">{description}</p>
    </div>
  );
}

// ============================================================
// INFO ITEM
// ============================================================

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-neutral-400">{label}</p>

      <p className="mt-1 break-words text-sm text-neutral-700">{value}</p>
    </div>
  );
}
