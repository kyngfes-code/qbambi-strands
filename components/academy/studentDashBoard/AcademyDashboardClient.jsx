"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  CreditCard,
  BookOpen,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import EnrollmentOverviewCard from "@/components/academy/studentDashBoard/Enrollment Overview Card";
import NextPaymentCard from "@/components/academy/studentDashBoard/NextPaymentCard";
import PaymentSummaryCard from "@/components/academy/studentDashBoard/PaymentSummaryCard";
import QuickActions from "@/components/academy/studentDashBoard/QuickActions";
import RecentActivityCard from "@/components/academy/studentDashBoard/RecentActivityCard";
import RecentPaymentsCard from "@/components/academy/studentDashBoard/RecentPaymentsCard";

export default function AcademyDashboardClient({ student, courses = [] }) {
  const router = useRouter();
  // ==========================================================
  // SELECTED COURSE
  // ==========================================================

  const [selectedCourseId, setSelectedCourseId] = useState(
    courses[0]?.enrollment?.id ?? courses[0]?.course?.id ?? null,
  );

  // ==========================================================
  // SELECTED COURSE DATA
  // ==========================================================

  const selectedCourse = useMemo(() => {
    return (
      courses.find(
        (item) =>
          item.enrollment?.id === selectedCourseId ||
          item.course?.id === selectedCourseId,
      ) ??
      courses[0] ??
      null
    );
  }, [courses, selectedCourseId]);

  // ==========================================================
  // COURSE
  // ==========================================================

  const course = selectedCourse?.course ?? null;

  const enrollment = selectedCourse?.enrollment ?? null;

  const paymentSummary = selectedCourse?.paymentSummary ?? {
    totalTuition: 0,
    totalPaid: 0,
    outstandingBalance: 0,
    paymentProgress: 0,
  };

  const nextPayment = selectedCourse?.nextPayment ?? null;

  const recentPayments = selectedCourse?.recentPayments ?? [];

  const timeline = selectedCourse?.timeline ?? [];

  // ==========================================================
  // COURSE STATUS
  // ==========================================================

  const courseStatus = course?.status ?? "draft";

  const courseStatusLabel = {
    draft: "Draft",
    published: "Published",
    archived: "Archived",
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.25em] text-[#C6A667]">
            Student Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Welcome back,
            <span className="text-[#C6A667]"> {student.first_name ?? ""}</span>
          </h1>

          <p className="mt-2 text-neutral-500">
            Student Number{" "}
            <span className="font-semibold text-neutral-900">
              {student.student_number ?? "—"}
            </span>
          </p>
        </div>

        {/* ==================================================
            COURSE SWITCHER
        ================================================== */}

        <Card className="mb-8 rounded-3xl border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            {/* Course information */}

            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#C6A667]/10">
                <GraduationCap className="h-7 w-7 text-[#C6A667]" />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Current Course
                </p>

                <h2 className="mt-1 text-xl font-semibold text-neutral-900">
                  {course?.title ?? "Course"}
                </h2>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {courseStatusLabel[courseStatus] ?? courseStatus}
                  </Badge>

                  <Badge variant="outline">
                    Enrollment #{enrollment?.enrollment_number ?? "—"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Course selector */}

            {courses.length > 1 && (
              <div className="relative w-full lg:w-auto">
                <select
                  value={selectedCourseId ?? ""}
                  onChange={(event) => setSelectedCourseId(event.target.value)}
                  className="h-11 w-full appearance-none rounded-xl border bg-white px-4 pr-10 text-sm font-medium text-neutral-900 outline-none transition focus:border-[#C6A667] focus:ring-2 focus:ring-[#C6A667]/20 lg:min-w-[260px]"
                >
                  {courses.map((item) => (
                    <option
                      key={item.enrollment?.id ?? item.course?.id}
                      value={item.enrollment?.id ?? item.course?.id}
                    >
                      {item.course?.title ?? "Course"}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              </div>
            )}
          </div>
        </Card>

        {/* ==================================================
            MULTI-COURSE SUMMARY
        ================================================== */}

        {courses.length > 1 && (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">
                  My Courses
                </h2>

                <p className="text-sm text-neutral-500">
                  Select a course to view its payments and learning information.
                </p>
              </div>

              <Badge variant="secondary">{courses.length} courses</Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((item) => {
                const itemCourse = item.course;
                const itemEnrollment = item.enrollment;

                const itemId = itemEnrollment?.id ?? itemCourse?.id;

                const isSelected = itemId === selectedCourseId;

                const itemProgress = item.paymentSummary?.paymentProgress ?? 0;

                return (
                  <button
                    key={itemId}
                    type="button"
                    onClick={() => setSelectedCourseId(itemId)}
                    className="text-left"
                  >
                    <Card
                      className={`h-full rounded-2xl border bg-white p-5 shadow-sm transition ${
                        isSelected
                          ? "border-[#C6A667] ring-2 ring-[#C6A667]/20"
                          : "hover:border-neutral-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C6A667]/10">
                            <BookOpen className="h-5 w-5 text-[#C6A667]" />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate font-semibold text-neutral-900">
                              {itemCourse?.title ?? "Course"}
                            </h3>

                            <p className="mt-1 text-xs text-neutral-500">
                              {itemEnrollment?.enrollment_number
                                ? `Enrollment #${itemEnrollment.enrollment_number}`
                                : "Active enrollment"}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-[#C6A667]" />
                        )}
                      </div>

                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="text-neutral-500">
                            Payment progress
                          </span>

                          <span className="font-semibold text-neutral-900">
                            {itemProgress}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className="h-full rounded-full bg-[#C6A667] transition-all"
                            style={{
                              width: `${Math.min(
                                Math.max(itemProgress, 0),
                                100,
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <Badge variant="default">Enrolled</Badge>

                        <span className="text-xs text-neutral-500">
                          View course
                        </span>
                      </div>
                    </Card>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================
            SELECTED COURSE HEADER
        ================================================== */}

        <Card className="mb-8 rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wider text-[#C6A667]">
                Course Overview
              </p>

              <h2 className="mt-1 text-2xl font-bold text-neutral-900">
                {course?.title ?? "Your Course"}
              </h2>

              {course?.description && (
                <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
                  {course.description}
                </p>
              )}
            </div>

            <Button
              type="button"
              className="shrink-0"
              onClick={() => {
                if (!course?.id) return;

                router.push(`/academy/dashboard/courses/${course.id}`);
              }}
              disabled={!course?.id}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Continue Learning
            </Button>
          </div>
        </Card>

        {/* ==================================================
            FINANCIAL OVERVIEW
        ================================================== */}

        <div className="grid gap-6 xl:grid-cols-3">
          <EnrollmentOverviewCard
            enrollment={{
              ...enrollment,
              course,
            }}
          />

          <PaymentSummaryCard summary={paymentSummary} />

          <NextPaymentCard payment={nextPayment} />
        </div>

        {/* ==================================================
            PAYMENT / ACTIVITY
        ================================================== */}

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <RecentPaymentsCard payments={recentPayments} />

          <RecentActivityCard timeline={timeline} />
        </div>

        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

        <div className="mt-8">
          <QuickActions />
        </div>
      </div>
    </main>
  );
}
