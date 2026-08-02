"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Eye, GraduationCap, User } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

//////////////////////////////////////////////////////////////

const STATUS_VARIANTS = {
  pending: "bg-amber-100 text-amber-800",
  contacted: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  enrolled: "bg-emerald-100 text-emerald-800",
  completed: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800",
};

//////////////////////////////////////////////////////////////

function formatDate(date) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(new Date(date));
}

//////////////////////////////////////////////////////////////

export default function RecentEnrollments({
  enrollments = [],
  loading = false,
}) {
  ////////////////////////////////////////////////////////////

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg bg-neutral-100"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  ////////////////////////////////////////////////////////////

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-0">
        {/* Header */}

        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold">Recent Enrollments</h2>

            <p className="mt-1 text-sm text-neutral-500">
              Latest academy registrations.
            </p>
          </div>

          <Button asChild variant="outline" size="sm">
            <Link href="/admin/academy/enrollments">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Empty */}

        {enrollments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <GraduationCap className="mb-4 h-12 w-12 text-neutral-300" />

            <h3 className="text-lg font-semibold">No Enrollments</h3>

            <p className="mt-2 text-sm text-neutral-500">
              New enrollments will appear here.
            </p>
          </div>
        )}

        {/* Desktop */}

        {enrollments.length > 0 && (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr className="text-left text-sm">
                    <th className="px-6 py-4 font-medium">Student</th>

                    <th className="px-6 py-4 font-medium">Course</th>

                    <th className="px-6 py-4 font-medium">Mode</th>

                    <th className="px-6 py-4 font-medium">Status</th>

                    <th className="px-6 py-4 font-medium">Registered</th>

                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="border-t">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium">
                            {enrollment.first_name} {enrollment.last_name}
                          </div>

                          <div className="text-sm text-neutral-500">
                            {enrollment.email}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {enrollment.academy_enrollment_courses?.[0]?.course
                          ?.title || "-"}
                      </td>

                      <td className="px-6 py-4 capitalize">
                        {enrollment.learning_mode || "-"}
                      </td>

                      <td className="px-6 py-4">
                        <Badge
                          className={
                            STATUS_VARIANTS[enrollment.status] ||
                            "bg-neutral-100"
                          }
                        >
                          {enrollment.status}
                        </Badge>
                      </td>

                      <td className="px-6 py-4">
                        {formatDate(enrollment.created_at)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Button asChild size="icon" variant="ghost">
                          <Link
                            href={`/admin/academy/enrollments/${enrollment.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}

            <div className="divide-y lg:hidden">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="space-y-4 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-neutral-100 p-3">
                        <User className="h-5 w-5" />
                      </div>

                      <div>
                        <h3 className="font-medium">
                          {enrollment.first_name} {enrollment.last_name}
                        </h3>

                        <p className="text-sm text-neutral-500">
                          {enrollment.email}
                        </p>
                      </div>
                    </div>

                    <Badge
                      className={
                        STATUS_VARIANTS[enrollment.status] || "bg-neutral-100"
                      }
                    >
                      {enrollment.status}
                    </Badge>
                  </div>

                  <div className="grid gap-2 text-sm">
                    <div>
                      <span className="font-medium">Course:</span>{" "}
                      {enrollment.academy_enrollment_courses?.[0]?.course
                        ?.title || "-"}
                    </div>

                    <div>
                      <span className="font-medium">Mode:</span>{" "}
                      {enrollment.learning_mode}
                    </div>

                    <div className="flex items-center gap-2 text-neutral-500">
                      <Calendar className="h-4 w-4" />

                      {formatDate(enrollment.created_at)}
                    </div>
                  </div>

                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/admin/academy/enrollments/${enrollment.id}`}>
                      View Enrollment
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
