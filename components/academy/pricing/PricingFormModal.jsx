"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { BookOpen, GraduationCap, Wallet, Clock3 } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";

export default function PricingFormModal({
  open,
  onOpenChange,
  course,
  initialData,
  loading,
  onSubmit,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      reset({
        learning_mode: initialData.learning_mode,
        duration_months: initialData.duration_months,
        price: initialData.price,
        currency: initialData.currency,
        sort_order: initialData.sort_order ?? 0,
        active: initialData.active,
      });
    } else {
      reset({
        learning_mode: "",
        duration_months: 1,
        price: "",
        currency: "NGN",
        sort_order: 0,
        active: true,
      });
    }
  }, [initialData, open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[100vw] max-w-none sm:w-[95vw] sm:max-w-3xl h-[100dvh] sm:h-auto sm:max-h-[92vh] rounded-none sm:rounded-3xl p-0 overflow-hidden flex flex-col">
        {/* Header */}

        <div className="shrink-0 bg-gradient-to-r from-amber-600 via-yellow-500 to-orange-500 text-white">
          <DialogHeader className="px-6 py-6">
            <DialogTitle className="text-2xl">
              {initialData ? "Edit Pricing" : "Assign Pricing"}
            </DialogTitle>

            <DialogDescription className="text-amber-50">
              Configure tuition pricing for this academy course.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6 space-y-6">
            {/* Selected Course */}

            <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="rounded-xl bg-amber-500 p-3 text-white">
                  <BookOpen className="h-6 w-6" />
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-lg">{course?.title}</p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      <GraduationCap className="mr-1 h-3 w-3" />
                      {course?.level}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Mode */}

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Learning Mode</Label>

                <select
                  {...register("learning_mode", {
                    required: true,
                  })}
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    px-4
                  "
                >
                  <option value="">Select Mode</option>

                  <option value="physical">Physical</option>

                  <option value="online">Online</option>

                  <option value="hybrid">Hybrid</option>
                </select>

                {errors.learning_mode && (
                  <p className="text-red-500 text-sm">
                    Select a learning mode.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration_months">
                  Duration <span className="text-red-500">*</span>
                </Label>

                <div className="flex">
                  <Input
                    type="number"
                    min={1}
                    className="rounded-r-none"
                    {...register("duration_months", {
                      valueAsNumber: true,
                    })}
                  />

                  <div className="flex items-center rounded-r-xl border border-l-0 bg-muted px-4 text-sm font-medium text-muted-foreground">
                    Month(s)
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the total course duration in months.
                </p>

                {errors.duration_months && (
                  <p className="text-sm text-red-500">
                    {errors.duration_months.message}
                  </p>
                )}
              </div>
            </div>

            {/* Price */}

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Course Price</Label>

                <div className="relative">
                  <Wallet className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />

                  <Input
                    type="number"
                    className="pl-10"
                    {...register("price", {
                      required: true,
                      valueAsNumber: true,
                    })}
                  />
                </div>

                {errors.price && (
                  <p className="text-red-500 text-sm">Price is required.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>

                <Input {...register("currency")} />
              </div>
            </div>

            {/* Bottom */}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="space-y-2">
                <Label>Sort Order</Label>

                <Input
                  type="number"
                  {...register("sort_order", {
                    valueAsNumber: true,
                  })}
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
                  <input type="checkbox" {...register("active")} />

                  <span className="font-medium text-green-700">
                    Pricing Active
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}

          <div className="shrink-0 border-t bg-neutral-50 px-5 py-4 sm:px-6">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                type="button"
                className="w-full sm:w-auto"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600"
              >
                {loading
                  ? "Saving..."
                  : initialData
                    ? "Update Pricing"
                    : "Assign Pricing"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
