"use client";

import { Eye, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import EnrollmentStatusBadge from "./EnrollmentStatusBadge";

export default function EnrollmentTable({
  enrollments = [],
  loading = false,
  onView,
  onEdit,
  onApprove,
  onReject,
  onDelete,
}) {
  //----------------------------------------------------------
  // Loading
  //----------------------------------------------------------

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white">
        <div className="p-16 text-center text-neutral-500">
          Loading enrollments...
        </div>
      </div>
    );
  }

  //----------------------------------------------------------
  // Empty
  //----------------------------------------------------------

  if (!enrollments.length) {
    return (
      <div className="rounded-2xl border bg-white">
        <div className="p-16 text-center">
          <h3 className="text-lg font-semibold">No enrollments found</h3>

          <p className="mt-2 text-neutral-500">
            No enrollment matches your current filters.
          </p>
        </div>
      </div>
    );
  }

  //----------------------------------------------------------

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
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
                    {(enrollment.courses || []).map((course) => (
                      <div key={course.course_id} className="text-sm">
                        {course.course_title ?? course.title ?? "Course"}
                      </div>
                    ))}
                  </div>
                </td>

                {/* Learning */}

                <td className="px-6 py-5 capitalize">
                  {enrollment.learning_mode}
                </td>

                {/* Payment */}

                <td className="px-6 py-5 capitalize">
                  {enrollment.payment_plan}
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

                <td className="px-6 py-5 whitespace-nowrap text-sm text-neutral-500">
                  {new Date(enrollment.created_at).toLocaleDateString()}
                </td>

                {/* Actions */}

                <td className="px-6 py-5">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => onView?.(enrollment)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => onEdit?.(enrollment)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    {enrollment.status === "pending" && (
                      <>
                        <Button
                          size="icon"
                          variant="outline"
                          className="text-green-600"
                          onClick={() => onApprove?.(enrollment)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>

                        <Button
                          size="icon"
                          variant="outline"
                          className="text-orange-600"
                          onClick={() => onReject?.(enrollment)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    <Button
                      size="icon"
                      variant="outline"
                      className="text-red-600"
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
                <span className="capitalize">{enrollment.learning_mode}</span>
              </div>

              <div>
                <span className="font-medium">Payment:</span>{" "}
                <span className="capitalize">{enrollment.payment_plan}</span>
              </div>

              <div>
                <span className="font-medium">Tuition:</span> ₦
                {Number(enrollment.total_course_fee || 0).toLocaleString()}
              </div>

              <div>
                <span className="font-medium">Submitted:</span>{" "}
                {new Date(enrollment.created_at).toLocaleDateString()}
              </div>

              <div>
                <span className="font-medium">Courses:</span>

                <div className="mt-1 space-y-1">
                  {(enrollment.courses || []).map((course) => (
                    <div key={course.course_id}>
                      • {course.course_title ?? course.title ?? "Course"}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onView?.(enrollment)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit?.(enrollment)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>

              {enrollment.status === "pending" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600"
                    onClick={() => onApprove?.(enrollment)}
                  >
                    Approve
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="text-orange-600"
                    onClick={() => onReject?.(enrollment)}
                  >
                    Reject
                  </Button>
                </>
              )}

              <Button
                size="sm"
                variant="outline"
                className="text-red-600"
                onClick={() => onDelete?.(enrollment)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
