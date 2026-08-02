"use client";

import DeleteEnrollmentDialog from "@/components/academy/enrollments/DeleteEnrollmentDialog";
import EmptyState from "@/components/academy/enrollments/EmptyState";
import EnrollmentFilters from "@/components/academy/enrollments/EnrollmentFilters";
import EnrollmentPagination from "@/components/academy/enrollments/EnrollmentPagination";
import EnrollmentSearch from "@/components/academy/enrollments/EnrollmentSearch";
import EnrollmentTable from "@/components/academy/enrollments/EnrollmentTable";
import useAdminAcademyEnrollments from "@/hooks/useAdminAcademyEnrollments";
import { useMemo } from "react";
import BackButton from "../BackButton";

export default function AcademyEnrollmentsPage() {
  const {
    enrollments,
    pagination,
    loading,
    deleting,

    search,
    setSearch,

    filters,
    updateFilter,

    selectedEnrollment,

    deleteDialogOpen,
    setDeleteDialogOpen,

    openDeleteDialog,

    deleteEnrollment,

    refreshEnrollments,

    goToPage,
  } = useAdminAcademyEnrollments();

  //------------------------------------------------

  const hasRecords = useMemo(() => enrollments.length > 0, [enrollments]);

  //------------------------------------------------

  async function handleDelete() {
    if (!selectedEnrollment) return;

    DeleteEnrollmentDialog(selectedEnrollment.id);

    refreshEnrollments();
  }

  //------------------------------------------------

  return (
    <div className="space-y-8">
      <BackButton />
      <div>
        <h1 className="text-3xl font-bold">Academy Enrollments</h1>

        <p className="mt-2 text-neutral-500">
          View, manage and monitor academy student enrollments.
        </p>
      </div>

      <EnrollmentSearch value={search} onChange={setSearch} />

      <EnrollmentFilters filters={filters} onChange={updateFilter} />

      {!loading && !hasRecords ? (
        <EmptyState />
      ) : (
        <>
          <EnrollmentTable
            loading={loading}
            enrollments={enrollments}
            onDelete={openDeleteDialog}
          />

          <EnrollmentPagination
            pagination={pagination}
            onPageChange={goToPage}
          />
        </>
      )}

      <DeleteEnrollmentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        enrollment={selectedEnrollment}
        loading={deleting}
        onDelete={handleDelete}
      />
    </div>
  );
}
