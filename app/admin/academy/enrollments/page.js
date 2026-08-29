"use client";

import DeleteEnrollmentDialog from "@/components/academy/enrollments/DeleteEnrollmentDialog";
import EmptyState from "@/components/academy/enrollments/EmptyState";
import EnrollmentFilters from "@/components/academy/enrollments/EnrollmentFilters";
import EnrollmentPagination from "@/components/academy/enrollments/EnrollmentPagination";
import EnrollmentSearch from "@/components/academy/enrollments/EnrollmentSearch";
import EnrollmentTable from "@/components/academy/enrollments/EnrollmentTable";
import useAdminAcademyEnrollments from "@/hooks/useAdminAcademyEnrollments";
import { useMemo, useState } from "react";
import BackButton from "../BackButton";
import RejectEnrollmentDialog from "@/components/academy/enrollments/RejectEnrollmentDialog";

export default function AcademyEnrollmentsPage() {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRejectEnrollment, setSelectedRejectEnrollment] =
    useState(null);

  const {
    enrollments,
    pagination,
    loading,
    saving,
    deleting,

    // Search
    search,
    setSearch,

    // Filters
    filters,
    updateFilter,
    resetFilters,

    // Selection
    selectedEnrollment,

    // Delete dialog
    deleteDialogOpen,
    setDeleteDialogOpen,
    openDeleteDialog,

    // Actions
    approveEnrollment,
    rejectEnrollment,
    deleteEnrollment,

    // Pagination
    goToPage,
  } = useAdminAcademyEnrollments();

  //------------------------------------------------
  // Records
  //------------------------------------------------

  const hasRecords = useMemo(() => enrollments.length > 0, [enrollments]);

  //------------------------------------------------
  // Approve
  //------------------------------------------------

  async function handleApprove(enrollment) {
    if (!enrollment?.id) {
      return;
    }

    await approveEnrollment(enrollment.id);
  }

  //------------------------------------------------
  // Reject
  //------------------------------------------------
  function openRejectDialog(enrollment) {
    if (!enrollment?.id) {
      return;
    }

    setSelectedRejectEnrollment(enrollment);
    setRejectDialogOpen(true);
  }

  async function handleReject(rejectionReason, adminNote) {
    if (!selectedRejectEnrollment?.id) {
      return;
    }

    const success = await rejectEnrollment(
      selectedRejectEnrollment.id,
      rejectionReason,
      adminNote,
    );

    if (success) {
      setRejectDialogOpen(false);
      setSelectedRejectEnrollment(null);
    }
  }

  //------------------------------------------------
  // Delete
  //------------------------------------------------

  async function handleDelete() {
    if (!selectedEnrollment?.id) {
      return;
    }

    await deleteEnrollment(selectedEnrollment.id);
  }

  //------------------------------------------------
  // Render
  //------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}

      <div>
        <BackButton />

        <h1 className="mt-4 text-2xl font-semibold text-neutral-900">
          Academy Enrollments
        </h1>

        <p className="mt-2 text-neutral-500">
          View, manage and monitor academy student enrollments.
        </p>
      </div>

      {/* Search */}

      <EnrollmentSearch value={search} onChange={setSearch} />

      {/* Filters */}

      <EnrollmentFilters
        filters={filters}
        onChange={updateFilter}
        onReset={resetFilters}
      />

      {/* Content */}

      {!loading && !hasRecords ? (
        <EmptyState />
      ) : (
        <>
          <EnrollmentTable
            loading={loading}
            enrollments={enrollments}
            saving={saving}
            onApprove={handleApprove}
            onReject={openRejectDialog}
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

      <RejectEnrollmentDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        enrollment={selectedRejectEnrollment}
        loading={saving}
        onReject={handleReject}
      />
    </div>
  );
}
