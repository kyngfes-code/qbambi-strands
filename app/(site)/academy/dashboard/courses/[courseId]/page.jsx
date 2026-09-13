"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Loader2,
  Lock,
  PlayCircle,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AcademyCoursePage() {
  const router = useRouter();
  const params = useParams();

  const courseId = params?.courseId;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // LOAD COURSE
  // ==========================================================

  useEffect(() => {
    if (!courseId) return;

    async function loadCourse() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/academy/courses/${courseId}`, {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Unable to load this course.");
        }

        setData(result);
      } catch (err) {
        console.error("Academy course page error:", err);

        setError(err?.message || "Unable to load this course.");
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [courseId]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex items-center gap-3 text-neutral-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading course...
          </div>
        </div>
      </main>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !data) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-2xl px-4 py-12">
          <Card className="rounded-3xl border bg-white p-8 text-center">
            <h1 className="text-xl font-semibold text-neutral-900">
              Unable to load course
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              {error || "Course data is unavailable."}
            </p>

            <Button
              className="mt-6"
              onClick={() => router.push("/academy/dashboard/courses")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to courses
            </Button>
          </Card>
        </div>
      </main>
    );
  }

  // ==========================================================
  // DATA
  // ==========================================================

  const course = data.course;

  const enrollment = data.enrollment?.enrollment;

  const modules = Array.isArray(data.modules) ? data.modules : [];

  const progress = data.progress ?? {};

  const currentModule = data.currentModule;

  // ==========================================================
  // HELPERS
  // ==========================================================

  const getModuleHref = (moduleId) => {
    return `/academy/dashboard/courses/${course.id}/modules/${moduleId}`;
  };

  // ==========================================================
  // DETERMINE MODULE ACCESS
  //
  // Priority:
  //
  // 1. Completed modules are always reviewable.
  // 2. Current module is available.
  // 3. Explicit unlocked modules are available.
  // 4. First module is always available.
  // 5. Everything else is locked.
  // ==========================================================

  const isModuleCompleted = (module) => {
    return module?.progress?.completed === true;
  };

  const isModuleCurrent = (module) => {
    return currentModule?.id === module?.id;
  };

  const isModuleExplicitlyUnlocked = (module) => {
    return module?.progress?.unlocked === true;
  };

  const isModuleLocked = (module, index) => {
    if (isModuleCompleted(module)) {
      return false;
    }

    if (isModuleCurrent(module)) {
      return false;
    }

    if (isModuleExplicitlyUnlocked(module)) {
      return false;
    }

    if (index === 0) {
      return false;
    }

    return true;
  };

  // ==========================================================
  // OPEN MODULE
  // ==========================================================

  const handleOpenModule = (module, index) => {
    if (isModuleLocked(module, index)) {
      return;
    }

    router.push(getModuleHref(module.id));
  };

  // ==========================================================
  // MODULE PROGRESS
  // ==========================================================

  const getModuleProgressPercentage = (module) => {
    const value =
      module?.progress?.progressPercentage ?? module?.progress?.percentage ?? 0;

    return Math.min(Math.max(Number(value) || 0, 0), 100);
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ======================================================
            BACK
        ====================================================== */}

        <Button
          variant="ghost"
          className="mb-6 -ml-2"
          onClick={() => router.push("/academy/dashboard/courses")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          My Courses
        </Button>

        {/* ======================================================
            COURSE HERO
        ====================================================== */}

        <Card className="overflow-hidden rounded-3xl border bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            {/* IMAGE */}

            <div className="relative min-h-[280px] bg-neutral-100">
              {course?.thumbnail_path ? (
                <img
                  src={course.thumbnail_path}
                  alt={course.title ?? "Course"}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[280px] items-center justify-center">
                  <GraduationCap className="h-20 w-20 text-neutral-300" />
                </div>
              )}
            </div>

            {/* INFO */}

            <div className="p-7 sm:p-9">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C6A667]">
                {course?.course_code ?? "Academy Course"}
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">
                {course?.title ?? "Course"}
              </h1>

              {course?.description && (
                <p className="mt-4 text-sm leading-7 text-neutral-500">
                  {course.description}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                <Badge>Enrolled</Badge>

                {enrollment?.enrollment_number && (
                  <Badge variant="outline">
                    Enrollment #{enrollment.enrollment_number}
                  </Badge>
                )}

                {enrollment?.learning_mode && (
                  <Badge variant="secondary">{enrollment.learning_mode}</Badge>
                )}
              </div>

              {/* COURSE PROGRESS */}

              <div className="mt-7">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-neutral-500">
                    Course progress
                  </span>

                  <span className="font-semibold text-neutral-900">
                    {progress.progressPercentage ?? 0}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-[#C6A667] transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        Math.max(Number(progress.progressPercentage ?? 0), 0),
                        100,
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-3 text-xs text-neutral-500">
                  {progress.completedModules ?? 0} of{" "}
                  {progress.totalModules ?? 0} modules completed
                </div>
              </div>

              {/* CONTINUE */}

              {currentModule && (
                <Button
                  className="mt-7 w-full sm:w-auto"
                  onClick={() =>
                    handleOpenModule(
                      currentModule,
                      modules.findIndex((item) => item.id === currentModule.id),
                    )
                  }
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Continue Learning
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* ======================================================
            MODULES
        ====================================================== */}

        <div className="mt-8">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-neutral-900">
              Course Modules
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Complete each module to unlock the next one.
            </p>
          </div>

          {/* NO MODULES */}

          {!modules.length ? (
            <Card className="rounded-3xl border bg-white p-8 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-neutral-300" />

              <h3 className="mt-4 font-semibold text-neutral-900">
                No modules available
              </h3>

              <p className="mt-2 text-sm text-neutral-500">
                Course modules have not been published yet.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {modules.map((module, index) => {
                const completed = isModuleCompleted(module);

                const isCurrent = isModuleCurrent(module);

                const locked = isModuleLocked(module, index);

                const moduleProgress = getModuleProgressPercentage(module);

                const title =
                  module.title ??
                  module.name ??
                  `Module ${module.moduleIndex ?? index + 1}`;

                return (
                  <Card
                    key={module.id}
                    role={locked ? undefined : "button"}
                    tabIndex={locked ? -1 : 0}
                    onClick={() => {
                      if (!locked) {
                        handleOpenModule(module, index);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (locked) return;

                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();

                        handleOpenModule(module, index);
                      }
                    }}
                    className={`rounded-2xl border bg-white p-5 shadow-sm transition-all ${
                      locked
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer hover:-translate-y-0.5 hover:border-[#C6A667]/60 hover:shadow-md"
                    } ${
                      isCurrent
                        ? "border-[#C6A667] ring-2 ring-[#C6A667]/10"
                        : ""
                    } ${completed ? "border-green-200" : ""}`}
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      {/* NUMBER */}

                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                          completed
                            ? "bg-green-100 text-green-700"
                            : locked
                              ? "bg-neutral-100 text-neutral-400"
                              : isCurrent
                                ? "bg-[#C6A667]/10 text-[#C6A667]"
                                : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        {completed ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : locked ? (
                          <Lock className="h-5 w-5" />
                        ) : (
                          <span className="font-semibold">
                            {module.moduleIndex ?? index + 1}
                          </span>
                        )}
                      </div>

                      {/* INFO */}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-neutral-900">
                            {title}
                          </h3>

                          {completed && (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              Completed
                            </Badge>
                          )}

                          {isCurrent && !completed && (
                            <Badge variant="secondary">Current</Badge>
                          )}

                          {locked && (
                            <Badge
                              variant="outline"
                              className="gap-1 text-neutral-500"
                            >
                              <Lock className="h-3 w-3" />
                              Locked
                            </Badge>
                          )}
                        </div>

                        {module.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
                            {module.description}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-4">
                          {module.duration_minutes && (
                            <div className="flex items-center gap-1 text-xs text-neutral-400">
                              <Clock3 className="h-3.5 w-3.5" />
                              {module.duration_minutes} minutes
                            </div>
                          )}

                          {!locked && !completed && moduleProgress > 0 && (
                            <span className="text-xs text-neutral-500">
                              {moduleProgress}% complete
                            </span>
                          )}
                        </div>

                        {/* MODULE PROGRESS BAR */}

                        {!locked && (
                          <div className="mt-4">
                            <div className="mb-1.5 flex items-center justify-between text-xs">
                              <span className="text-neutral-400">
                                Module progress
                              </span>

                              <span className="font-medium text-neutral-600">
                                {completed ? 100 : moduleProgress}%
                              </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  completed ? "bg-green-500" : "bg-[#C6A667]"
                                }`}
                                style={{
                                  width: `${completed ? 100 : moduleProgress}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {locked && (
                          <p className="mt-3 text-xs text-neutral-400">
                            Complete the previous module to unlock this module.
                          </p>
                        )}
                      </div>

                      {/* ACTION */}

                      <div className="shrink-0">
                        {locked ? (
                          <Button type="button" variant="secondary" disabled>
                            <Lock className="mr-2 h-4 w-4" />
                            Locked
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant={
                              completed
                                ? "outline"
                                : isCurrent
                                  ? "default"
                                  : "secondary"
                            }
                            onClick={(event) => {
                              event.stopPropagation();

                              handleOpenModule(module, index);
                            }}
                          >
                            {completed
                              ? "Review"
                              : isCurrent
                                ? "Continue"
                                : "Start"}

                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
