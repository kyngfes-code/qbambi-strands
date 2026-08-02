"use client";

import { Loader2 } from "lucide-react";

import useCoursePaymentPlans from "@/hooks/useCoursePaymentPlans";

import CoursePlansCard from "@/components/academy/course-payment-plans/CoursePlansCard";
import AssignPaymentPlansModal from "@/components/academy/course-payment-plans/AssignPaymentPlansModal";
import BackButton from "../BackButton";

export default function CoursePaymentPlansPage() {
  const {
    courses,

    loading,
    saving,

    selectedCourse,

    availablePlans,
    assignedPlans,

    assignModalOpen,

    openAssignModal,
    closeModal,

    saveAssignments,
  } = useCoursePaymentPlans();

  return (
    <div className="space-y-8">
      {/* Header */}
      <BackButton />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Course Payment Plans
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-7 text-neutral-500">
            Assign one or more payment plans to each academy course. Students
            enrolling for a course will only see the payment plans assigned to
            that course.
          </p>
        </div>

        <div className="rounded-2xl border bg-white px-5 py-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Courses
          </p>

          <p className="mt-1 text-3xl font-bold text-[#C6A667]">
            {courses.length}
          </p>
        </div>
      </div>

      {/* Loading */}

      {loading ? (
        <div className="flex h-72 items-center justify-center rounded-3xl border bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-[#C6A667]" />
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-3xl border border-dashed bg-white p-20 text-center">
          <h2 className="text-xl font-semibold">No academy courses found</h2>

          <p className="mt-3 text-neutral-500">
            Create academy courses before assigning payment plans.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {courses.map((course) => (
            <CoursePlansCard
              key={course.id}
              course={course}
              onAssign={() => openAssignModal(course)}
            />
          ))}
        </div>
      )}

      {/* Assign Modal */}

      <AssignPaymentPlansModal
        open={assignModalOpen}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
        loading={saving}
        course={selectedCourse}
        availablePlans={availablePlans}
        assignedPlans={assignedPlans}
        onSave={saveAssignments}
      />
    </div>
  );
}
