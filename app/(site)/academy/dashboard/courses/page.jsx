"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Loader2,
  ArrowRight,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AcademyCoursesPage() {
  const router = useRouter();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/academy/dashboard", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "Unable to load your academy courses.",
          );
        }

        setDashboard(data);
      } catch (err) {
        console.error("Academy courses load error:", err);

        setError(err?.message || "Unable to load your academy courses.");
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4">
          <div className="flex items-center gap-3 text-neutral-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading your courses...
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <Card className="rounded-3xl border bg-white p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <span className="text-xl text-red-600">!</span>
            </div>

            <h1 className="mt-4 text-xl font-semibold text-neutral-900">
              Unable to load courses
            </h1>

            <p className="mt-2 text-sm text-neutral-500">{error}</p>

            <Button className="mt-6" onClick={() => window.location.reload()}>
              Try again
            </Button>
          </Card>
        </div>
      </main>
    );
  }

  const student = dashboard?.student ?? null;

  const courses = Array.isArray(dashboard?.courses) ? dashboard.courses : [];

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* HEADER */}

        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.25em] text-[#C6A667]">
            Academy
          </p>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                My Courses
              </h1>

              <p className="mt-2 text-neutral-500">
                Welcome back,{" "}
                <span className="font-semibold text-neutral-900">
                  {student?.first_name ?? "Student"}
                </span>
                . Continue your learning journey.
              </p>
            </div>

            <Badge variant="secondary">
              {courses.length} {courses.length === 1 ? "course" : "courses"}
            </Badge>
          </div>
        </div>

        {/* EMPTY */}

        {!courses.length ? (
          <Card className="rounded-3xl border bg-white p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C6A667]/10">
              <GraduationCap className="h-7 w-7 text-[#C6A667]" />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-neutral-900">
              No active courses
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              You do not currently have any active academy courses.
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((item) => {
              const course = item?.course;
              const enrollment = item?.enrollment;
              const progress = item?.progress;

              if (!course?.id) {
                return null;
              }

              const progressPercentage = Math.min(
                Math.max(Number(progress?.progressPercentage ?? 0), 0),
                100,
              );

              return (
                <Card
                  key={`${enrollment?.id}-${course.id}`}
                  className="group overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* THUMBNAIL */}

                  <div className="relative aspect-video overflow-hidden bg-neutral-100">
                    {course.thumbnail_path ? (
                      <img
                        src={course.thumbnail_path}
                        alt={course.title ?? "Course"}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-12 w-12 text-neutral-300" />
                      </div>
                    )}

                    <div className="absolute left-4 top-4">
                      <Badge className="bg-white/95 text-neutral-900 hover:bg-white">
                        Enrolled
                      </Badge>
                    </div>
                  </div>

                  {/* CONTENT */}

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wider text-[#C6A667]">
                          {course.course_code ?? "Academy Course"}
                        </p>

                        <h2 className="mt-1 text-xl font-semibold text-neutral-900">
                          {course.title ?? "Course"}
                        </h2>
                      </div>

                      {progress?.courseCompleted ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                      ) : (
                        <Clock3 className="h-5 w-5 shrink-0 text-neutral-400" />
                      )}
                    </div>

                    {course.description && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-500">
                        {course.description}
                      </p>
                    )}

                    {/* PROGRESS */}

                    <div className="mt-6">
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-neutral-500">
                          Course progress
                        </span>

                        <span className="font-semibold text-neutral-900">
                          {progressPercentage}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full rounded-full bg-[#C6A667] transition-all"
                          style={{
                            width: `${progressPercentage}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* STATS */}

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-neutral-50 p-3">
                        <p className="text-xs text-neutral-500">Modules</p>

                        <p className="mt-1 font-semibold text-neutral-900">
                          {progress?.completedModules ?? 0}/
                          {progress?.totalModules ?? 0}
                        </p>
                      </div>

                      <div className="rounded-xl bg-neutral-50 p-3">
                        <p className="text-xs text-neutral-500">Enrollment</p>

                        <p className="mt-1 truncate font-semibold text-neutral-900">
                          #{enrollment?.enrollment_number ?? "—"}
                        </p>
                      </div>
                    </div>

                    {/* ACTION */}

                    <Button
                      className="mt-6 w-full"
                      onClick={() =>
                        router.push(`/academy/dashboard/courses/${course.id}`)
                      }
                    >
                      {progress?.courseCompleted
                        ? "Review Course"
                        : "Continue Learning"}

                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
