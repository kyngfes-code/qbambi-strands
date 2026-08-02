"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useAcademyPaymentPlans from "@/hooks/useAcademyPaymentPlans";
import PaymentPlansTable from "@/components/academy/payment-plans/PaymentPlansTable";
import PaymentPlanModal from "@/components/academy/payment-plans/PaymentPlanModal";
import DeletePaymentPlanDialog from "@/components/academy/payment-plans/DeletePaymentPlanDialog";
import BackButton from "../BackButton";

export default function AcademyPaymentPlansPage() {
  const {
    paymentPlans,
    loading,
    saving,

    selectedPlan,
    setSelectedPlan,

    savePaymentPlan,
    deletePaymentPlan,
  } = useAcademyPaymentPlans();

  const [modalOpen, setModalOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  //---------------------------------------
  // Create
  //---------------------------------------

  function handleCreate() {
    setSelectedPlan(null);

    setModalOpen(true);
  }

  //---------------------------------------
  // Edit
  //---------------------------------------

  function handleEdit(plan) {
    setSelectedPlan(plan);

    setModalOpen(true);
  }

  //---------------------------------------
  // Delete
  //---------------------------------------

  function handleDelete(plan) {
    setSelectedPlan(plan);

    setDeleteOpen(true);
  }

  //---------------------------------------
  // Save
  //---------------------------------------

  async function handleSave(values) {
    const payload = {
      ...values,
    };

    if (selectedPlan) {
      payload.id = selectedPlan.id;
    }

    const result = await savePaymentPlan(payload);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(
      selectedPlan
        ? "Payment plan updated successfully."
        : "Payment plan created successfully.",
    );

    setSelectedPlan(null);
    setModalOpen(false);
  }

  //---------------------------------------
  // Confirm Delete
  //---------------------------------------

  async function confirmDelete() {
    if (!selectedPlan) return;

    const result = await deletePaymentPlan(selectedPlan.id);

    if (result.success) {
      setDeleteOpen(false);
    } else {
      alert(result.error);
    }
  }

  //---------------------------------------

  const totalPlans = paymentPlans.length;

  const activePlans = paymentPlans.filter((plan) => plan.is_active).length;

  const inactivePlans = totalPlans - activePlans;

  //---------------------------------------

  return (
    <div className="space-y-8">
      {/* Header */}
      <BackButton />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Academy Payment Plans</h1>

          <p className="mt-2 text-neutral-500">
            Configure installment plans available for academy courses.
          </p>
        </div>

        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Payment Plan
        </Button>
      </div>

      {/* Stats */}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6">
          <p className="text-sm text-neutral-500">Total Plans</p>

          <h2 className="mt-3 text-3xl font-bold">{totalPlans}</h2>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <p className="text-sm text-neutral-500">Active</p>

          <h2 className="mt-3 text-3xl font-bold text-green-600">
            {activePlans}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <p className="text-sm text-neutral-500">Inactive</p>

          <h2 className="mt-3 text-3xl font-bold text-neutral-500">
            {inactivePlans}
          </h2>
        </div>
      </div>

      {/* Table */}

      {loading ? (
        <div className="rounded-2xl border bg-white p-12 text-center text-neutral-500">
          Loading payment plans...
        </div>
      ) : (
        <PaymentPlansTable
          rows={paymentPlans}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modal */}

      <PaymentPlanModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        paymentPlan={selectedPlan}
        loading={saving}
        onSubmit={handleSave}
      />

      {/* Delete */}

      <DeletePaymentPlanDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        plan={selectedPlan}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
