"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Users,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

//////////////////////////////////////////////////////////////

function formatCurrency(amount = 0) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

//////////////////////////////////////////////////////////////

export default function TopCourses({ courses = [], loading = false }) {
  ////////////////////////////////////////////////////////////

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="space-y-4 p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-neutral-100"
            />
          ))}
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
            <h2 className="text-lg font-semibold">Top Performing Courses</h2>

            <p className="mt-1 text-sm text-neutral-500">
              Courses with the highest enrollments.
            </p>
          </div>

          <Button asChild variant="outline" size="sm">
            <Link href="/admin/academy/courses">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Empty */}

        {courses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <GraduationCap className="mb-4 h-12 w-12 text-neutral-300" />

            <h3 className="text-lg font-semibold">No Course Statistics</h3>

            <p className="mt-2 text-sm text-neutral-500">
              Course performance will appear here.
            </p>
          </div>
        )}

        {/* Desktop */}

        {courses.length > 0 && (
          <>
            <div className="hidden divide-y lg:block">
              {courses.map((course, index) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between px-6 py-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700">
                      #{index + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{course.title}</h3>

                        <Badge variant="secondary">{course.category}</Badge>

                        <Badge>{course.level}</Badge>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-5 text-sm text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.enrollment_count ?? 0} Students
                        </span>

                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />

                          {formatCurrency(course.revenue || 0)}
                        </span>

                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {course.learning_modes ?? 0} Modes
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/academy/courses/${course.id}`}>
                      View
                    </Link>
                  </Button>
                </div>
              ))}
            </div>

            {/* Mobile */}

            <div className="divide-y lg:hidden">
              {courses.map((course, index) => (
                <div key={course.id} className="space-y-4 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge>#{index + 1}</Badge>
                      </div>

                      <h3 className="mt-2 font-semibold">{course.title}</h3>

                      <p className="mt-1 text-sm text-neutral-500">
                        {course.level}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-neutral-50 p-3">
                      <div className="text-neutral-500">Students</div>

                      <div className="mt-1 font-semibold">
                        {course.enrollment_count ?? 0}
                      </div>
                    </div>

                    <div className="rounded-lg bg-neutral-50 p-3">
                      <div className="text-neutral-500">Revenue</div>

                      <div className="mt-1 font-semibold">
                        {formatCurrency(course.revenue || 0)}
                      </div>
                    </div>
                  </div>

                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/admin/academy/courses/${course.id}`}>
                      View Course
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
