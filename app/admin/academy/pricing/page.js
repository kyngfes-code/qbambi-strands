"use client";

import { useMemo } from "react";
import { GraduationCap, DollarSign, AlertCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import useAdminAcademyCoursePricing from "@/hooks/useAdminAcademyCoursePricing";
import PricingSearch from "@/components/academy/pricing/PricingSearch";
import PricingFormModal from "@/components/academy/pricing/PricingFormModal";
import DeletePricingDialog from "@/components/academy/pricing/DeletePricingDialog";
import CoursePricingTable from "@/components/academy/pricing/CoursePricingTable";
import BackButton from "../BackButton";

export default function AcademyPricingPage() {
  const {
    //-----------------------------------------
    // Data
    //-----------------------------------------

    courseRows,
    filteredCourses,
    pricing,

    //-----------------------------------------
    // Loading
    //-----------------------------------------

    loading,
    saving,
    deleting,

    //-----------------------------------------
    // Filters
    //-----------------------------------------

    search,
    setSearch,

    status,
    setStatus,

    learningMode,
    setLearningMode,

    //-----------------------------------------
    // Dialog
    //-----------------------------------------

    selectedPricing,
    selectedCourse,

    pricingModalOpen,
    deleteDialogOpen,

    setPricingModalOpen,
    setDeleteDialogOpen,

    //-----------------------------------------
    // Actions
    //-----------------------------------------

    openCreateModal,
    openEditModal,
    openDeleteDialog,

    createPricing,
    updatePricing,
    deletePricing,
    togglePricingStatus,
  } = useAdminAcademyCoursePricing();

  //////////////////////////////////////////////////////

  //////////////////////////////////////////////////////

  const totalCourses = filteredCourses.length;

  const totalPricing = filteredCourses.reduce(
    (total, course) => total + course.pricing.length,
    0,
  );

  const coursesWithoutPricing = filteredCourses.filter(
    (course) => course.pricing.length === 0,
  ).length;

  //////////////////////////////////////////////////////

  async function handleSave(values) {
    if (selectedPricing) {
      await updatePricing(selectedPricing.id, values);
    } else {
      await createPricing({
        ...values,
        course_id: selectedCourse.id,
      });
    }
  }

  //////////////////////////////////////////////////////

  async function handleDelete() {
    if (!selectedPricing) return;

    await deletePricing(selectedPricing.id);
  }

  //////////////////////////////////////////////////////

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <BackButton />

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
          Course Pricing
        </h1>

        <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
          Configure tuition fees for every academy course, learning mode and
          duration. Courses without pricing will appear so pricing can be
          assigned.
        </p>
      </div>

      {/* Summary */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-2xl bg-blue-100 p-3">
              <GraduationCap className="h-6 w-6 text-blue-700" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Courses</p>

              <p className="text-2xl font-bold">{totalCourses}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-2xl bg-emerald-100 p-3">
              <DollarSign className="h-6 w-6 text-emerald-700" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Pricing Records</p>

              <p className="text-2xl font-bold">{totalPricing}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-2xl bg-amber-100 p-3">
              <AlertCircle className="h-6 w-6 text-amber-700" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Unpriced Courses</p>

              <p className="text-2xl font-bold">{coursesWithoutPricing}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}

      <Card>
        <CardContent className="p-4 sm:p-5">
          <PricingSearch
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
            learningMode={learningMode}
            onLearningModeChange={setLearningMode}
          />
        </CardContent>
      </Card>

      {/* Table */}

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <CoursePricingTable
            loading={loading}
            courses={filteredCourses}
            learningMode={learningMode}
            status={status}
            onAssignPricing={openCreateModal}
            onEditPricing={openEditModal}
            onDeletePricing={openDeleteDialog}
            onToggleStatus={togglePricingStatus}
          />
        </CardContent>
      </Card>

      {/* Pricing Modal */}

      <PricingFormModal
        open={pricingModalOpen}
        onOpenChange={setPricingModalOpen}
        course={selectedCourse}
        initialData={selectedPricing}
        loading={saving}
        onSubmit={handleSave}
      />

      {/* Delete Modal */}

      <DeletePricingDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        pricing={selectedPricing}
        loading={deleting}
        onDelete={handleDelete}
      />
    </div>
  );
}
