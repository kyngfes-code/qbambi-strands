"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Plus,
  ChevronDown,
  CreditCard,
  Wallet,
  CalendarDays,
  Layers3,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import PaymentMethodSelector from "@/components/payments/PaymentMethodSelector";

import EnrollmentOverviewCard from "@/components/academy/studentDashBoard/Enrollment Overview Card";
import NextPaymentCard from "@/components/academy/studentDashBoard/NextPaymentCard";
import PaymentSummaryCard from "@/components/academy/studentDashBoard/PaymentSummaryCard";
import QuickActions from "@/components/academy/studentDashBoard/QuickActions";
import RecentActivityCard from "@/components/academy/studentDashBoard/RecentActivityCard";
import RecentPaymentsCard from "@/components/academy/studentDashBoard/RecentPaymentsCard";

// ==========================================================
// HELPERS
// ==========================================================

function formatCurrency(value) {
  const amount = Number(value);

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDate(value) {
  if (!value) return "—";

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return new Intl.DateTimeFormat("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return "—";
  }
}

function getNumber(...values) {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      Number.isFinite(Number(value))
    ) {
      return Number(value);
    }
  }

  return 0;
}

function getCourseTitle(courseItem) {
  return (
    courseItem?.course?.title ??
    courseItem?.course?.course_code ??
    courseItem?.course?.courseCode ??
    "Course"
  );
}

function getEnrollmentNumber(enrollment) {
  return enrollment?.enrollmentNumber ?? enrollment?.enrollment_number ?? "—";
}

function getLearningMode(enrollment) {
  return enrollment?.learningMode ?? enrollment?.learning_mode ?? null;
}

function getCreatedAt(enrollment) {
  return enrollment?.createdAt ?? enrollment?.created_at ?? null;
}

// ==========================================================
// ENROLLMENT FINANCIAL NORMALIZER
// ==========================================================

function getEnrollmentFinancials(enrollmentDashboard) {
  const enrollment = enrollmentDashboard?.enrollment ?? {};
  const paymentSummary = enrollmentDashboard?.paymentSummary ?? {};

  const totalPayable = getNumber(
    paymentSummary.totalTuition,
    paymentSummary.total_payable,
    paymentSummary.totalPayable,
    enrollment.totalPayable,
    enrollment.total_payable,
    enrollment.total_course_fee,
  );

  const amountPaid = getNumber(
    paymentSummary.totalPaid,
    paymentSummary.total_paid,
    paymentSummary.amountPaid,
    paymentSummary.amount_paid,
    enrollment.amountPaid,
    enrollment.amount_paid,
  );

  const balanceDue = getNumber(
    paymentSummary.outstandingBalance,
    paymentSummary.outstanding_balance,
    paymentSummary.balanceDue,
    paymentSummary.balance_due,
    enrollment.balanceDue,
    enrollment.balance_due,
  );

  let paymentProgress = getNumber(
    paymentSummary.paymentProgress,
    paymentSummary.payment_progress,
  );

  // If the API didn't provide payment progress,
  // calculate it from the financial source of truth.
  if (paymentProgress <= 0 && totalPayable > 0 && amountPaid > 0) {
    paymentProgress = (amountPaid / totalPayable) * 100;
  }

  paymentProgress = Math.min(Math.max(paymentProgress, 0), 100);

  return {
    totalPayable,
    amountPaid,
    balanceDue,
    paymentProgress,
  };
}

// ==========================================================
// COURSE CARD
// ==========================================================

function EnrollmentCourseCard({ courseItem }) {
  const router = useRouter();

  const course = courseItem?.course ?? {};
  const progress = courseItem?.progress ?? {};

  const percentage = getNumber(
    progress.progressPercentage,
    progress.progress_percentage,
  );

  const currentModule =
    courseItem?.currentModule ?? courseItem?.current_module ?? null;

  const modules = Array.isArray(courseItem?.modules) ? courseItem.modules : [];

  const completedModules = getNumber(
    progress.completedModules,
    progress.completed_modules,
  );

  const totalModules = getNumber(
    progress.totalModules,
    progress.total_modules,
    modules.length,
  );

  const remainingModules = getNumber(
    progress.remainingModules,
    progress.remaining_modules,
    Math.max(totalModules - completedModules, 0),
  );

  const courseCompleted =
    progress.courseCompleted ?? progress.course_completed ?? false;

  const handleContinueLearning = () => {
    if (!course?.id) return;

    if (currentModule?.id) {
      router.push(
        `/academy/dashboard/courses/${course.id}/modules/${currentModule.id}`,
      );

      return;
    }

    if (modules[0]?.id) {
      router.push(
        `/academy/dashboard/courses/${course.id}/modules/${modules[0].id}`,
      );

      return;
    }

    router.push(`/academy/dashboard/courses/${course.id}`);
  };

  return (
    <Card className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
      {/* COURSE IMAGE */}

      <div className="relative aspect-[16/9] bg-neutral-100">
        {course?.thumbnail_path ? (
          <img
            src={course.thumbnail_path}
            alt={course?.title ?? "Academy course"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-10 w-10 text-neutral-300" />
          </div>
        )}
      </div>

      <div className="p-5">
        {/* COURSE TITLE */}

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C6A667]/10">
            <BookOpen className="h-5 w-5 text-[#C6A667]" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-neutral-900">
              {getCourseTitle(courseItem)}
            </h3>

            {course?.course_code && (
              <p className="mt-1 text-xs text-neutral-500">
                {course.course_code}
              </p>
            )}
          </div>

          {courseCompleted && (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
          )}
        </div>

        {/* DESCRIPTION */}

        {course?.description && (
          <p className="mt-4 line-clamp-2 text-sm leading-6 text-neutral-500">
            {course.description}
          </p>
        )}

        {/* PROGRESS */}

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-neutral-500">Learning progress</span>

            <span className="font-semibold text-neutral-900">
              {Math.round(percentage)}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-[#C6A667] transition-all"
              style={{
                width: `${Math.min(Math.max(percentage, 0), 100)}%`,
              }}
            />
          </div>
        </div>

        {/* MODULE COUNTS */}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="text-xs text-neutral-500">Completed</p>

            <p className="mt-1 text-sm font-semibold text-neutral-900">
              {completedModules} / {totalModules}
            </p>
          </div>

          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="text-xs text-neutral-500">Remaining</p>

            <p className="mt-1 text-sm font-semibold text-neutral-900">
              {remainingModules}
            </p>
          </div>
        </div>

        {/* CURRENT MODULE */}

        {currentModule && (
          <div className="mt-4 rounded-xl border border-[#C6A667]/20 bg-[#C6A667]/5 p-4">
            <p className="text-xs font-medium text-[#9A7B3F]">
              Continue Learning
            </p>

            <p className="mt-1 text-sm font-semibold text-neutral-900">
              {currentModule.title ?? "Current module"}
            </p>
          </div>
        )}

        {/* STATUS */}

        <div className="mt-5 flex items-center justify-between gap-3">
          <Badge variant={courseCompleted ? "default" : "secondary"}>
            {courseCompleted ? "Completed" : "In Progress"}
          </Badge>

          <Button
            type="button"
            size="sm"
            onClick={handleContinueLearning}
            disabled={!course?.id}
          >
            <BookOpen className="mr-2 h-4 w-4" />

            {courseCompleted
              ? "Review Course"
              : currentModule
                ? "Continue"
                : "Start Course"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ==========================================================
// PAYMENT SECTION
// ==========================================================

function EnrollmentPaymentSection({ enrollmentDashboard }) {
  const enrollment = enrollmentDashboard?.enrollment ?? {};

  const paymentSummary = enrollmentDashboard?.paymentSummary ?? {};

  const paymentPlan =
    enrollmentDashboard?.paymentPlan ??
    enrollmentDashboard?.payment_plan ??
    null;

  const nextPayment =
    enrollmentDashboard?.nextPayment ??
    enrollmentDashboard?.next_payment ??
    null;

  const { totalPayable, amountPaid, balanceDue, paymentProgress } =
    getEnrollmentFinancials(enrollmentDashboard);

  const [submitting, setSubmitting] = useState(false);

  // --------------------------------------------------------
  // FULLY PAID
  // --------------------------------------------------------

  if (balanceDue <= 0) {
    return (
      <Card className="rounded-2xl border border-green-200 bg-green-50 shadow-sm">
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <div>
              <h3 className="font-semibold text-green-900">
                Enrollment Fully Paid
              </h3>

              <p className="mt-1 text-sm leading-6 text-green-800">
                There is no outstanding balance for this enrollment.
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // --------------------------------------------------------
  // BANK TRANSFER RECEIPT
  // --------------------------------------------------------

  async function handleUploadReceipt(payload) {
    if (!enrollment?.id) {
      throw new Error("This enrollment could not be identified.");
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `/api/academy/enrollments/${enrollment.id}/payments`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            ...payload,

            // The server must validate/recalculate this.
            amount: balanceDue,

            paymentMethod: "bank_transfer",

            paymentType: "outstanding",
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to submit payment receipt.");
      }

      window.location.reload();

      return result;
    } catch (error) {
      console.error("Academy enrollment payment error:", error);

      throw error;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="rounded-2xl border border-amber-200 bg-white shadow-sm">
      {/* PAYMENT HEADER */}

      <div className="border-b border-amber-100 bg-amber-50/50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <CreditCard className="h-5 w-5 text-amber-700" />
          </div>

          <div>
            <h3 className="font-semibold text-neutral-900">
              Outstanding Payment
            </h3>

            <p className="mt-1 text-sm text-neutral-500">
              Enrollment #{getEnrollmentNumber(enrollment)}
            </p>

            {paymentPlan?.name && (
              <p className="mt-1 text-xs text-neutral-500">
                Payment Plan: {paymentPlan.name}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* PAYMENT NUMBERS */}

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-neutral-50 p-4">
            <p className="text-xs text-neutral-500">Total Payable</p>

            <p className="mt-1 font-semibold text-neutral-900">
              {formatCurrency(totalPayable)}
            </p>
          </div>

          <div className="rounded-xl bg-neutral-50 p-4">
            <p className="text-xs text-neutral-500">Paid</p>

            <p className="mt-1 font-semibold text-green-700">
              {formatCurrency(amountPaid)}
            </p>
          </div>

          <div className="rounded-xl bg-amber-50 p-4">
            <p className="text-xs text-amber-700">Balance Due</p>

            <p className="mt-1 text-lg font-bold text-amber-900">
              {formatCurrency(balanceDue)}
            </p>
          </div>
        </div>

        {/* PAYMENT PROGRESS */}

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-neutral-500">Payment progress</span>

            <span className="font-semibold text-neutral-900">
              {Math.round(paymentProgress)}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-[#C6A667] transition-all"
              style={{
                width: `${paymentProgress}%`,
              }}
            />
          </div>
        </div>

        {/* NEXT PAYMENT */}

        {nextPayment && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium text-amber-700">
                  Next payment
                </p>

                <p className="mt-1 font-semibold text-amber-900">
                  {formatCurrency(
                    getNumber(
                      nextPayment.balance_due,
                      nextPayment.balanceDue,
                      nextPayment.amount_due,
                      nextPayment.amountDue,
                    ),
                  )}
                </p>
              </div>

              <p className="text-xs text-amber-700">
                Due {formatDate(nextPayment.due_date ?? nextPayment.dueDate)}
              </p>
            </div>
          </div>
        )}

        {/* ==================================================
            PAYMENT METHOD
        ================================================== */}

        <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 sm:p-5">
          <div className="mb-2">
            <h4 className="font-semibold text-neutral-900">Make a Payment</h4>

            <p className="mt-1 text-sm leading-6 text-neutral-500">
              Choose how you would like to pay the outstanding balance for this
              enrollment.
            </p>
          </div>

          {/* IMPORTANT:
              PaymentMethodSelector is intentionally rendered
              directly here whenever balanceDue > 0.
          */}

          <PaymentMethodSelector
            amount={balanceDue}
            entityType="academy_enrollment"
            entityId={enrollment.id}
            paymentType="outstanding"
            onUploadReceipt={handleUploadReceipt}
          />

          {submitting && (
            <div className="mt-4 rounded-xl border border-[#C6A667]/20 bg-[#C6A667]/5 p-3 text-center">
              <p className="text-sm font-medium text-neutral-700">
                Submitting your payment information...
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// ==========================================================
// ENROLLMENT CONTENT
// ==========================================================

function EnrollmentContent({ enrollmentDashboard }) {
  const enrollment = enrollmentDashboard?.enrollment ?? {};

  const courses = Array.isArray(enrollmentDashboard?.courses)
    ? enrollmentDashboard.courses
    : [];

  const summary = enrollmentDashboard?.summary ?? {};

  const financials = getEnrollmentFinancials(enrollmentDashboard);

  const totalCourses = getNumber(
    summary.totalCourses,
    summary.total_courses,
    courses.length,
  );

  const completedCourses = getNumber(
    summary.completedCourses,
    summary.completed_courses,
  );

  const overallProgress = getNumber(
    summary.overallProgress,
    summary.overall_progress,
  );

  return (
    <div className="border-t bg-neutral-50/60 p-4 sm:p-6">
      {/* ==================================================
          ENROLLMENT SUMMARY
      ================================================== */}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Layers3 className="h-4 w-4 text-[#C6A667]" />

            <p className="text-xs text-neutral-500">Courses</p>
          </div>

          <p className="mt-2 text-xl font-bold text-neutral-900">
            {totalCourses}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />

            <p className="text-xs text-neutral-500">Completed</p>
          </div>

          <p className="mt-2 text-xl font-bold text-neutral-900">
            {completedCourses}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#C6A667]" />

            <p className="text-xs text-neutral-500">Learning Progress</p>
          </div>

          <p className="mt-2 text-xl font-bold text-neutral-900">
            {Math.round(overallProgress)}%
          </p>
        </div>
      </div>

      {/* ==================================================
          COURSES
      ================================================== */}

      <div className="mt-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Courses</h3>

            <p className="text-sm text-neutral-500">
              Courses attached to this enrollment.
            </p>
          </div>

          <Badge variant="secondary">
            {courses.length} {courses.length === 1 ? "course" : "courses"}
          </Badge>
        </div>

        {courses.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {courses.map((courseItem) => (
              <EnrollmentCourseCard
                key={
                  courseItem?.enrollmentCourse?.id ??
                  courseItem?.enrollment_course?.id ??
                  `${enrollment?.id}-${courseItem?.course?.id}`
                }
                courseItem={courseItem}
              />
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl border border-dashed bg-white p-8 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-neutral-300" />

            <p className="mt-3 text-sm text-neutral-500">
              No courses are currently attached to this enrollment.
            </p>
          </Card>
        )}
      </div>

      {/* ==================================================
          FINANCIAL OVERVIEW
      ================================================== */}

      <div className="mt-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">
            Financial Overview
          </h3>

          <p className="text-sm text-neutral-500">
            Financial information for this enrollment only.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <EnrollmentOverviewCard
            enrollment={{
              ...enrollment,

              course: courses.length === 1 ? courses[0]?.course : null,
            }}
          />

          <PaymentSummaryCard
            summary={enrollmentDashboard?.paymentSummary ?? {}}
          />

          <NextPaymentCard
            payment={
              enrollmentDashboard?.nextPayment ??
              enrollmentDashboard?.next_payment ??
              null
            }
          />
        </div>
      </div>

      {/* ==================================================
          PAYMENT
      ================================================== */}

      {financials.balanceDue > 0 && (
        <div className="mt-6">
          <EnrollmentPaymentSection enrollmentDashboard={enrollmentDashboard} />
        </div>
      )}

      {/* ==================================================
          PAYMENT HISTORY / ACTIVITY
      ================================================== */}

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <RecentPaymentsCard
          payments={
            Array.isArray(enrollmentDashboard?.recentPayments)
              ? enrollmentDashboard.recentPayments
              : Array.isArray(enrollmentDashboard?.recent_payments)
                ? enrollmentDashboard.recent_payments
                : []
          }
        />

        <RecentActivityCard
          timeline={
            Array.isArray(enrollmentDashboard?.timeline)
              ? enrollmentDashboard.timeline
              : []
          }
        />
      </div>
    </div>
  );
}

// ==========================================================
// ENROLLMENT CARD
// ==========================================================

function EnrollmentSection({ enrollmentDashboard, isOpen, onToggle }) {
  const enrollment = enrollmentDashboard?.enrollment ?? {};

  const financials = getEnrollmentFinancials(enrollmentDashboard);

  const courses = Array.isArray(enrollmentDashboard?.courses)
    ? enrollmentDashboard.courses
    : [];

  const paymentPending = financials.balanceDue > 0;

  const status = enrollment?.status ?? "enrolled";

  const learningMode = getLearningMode(enrollment);

  return (
    <Card
      className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition ${
        paymentPending ? "border-amber-200" : "border-neutral-200"
      }`}
    >
      {/* ==================================================
          COLLAPSIBLE HEADER
      ================================================== */}

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full text-left"
      >
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            {/* IDENTITY */}

            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#C6A667]/10">
                <GraduationCap className="h-7 w-7 text-[#C6A667]" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                    Academy Enrollment
                  </p>

                  {paymentPending && (
                    <Badge className="border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100">
                      Payment Due
                    </Badge>
                  )}
                </div>

                <h3 className="mt-1 truncate text-xl font-bold text-neutral-900">
                  Enrollment #{getEnrollmentNumber(enrollment)}
                </h3>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge
                    variant={status === "enrolled" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {String(status).replace(/_/g, " ")}
                  </Badge>

                  {learningMode && (
                    <Badge variant="outline" className="capitalize">
                      {String(learningMode).replace(/_/g, " ")}
                    </Badge>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Enrolled {formatDate(getCreatedAt(enrollment))}
                  </span>

                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    {courses.length}{" "}
                    {courses.length === 1 ? "course" : "courses"}
                  </span>
                </div>
              </div>
            </div>

            {/* FINANCIAL SNAPSHOT */}

            <div className="flex items-center gap-3">
              <div
                className={`min-w-[170px] rounded-2xl border p-4 ${
                  paymentPending
                    ? "border-amber-200 bg-amber-50"
                    : "border-green-200 bg-green-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Wallet
                    className={`h-4 w-4 ${
                      paymentPending ? "text-amber-700" : "text-green-700"
                    }`}
                  />

                  <p
                    className={`text-xs ${
                      paymentPending ? "text-amber-700" : "text-green-700"
                    }`}
                  >
                    {paymentPending ? "Balance Due" : "Payment Status"}
                  </p>
                </div>

                <p
                  className={`mt-1 font-bold ${
                    paymentPending ? "text-amber-900" : "text-green-800"
                  }`}
                >
                  {paymentPending
                    ? formatCurrency(financials.balanceDue)
                    : "Fully Paid"}
                </p>
              </div>

              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
                  isOpen
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-500"
                }`}
              >
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* ==================================================
          EXPANDED CONTENT
      ================================================== */}

      {isOpen && (
        <EnrollmentContent enrollmentDashboard={enrollmentDashboard} />
      )}
    </Card>
  );
}

// ==========================================================
// MAIN COMPONENT
// ==========================================================

export default function AcademyDashboardClient({
  student,
  enrollments = [],
  summary = null,
  recentPayments = [],
  recentActivity = [],
}) {
  const router = useRouter();

  // --------------------------------------------------------
  // Determine which enrollments should initially be open.
  // Enrollments with outstanding balances are opened
  // automatically so payment is immediately visible.
  // --------------------------------------------------------

  const initialOpenEnrollmentIds = useMemo(() => {
    const ids = enrollments
      .filter((item) => {
        return getEnrollmentFinancials(item).balanceDue > 0;
      })
      .map((item) => item?.enrollment?.id)
      .filter(Boolean);

    // If no enrollment needs payment attention,
    // open the first enrollment.
    if (!ids.length && enrollments[0]?.enrollment?.id) {
      return [enrollments[0].enrollment.id];
    }

    return ids;
  }, [enrollments]);

  const [openEnrollmentIds, setOpenEnrollmentIds] = useState(
    initialOpenEnrollmentIds,
  );

  const [showGlobalActivity, setShowGlobalActivity] = useState(false);

  // --------------------------------------------------------
  // TOGGLE ENROLLMENT
  // --------------------------------------------------------

  const toggleEnrollment = (enrollmentId) => {
    if (!enrollmentId) return;

    setOpenEnrollmentIds((current) => {
      if (current.includes(enrollmentId)) {
        return current.filter((id) => id !== enrollmentId);
      }

      return [...current, enrollmentId];
    });
  };

  // --------------------------------------------------------
  // EXPLORE COURSES
  // --------------------------------------------------------

  const handleExploreCourses = () => {
    router.push("/academy");
  };

  // --------------------------------------------------------
  // GLOBAL SUMMARY
  // --------------------------------------------------------

  const totalEnrollments = getNumber(
    summary?.totalEnrollments,
    summary?.total_enrollments,
    enrollments.length,
  );

  const totalCourses = getNumber(
    summary?.totalCourses,
    summary?.total_courses,
    enrollments.reduce(
      (total, item) =>
        total + (Array.isArray(item?.courses) ? item.courses.length : 0),
      0,
    ),
  );

  const overallProgress = getNumber(
    summary?.overallProgress,
    summary?.overall_progress,
  );

  const outstandingBalance = getNumber(
    summary?.totalOutstandingBalance,
    summary?.total_outstanding_balance,

    // Fallback: calculate directly from each enrollment.
    enrollments.reduce(
      (total, item) => total + getEnrollmentFinancials(item).balanceDue,
      0,
    ),
  );

  // --------------------------------------------------------
  // RENDER
  // --------------------------------------------------------

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

          <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                Welcome back,
                <span className="text-[#C6A667]">
                  {" "}
                  {student?.first_name ?? ""}
                </span>
              </h1>

              <p className="mt-2 text-neutral-500">
                Student Number{" "}
                <span className="font-semibold text-neutral-900">
                  {student?.student_number ?? "—"}
                </span>
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleExploreCourses}
              className="shrink-0 border-[#C6A667]/30 text-neutral-900 hover:bg-[#C6A667]/10 hover:text-neutral-900"
            >
              <Plus className="mr-2 h-4 w-4 text-[#C6A667]" />
              Explore More Courses
            </Button>
          </div>
        </div>

        {/* ==================================================
            GLOBAL SUMMARY
        ================================================== */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Enrollments
            </p>

            <p className="mt-2 text-2xl font-bold text-neutral-900">
              {totalEnrollments}
            </p>

            <p className="mt-1 text-xs text-neutral-500">
              Active academy enrollments
            </p>
          </Card>

          <Card className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Courses
            </p>

            <p className="mt-2 text-2xl font-bold text-neutral-900">
              {totalCourses}
            </p>

            <p className="mt-1 text-xs text-neutral-500">
              Across all enrollments
            </p>
          </Card>

          <Card className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Learning Progress
            </p>

            <p className="mt-2 text-2xl font-bold text-neutral-900">
              {Math.round(overallProgress)}%
            </p>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-[#C6A667]"
                style={{
                  width: `${Math.min(Math.max(overallProgress, 0), 100)}%`,
                }}
              />
            </div>
          </Card>

          <Card
            className={`rounded-2xl border p-5 shadow-sm ${
              outstandingBalance > 0
                ? "border-amber-200 bg-amber-50"
                : "bg-white"
            }`}
          >
            <p
              className={`text-xs font-medium uppercase tracking-wide ${
                outstandingBalance > 0 ? "text-amber-700" : "text-neutral-400"
              }`}
            >
              Outstanding Balance
            </p>

            <p
              className={`mt-2 text-2xl font-bold ${
                outstandingBalance > 0 ? "text-amber-900" : "text-green-700"
              }`}
            >
              {formatCurrency(outstandingBalance)}
            </p>

            <p
              className={`mt-1 text-xs ${
                outstandingBalance > 0 ? "text-amber-700" : "text-neutral-500"
              }`}
            >
              Across all enrollments
            </p>
          </Card>
        </div>

        {/* ==================================================
            PAYMENT NOTICE
        ================================================== */}

        {outstandingBalance > 0 && (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white">
                !
              </div>

              <div>
                <h2 className="font-semibold text-amber-900">
                  Outstanding payment required
                </h2>

                <p className="mt-1 text-sm leading-6 text-amber-800">
                  One or more of your academy enrollments has an outstanding
                  balance. Open the relevant enrollment below to choose your
                  payment method.
                </p>

                <p className="mt-1 text-xs leading-5 text-amber-700">
                  Payments are recorded against the specific enrollment they
                  belong to.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            NO ENROLLMENTS
        ================================================== */}

        {!enrollments.length && (
          <Card className="rounded-3xl border bg-white p-10 text-center shadow-sm">
            <GraduationCap className="mx-auto h-12 w-12 text-neutral-300" />

            <h2 className="mt-4 text-xl font-semibold text-neutral-900">
              No active enrollments
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              You do not currently have an active academy enrollment. Explore
              our available courses to start a new enrollment.
            </p>

            <Button
              type="button"
              onClick={handleExploreCourses}
              className="mt-6"
            >
              <Plus className="mr-2 h-4 w-4" />
              Browse Academy Courses
            </Button>
          </Card>
        )}

        {/* ==================================================
            MY ENROLLMENTS
        ================================================== */}

        {enrollments.length > 0 && (
          <div>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                  My Enrollments
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Each enrollment contains its own courses, progress, payments,
                  and activity.
                </p>
              </div>

              <Badge variant="secondary">
                {enrollments.length}{" "}
                {enrollments.length === 1 ? "enrollment" : "enrollments"}
              </Badge>
            </div>

            <div className="space-y-5">
              {enrollments.map((enrollmentDashboard, index) => {
                const enrollmentId = enrollmentDashboard?.enrollment?.id;

                if (!enrollmentId) {
                  return null;
                }

                return (
                  <EnrollmentSection
                    key={enrollmentId}
                    enrollmentDashboard={enrollmentDashboard}
                    isOpen={openEnrollmentIds.includes(enrollmentId)}
                    onToggle={() => toggleEnrollment(enrollmentId)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================
            ADD ANOTHER COURSE
        ================================================== */}

        <Card className="mt-8 overflow-hidden rounded-3xl border bg-white shadow-sm">
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#C6A667]/10">
                <Plus className="h-6 w-6 text-[#C6A667]" />
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900">
                  Want to learn something new?
                </h3>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-500">
                  You can register for additional academy courses without
                  creating another student account.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleExploreCourses}
              className="shrink-0 border-[#C6A667]/30 hover:bg-[#C6A667]/10"
            >
              <Plus className="mr-2 h-4 w-4" />
              Browse Courses
            </Button>
          </div>
        </Card>

        {/* ==================================================
            GLOBAL RECENT ACTIVITY
        ================================================== */}

        {(recentPayments.length > 0 || recentActivity.length > 0) && (
          <Card className="mt-8 rounded-3xl border bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setShowGlobalActivity((value) => !value)}
              className="flex w-full items-center justify-between p-5 text-left sm:p-6"
            >
              <div>
                <h2 className="font-semibold text-neutral-900">
                  All Recent Activity
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Recent activity across all your academy enrollments.
                </p>
              </div>

              <ChevronDown
                className={`h-5 w-5 text-neutral-400 transition ${
                  showGlobalActivity ? "rotate-180" : ""
                }`}
              />
            </button>

            {showGlobalActivity && (
              <div className="border-t p-5 sm:p-6">
                {/* GLOBAL PAYMENTS */}

                {recentPayments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900">
                      Recent Payments
                    </h3>

                    <div className="mt-3 divide-y rounded-xl border">
                      {recentPayments.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="text-sm font-semibold text-neutral-900">
                              {formatCurrency(payment.amount)}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              {formatDate(
                                payment.payment_date ??
                                  payment.paymentDate ??
                                  payment.created_at ??
                                  payment.createdAt,
                              )}
                            </p>
                          </div>

                          <Badge
                            variant="secondary"
                            className="w-fit capitalize"
                          >
                            {String(payment.status ?? "payment").replace(
                              /_/g,
                              " ",
                            )}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* GLOBAL ACTIVITY */}

                {recentActivity.length > 0 && (
                  <div className={recentPayments.length > 0 ? "mt-6" : ""}>
                    <h3 className="text-sm font-semibold text-neutral-900">
                      Enrollment Activity
                    </h3>

                    <div className="mt-3 divide-y rounded-xl border">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="p-4">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm font-medium capitalize text-neutral-900">
                              {String(activity.action ?? "activity").replace(
                                /_/g,
                                " ",
                              )}
                            </p>

                            <p className="text-xs text-neutral-400">
                              {formatDate(
                                activity.created_at ?? activity.createdAt,
                              )}
                            </p>
                          </div>

                          {activity.description && (
                            <p className="mt-1 text-sm leading-6 text-neutral-500">
                              {activity.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

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
