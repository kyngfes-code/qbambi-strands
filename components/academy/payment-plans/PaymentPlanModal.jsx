"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PaymentPlanModal({
  open,
  onOpenChange,
  onSubmit,
  paymentPlan = null,
  loading = false,
}) {
  const isEditing = Boolean(paymentPlan);

  const defaultValues = {
    name: "",
    description: "",
    number_of_payments: 1,
    initial_payment_percentage: 100,
    extra_percentage: 0,
    payment_interval_months: 1,
    sort_order: 0,
    is_active: true,
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  useEffect(() => {
    if (!open) {
      reset(defaultValues);
      return;
    }

    if (paymentPlan) {
      reset({
        ...defaultValues,
        ...paymentPlan,
      });
    } else {
      reset(defaultValues);
    }
  }, [open, paymentPlan, reset]);

  async function submit(values) {
    await onSubmit(values);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          reset(defaultValues);
        }

        onOpenChange(value);
      }}
    >
      <DialogContent
        className="
          w-[95vw]
          max-w-[95vw]
          sm:max-w-2xl
          lg:max-w-4xl
          p-0
          overflow-hidden
        "
      >
        {/* Header */}

        <DialogHeader className="border-b px-5 py-5 sm:px-6">
          <DialogTitle className="text-xl">
            {isEditing ? "Edit Payment Plan" : "Create Payment Plan"}
          </DialogTitle>

          <DialogDescription>
            Configure how students will pay for a course.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(submit)}
          className="flex max-h-[85vh] flex-col"
        >
          {/* Scrollable Body */}

          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6">
            <div className="space-y-6">
              {/* Plan Name */}

              <div className="space-y-2">
                <Label>Plan Name *</Label>

                <Input
                  placeholder="Monthly Installment Plan"
                  {...register("name", {
                    required: "Plan name is required",
                  })}
                />

                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}

              <div className="space-y-2">
                <Label>Description</Label>

                <textarea
                  rows={4}
                  placeholder="Optional description..."
                  {...register("description")}
                  className="
                    min-h-[120px]
                    w-full
                    rounded-xl
                    border
                    border-neutral-300
                    bg-background
                    p-3
                    text-sm
                    outline-none
                    transition
                    focus:border-[#C6A667]
                  "
                />
              </div>

              {/* Fields */}

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Number of Payments *</Label>

                  <Input
                    type="number"
                    min={1}
                    {...register("number_of_payments", {
                      valueAsNumber: true,
                      min: 1,
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Deposit Percentage *</Label>

                  <Input
                    type="number"
                    min={0}
                    max={100}
                    {...register("initial_payment_percentage", {
                      valueAsNumber: true,
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Interest Percentage</Label>

                  <Input
                    type="number"
                    min={0}
                    {...register("extra_percentage", {
                      valueAsNumber: true,
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Interval (Months)</Label>

                  <Input
                    type="number"
                    min={1}
                    {...register("payment_interval_months", {
                      valueAsNumber: true,
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Display Order</Label>

                  <Input
                    type="number"
                    {...register("sort_order", {
                      valueAsNumber: true,
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>

                  <select
                    {...register("is_active")}
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-neutral-300
                      bg-background
                      px-3
                      text-sm
                    "
                  >
                    <option value={true}>Active</option>

                    <option value={false}>Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Footer */}

          <div className="border-t bg-background px-5 py-4 sm:px-6">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  reset(defaultValues);
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading
                  ? "Saving..."
                  : isEditing
                    ? "Update Plan"
                    : "Create Plan"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
