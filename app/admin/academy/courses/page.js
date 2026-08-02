"use client";

import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import CourseSearch from "@/components/academy/courses/CourseSearch";
import CourseTable from "@/components/academy/courses/CourseTable";
import CourseFormModal from "@/components/academy/courses/CourseFormModal";
import DeleteCourseDialog from "@/components/academy/courses/DeleteCourseDialog";

import useAcademyCourses from "@/hooks/useAcademyCourses";
import BackButton from "../BackButton";

export default function AcademyCoursesPage() {
  const {
    filteredCourses,
    selectedCourse,

    loading,
    saving,
    deleting,

    search,
    setSearch,

    status,
    setStatus,

    courseModalOpen,
    deleteDialogOpen,

    setCourseModalOpen,
    setDeleteDialogOpen,

    openCreateModal,
    openEditModal,
    openDeleteDialog,

    createCourse,
    updateCourse,
    deleteCourse,
    fetchCourses,

    toggleCourseStatus,
    updateSortOrder,
  } = useAcademyCourses();

  //////////////////////////////////////////////////////
  // Save
  //////////////////////////////////////////////////////

  async function handleSave(values) {
    let success = false;

    if (selectedCourse) {
      success = await updateCourse(selectedCourse.id, values);

      if (success) {
        toast.success("Course updated successfully.");
      }
    } else {
      success = await createCourse(values);

      if (success) {
        toast.success("Course created successfully.");
      }
    }

    if (!success) return;

    setCourseModalOpen(false);

    await fetchCourses();
  }

  //////////////////////////////////////////////////////
  // Delete
  //////////////////////////////////////////////////////

  async function handleDelete() {
    if (!selectedCourse) return;

    const success = await deleteCourse(selectedCourse.id);

    if (!success) return;

    toast.success("Course deleted successfully.");

    setDeleteDialogOpen(false);

    await fetchCourses();
  }

  //////////////////////////////////////////////////////

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-4 sm:px-6 lg:px-8 lg:space-y-8">
      {/* Header */}
      <BackButton />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Academy Courses
          </h1>

          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Create, update, organize and manage all academy courses.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="w-full sm:w-auto lg:min-w-[180px]"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Course
        </Button>
      </div>

      {/* Search */}

      <div className="rounded-xl border bg-background p-4 shadow-sm">
        <CourseSearch
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
        />
      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
        <div className="overflow-x-auto">
          <CourseTable
            loading={loading}
            courses={filteredCourses}
            onEdit={openEditModal}
            onDelete={openDeleteDialog}
            onToggleStatus={toggleCourseStatus}
            onSortOrderChange={updateSortOrder}
          />
        </div>
      </div>

      {/* Create / Edit */}

      <CourseFormModal
        open={courseModalOpen}
        onOpenChange={setCourseModalOpen}
        initialData={selectedCourse}
        loading={saving}
        onSubmit={handleSave}
      />

      {/* Delete */}

      <DeleteCourseDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        course={selectedCourse}
        loading={deleting}
        onDelete={handleDelete}
      />
    </div>
  );
}
