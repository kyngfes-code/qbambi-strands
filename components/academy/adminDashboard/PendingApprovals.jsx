"use client";

import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Eye,
  GraduationCap,
  Phone,
  UserX,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

//////////////////////////////////////////////////////////////

function formatDate(date) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(new Date(date));
}

//////////////////////////////////////////////////////////////

export default function PendingApprovals({
  enrollments = [],
  loading = false,
  onApprove,
  onReject,
}) {
  ////////////////////////////////////////////////////////////

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl bg-neutral-100"
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
            <h2 className="text-lg font-semibold">Pending Approvals</h2>

            <p className="mt-1 text-sm text-neutral-500">
              Students waiting for approval.
            </p>
          </div>

          <Button asChild variant="outline" size="sm">
            <Link href="/admin/academy/enrollments?status=pending">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Empty */}

        {enrollments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <GraduationCap className="mb-4 h-12 w-12 text-neutral-300" />

            <h3 className="text-lg font-semibold">No Pending Approvals</h3>

            <p className="mt-2 text-sm text-neutral-500">
              All enrollments have been reviewed.
            </p>
          </div>
        )}

        {/* Desktop */}

        {enrollments.length > 0 && (
          <>
            <div className="hidden divide-y lg:block">
              {enrollments.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between px-6 py-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                      <GraduationCap className="h-6 w-6 text-amber-700" />
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">
                          {student.first_name} {student.last_name}
                        </h3>

                        <Badge className="bg-amber-100 text-amber-800">
                          Pending
                        </Badge>
                      </div>

                      <p className="mt-1 text-sm text-neutral-500">
                        {student.email}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />

                          {student.phone}
                        </span>

                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />

                          {formatDate(student.created_at)}
                        </span>

                        <span>
                          {student.academy_enrollment_courses?.[0]?.course
                            ?.title || "No course selected"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/academy/enrollments/${student.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onReject?.(student)}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Reject
                    </Button>

                    <Button size="sm" onClick={() => onApprove?.(student)}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile */}

            <div className="divide-y lg:hidden">
              {enrollments.map((student) => (
                <div key={student.id} className="space-y-4 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {student.first_name} {student.last_name}
                      </h3>

                      <p className="mt-1 text-sm text-neutral-500">
                        {student.email}
                      </p>
                    </div>

                    <Badge className="bg-amber-100 text-amber-800">
                      Pending
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-neutral-500">
                    <div>
                      <strong>Course:</strong>{" "}
                      {student.academy_enrollment_courses?.[0]?.course?.title ||
                        "-"}
                    </div>

                    <div>
                      <strong>Phone:</strong> {student.phone}
                    </div>

                    <div>
                      <strong>Registered:</strong>{" "}
                      {formatDate(student.created_at)}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/academy/enrollments/${student.id}`}>
                        View
                      </Link>
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onReject?.(student)}
                    >
                      Reject
                    </Button>

                    <Button size="sm" onClick={() => onApprove?.(student)}>
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
