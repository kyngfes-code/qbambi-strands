"use client";

import { AlertCircle, CalendarDays, Mail, Phone, User } from "lucide-react";

export default function RejectedApplicationsTable({
  applications = [],
  loading = false,
}) {
  if (loading) {
    return (
      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Rejected Applications
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Applications that were rejected by academy administrators.
          </p>
        </div>

        <div className="p-8 text-center text-sm text-neutral-500">
          Loading rejected applications...
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      {/* HEADER */}
      <div className="flex flex-col gap-3 border-b border-neutral-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Rejected Applications
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Applications that were rejected by academy administrators.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
          <AlertCircle className="h-3.5 w-3.5" />
          {applications.length} Rejected
        </div>
      </div>

      {/* EMPTY */}
      {applications.length === 0 ? (
        <div className="p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
            <AlertCircle className="h-6 w-6 text-neutral-400" />
          </div>

          <p className="mt-4 text-sm font-medium text-neutral-700">
            No rejected applications
          </p>

          <p className="mt-1 text-sm text-neutral-500">
            Rejected applications will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* DESKTOP */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-left">
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Applicant
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Enrollment Number
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Contact
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Reason
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Rejected At
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {applications.map((application) => (
                  <tr
                    key={application.id}
                    className="transition hover:bg-neutral-50"
                  >
                    {/* APPLICANT */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50">
                          <User className="h-4 w-4 text-red-600" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-neutral-900">
                            {`${application.first_name ?? ""} ${
                              application.last_name ?? ""
                            }`.trim() || "Unknown Applicant"}
                          </p>

                          <p className="mt-1 truncate text-xs text-neutral-500">
                            {application.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* ENROLLMENT NUMBER */}
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm font-semibold text-neutral-700">
                        {application.enrollment_number || "—"}
                      </span>
                    </td>

                    {/* CONTACT */}
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        {application.email && (
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span className="max-w-[220px] truncate">
                              {application.email}
                            </span>
                          </div>
                        )}

                        {application.phone && (
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            <span>{application.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* REASON */}
                    <td className="px-5 py-4">
                      <div className="max-w-[320px]">
                        <p className="text-sm leading-6 text-neutral-700">
                          {application.rejection_reason || "—"}
                        </p>

                        {application.admin_note && (
                          <p className="mt-2 text-xs leading-5 text-neutral-500">
                            <span className="font-semibold text-neutral-600">
                              Admin note:
                            </span>{" "}
                            {application.admin_note}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* DATE */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <CalendarDays className="h-4 w-4 shrink-0" />

                        {formatDate(application.rejected_at)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE */}
          <div className="divide-y divide-neutral-200 lg:hidden">
            {applications.map((application) => {
              const fullName =
                `${application.first_name ?? ""} ${
                  application.last_name ?? ""
                }`.trim() || "Unknown Applicant";

              return (
                <div key={application.id} className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                      <User className="h-5 w-5 text-red-600" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-neutral-900">
                            {fullName}
                          </p>

                          <p className="mt-1 truncate text-xs text-neutral-500">
                            {application.email || "No email"}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                          Rejected
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <InfoItem
                      label="Enrollment Number"
                      value={application.enrollment_number || "—"}
                    />

                    <InfoItem label="Phone" value={application.phone || "—"} />

                    <InfoItem
                      label="Rejected At"
                      value={formatDate(application.rejected_at)}
                    />

                    <InfoItem label="Email" value={application.email || "—"} />
                  </div>

                  <div className="mt-4 rounded-xl border border-red-100 bg-red-50/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                      Rejection Reason
                    </p>

                    <p className="mt-2 text-sm leading-6 text-neutral-700">
                      {application.rejection_reason || "—"}
                    </p>
                  </div>

                  {application.admin_note && (
                    <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Admin Note
                      </p>

                      <p className="mt-2 text-sm leading-6 text-neutral-700">
                        {application.admin_note}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-neutral-400">{label}</p>

      <p className="mt-1 break-words text-sm text-neutral-700">{value}</p>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
