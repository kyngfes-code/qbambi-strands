"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import BackButton from "../BackButton";

import CourseSearch from "@/components/academy/courses/CourseSearch";

import useAcademyCourses from "@/hooks/useAcademyCourses";
import CourseFormDialog from "@/components/academy/courses/CourseFormDialog";
import AcademyCoursesTable from "@/components/academy/courses/AcademyCoursesTable";

export default function AcademyCoursesPage() {
  const {
    filteredCourses,

    loading,
    saving,

    search,
    setSearch,

    status,
    setStatus,

    selectedCourse,

    courseModalOpen,
    setCourseModalOpen,

    openCreateModal,
    openEditModal,

    createCourse,
    updateCourse,

    toggleCourseStatus,
    updateSortOrder,

    fetchCourses,
  } = useAcademyCourses();

  ////////////////////////////////////////////////////////////
  // MANAGE COURSE
  ////////////////////////////////////////////////////////////

  function handleManageCourse(course) {
    if (!course?.id) {
      toast.error("Course ID is missing.");
      return;
    }

    window.location.href = `/admin/academy/courses/${course.id}`;
  }

  ////////////////////////////////////////////////////////////
  // SAVE COURSE
  ////////////////////////////////////////////////////////////

  async function handleSubmit(values) {
    let success = false;

    try {
      if (selectedCourse?.id) {
        success = await updateCourse(selectedCourse.id, values);
      } else {
        success = await createCourse(values);
      }

      if (!success) {
        return;
      }

      setCourseModalOpen(false);

      await fetchCourses();
    } catch (error) {
      console.error("Academy course save error:", error);

      toast.error(error?.message || "Unable to save academy course.");
    }
  }

  ////////////////////////////////////////////////////////////
  // CREATE
  ////////////////////////////////////////////////////////////

  function handleCreateCourse() {
    openCreateModal();
  }

  ////////////////////////////////////////////////////////////
  // EDIT
  ////////////////////////////////////////////////////////////

  function handleEditCourse(course) {
    if (!course?.id) {
      toast.error("Course ID is missing.");
      return;
    }

    openEditModal(course);
  }

  ////////////////////////////////////////////////////////////
  // STATUS
  ////////////////////////////////////////////////////////////

  async function handleToggleStatus(course) {
    if (!course?.id) {
      toast.error("Course ID is missing.");
      return;
    }

    await toggleCourseStatus(course);

    await fetchCourses();
  }

  ////////////////////////////////////////////////////////////
  // SORT ORDER
  ////////////////////////////////////////////////////////////

  async function handleSortOrderChange(course, value) {
    if (!course?.id) {
      toast.error("Course ID is missing.");
      return;
    }

    const normalizedValue = Number(value);

    if (!Number.isInteger(normalizedValue) || normalizedValue < 0) {
      toast.error("Sort order must be a non-negative whole number.");

      return;
    }

    await updateSortOrder(course, normalizedValue);

    await fetchCourses();
  }

  ////////////////////////////////////////////////////////////
  // PAGE
  ////////////////////////////////////////////////////////////

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-5 sm:px-6 lg:space-y-8 lg:px-8">
      {/* Back */}
      <BackButton />

      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Academy Courses
          </h1>

          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Create and manage academy courses, publish or archive courses,
            control their order, and manage course modules, videos, and
            materials.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleCreateCourse}
          disabled={saving}
          className="w-full sm:w-auto lg:min-w-[180px]"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Course
        </Button>
      </div>

      {/* Filters */}
      <section className="rounded-xl border bg-background p-4 shadow-sm">
        <CourseSearch
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
        />
      </section>

      {/* Courses */}
      <section className="overflow-hidden rounded-xl border bg-background shadow-sm">
        <AcademyCoursesTable
          courses={filteredCourses}
          loading={loading}
          onEdit={handleEditCourse}
          onToggleStatus={handleToggleStatus}
          onSortOrderChange={handleSortOrderChange}
          onManageCourse={handleManageCourse}
        />
      </section>

      {/* Create / Edit Course */}
      <CourseFormDialog
        open={courseModalOpen}
        onOpenChange={setCourseModalOpen}
        initialData={selectedCourse}
        loading={saving}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
