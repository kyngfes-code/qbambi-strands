"use client";

import { Eye, Trash2, CheckCircle2, XCircle } from "lucide-react";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import EnrollmentStatusBadge from "./EnrollmentStatusBadge";

export default function EnrollmentTable({
  enrollments = [],
  loading = false,
  saving = false,
  onApprove,
  onReject,
  onDelete,
}) {
  //----------------------------------------------------------
  // Loading
  //----------------------------------------------------------

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center">
        <p className="text-neutral-500">Loading enrollments...</p>
      </div>
    );
  }

  //----------------------------------------------------------
  // Empty
  //----------------------------------------------------------

  if (!enrollments.length) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center">
        <h3 className="text-lg font-semibold text-neutral-900">
          No enrollments found
        </h3>

        <p className="mt-2 text-neutral-500">
          No enrollment matches your current filters.
        </p>
      </div>
    );
  }

  //----------------------------------------------------------
  // Approve
  //----------------------------------------------------------

  function handleApprove(enrollment) {
    if (saving) return;

    if (!enrollment?.id) {
      return;
    }

    onApprove?.(enrollment);
  }

  //----------------------------------------------------------
  // Reject
  //----------------------------------------------------------

  function handleReject(enrollment) {
    if (saving) return;

    if (!enrollment?.id) {
      return;
    }

    onReject?.(enrollment);
  }

  //----------------------------------------------------------
  // Render
  //----------------------------------------------------------

  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      {/* Desktop */}

      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full">
          <thead className="border-b bg-neutral-50">
            <tr className="text-left text-sm font-semibold text-neutral-600">
              <th className="px-6 py-4">Student</th>

              <th className="px-6 py-4">Course(s)</th>

              <th className="px-6 py-4">Learning</th>

              <th className="px-6 py-4">Payment</th>

              <th className="px-6 py-4">Tuition</th>

              <th className="px-6 py-4">Status</th>

              <th className="px-6 py-4">Submitted</th>

              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {enrollments.map((enrollment) => (
              <tr
                key={enrollment.id}
                className="border-b transition hover:bg-neutral-50"
              >
                {/* Student */}

                <td className="px-6 py-5">
                  <div className="font-medium">
                    {enrollment.first_name} {enrollment.last_name}
                  </div>

                  <div className="mt-1 text-sm text-neutral-500">
                    {enrollment.email}
                  </div>

                  <div className="text-sm text-neutral-500">
                    {enrollment.phone}
                  </div>
                </td>

                {/* Courses */}

                <td className="px-6 py-5">
                  <div className="space-y-1">
                    {(enrollment.courses || []).map((course, index) => (
                      <div
                        key={course.id ?? course.course_id ?? index}
                        className="text-sm"
                      >
                        {course.course_title ??
                          course.title ??
                          course.course?.title ??
                          "Course"}
                      </div>
                    ))}
                  </div>
                </td>

                {/* Learning */}

                <td className="px-6 py-5 capitalize">
                  {enrollment.learning_mode || "-"}
                </td>

                {/* Payment */}

                <td className="px-6 py-5 capitalize">
                  {enrollment.payment_plan || "-"}
                </td>

                {/* Tuition */}

                <td className="px-6 py-5 font-medium">
                  ₦{Number(enrollment.total_course_fee || 0).toLocaleString()}
                </td>

                {/* Status */}

                <td className="px-6 py-5">
                  <EnrollmentStatusBadge status={enrollment.status} />
                </td>

                {/* Date */}

                <td className="whitespace-nowrap px-6 py-5 text-sm text-neutral-500">
                  {enrollment.created_at
                    ? new Date(enrollment.created_at).toLocaleDateString(
                        "en-NG",
                        {
                          dateStyle: "medium",
                        },
                      )
                    : "-"}
                </td>

                {/* Actions */}

                <td className="px-6 py-5">
                  <div className="flex justify-end gap-2">
                    {/* View */}

                    <Button
                      asChild
                      size="icon"
                      variant="outline"
                      title="View enrollment"
                    >
                      <Link
                        href={`/admin/academy/enrollments/${enrollment.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>

                    {/* Approve / Reject */}

                    {enrollment.status === "pending" && (
                      <>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          disabled={saving}
                          className="text-green-600 hover:text-green-700"
                          title="Approve enrollment"
                          onClick={() => handleApprove(enrollment)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>

                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          disabled={saving}
                          className="text-orange-600 hover:text-orange-700"
                          title="Reject enrollment"
                          onClick={() => handleReject(enrollment)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    {/* Delete */}

                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      disabled={saving}
                      className="text-red-600 hover:text-red-700"
                      title="Delete enrollment"
                      onClick={() => onDelete?.(enrollment)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}

      <div className="space-y-4 p-4 lg:hidden">
        {enrollments.map((enrollment) => (
          <div key={enrollment.id} className="rounded-2xl border p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">
                  {enrollment.first_name} {enrollment.last_name}
                </h3>

                <p className="mt-1 text-sm text-neutral-500">
                  {enrollment.email}
                </p>

                <p className="text-sm text-neutral-500">{enrollment.phone}</p>
              </div>

              <EnrollmentStatusBadge status={enrollment.status} />
            </div>

            <div className="mt-5 space-y-2 text-sm">
              <div>
                <span className="font-medium">Learning:</span>{" "}
                <span className="capitalize">
                  {enrollment.learning_mode || "-"}
                </span>
              </div>

              <div>
                <span className="font-medium">Payment:</span>{" "}
                <span className="capitalize">
                  {enrollment.payment_plan || "-"}
                </span>
              </div>

              <div>
                <span className="font-medium">Tuition:</span> ₦
                {Number(enrollment.total_course_fee || 0).toLocaleString()}
              </div>

              <div>
                <span className="font-medium">Submitted:</span>{" "}
                {enrollment.created_at
                  ? new Date(enrollment.created_at).toLocaleDateString(
                      "en-NG",
                      {
                        dateStyle: "medium",
                      },
                    )
                  : "-"}
              </div>

              <div>
                <span className="font-medium">Courses:</span>

                <div className="mt-1 space-y-1">
                  {(enrollment.courses || []).map((course, index) => (
                    <div key={course.id ?? course.course_id ?? index}>
                      •{" "}
                      {course.course_title ??
                        course.title ??
                        course.course?.title ??
                        "Course"}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}

            <div className="mt-6 flex flex-wrap gap-2">
              {/* View */}

              <Button asChild size="sm" variant="outline">
                <Link href={`/admin/academy/enrollments/${enrollment.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Link>
              </Button>

              {/* Approve */}

              {enrollment.status === "pending" && (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={saving}
                    className="text-green-600"
                    onClick={() => handleApprove(enrollment)}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve
                  </Button>

                  {/* Reject */}

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={saving}
                    className="text-orange-600"
                    onClick={() => handleReject(enrollment)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </>
              )}

              {/* Delete */}

              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={saving}
                className="text-red-600"
                onClick={() => onDelete?.(enrollment)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
