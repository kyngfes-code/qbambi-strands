"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export default function AssignPaymentPlansModal({
  open,
  onOpenChange,
  course,
  availablePlans = [],
  assignedPlans = [],
  onSave,
}) {
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setSelectedPlans(assignedPlans.map((plan) => plan.id));
  }, [assignedPlans, open]);

  function togglePlan(id) {
    setSelectedPlans((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  }

  async function handleSave() {
    try {
      setLoading(true);

      await onSave?.(selectedPlans);

      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!loading) {
          onOpenChange(value);
        }
      }}
    >
      <DialogContent
        className="
          w-[95vw]
          max-w-[95vw]
          sm:max-w-2xl
          lg:max-w-4xl
          xl:max-w-5xl
          p-0
          overflow-hidden
        "
      >
        {/* Header */}

        <DialogHeader className="border-b bg-gradient-to-r from-[#C6A667]/15 via-[#C6A667]/5 to-transparent px-5 py-5 sm:px-6">
          <DialogTitle className="text-xl font-bold text-[#8F6B1A]">
            Assign Payment Plans
          </DialogTitle>

          <DialogDescription className="text-neutral-600">
            Select the payment plans that students can use for this course.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[85vh] flex-col">
          {/* Course */}

          {course && (
            <div className="border-b bg-gradient-to-r from-[#C6A667]/10 via-[#FFF8EA] to-white px-5 py-5 sm:px-6 rounded-b-xl">
              <h3 className="text-lg font-semibold text-[#8F6B1A]">
                {course.title}
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {course.level && (
                  <Badge variant="secondary">{course.level}</Badge>
                )}

                {course.category && (
                  <Badge variant="outline">{course.category}</Badge>
                )}

                <Badge variant={course.active ? "default" : "secondary"}>
                  {course.active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          )}

          {/* Plans */}

          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6">
            {availablePlans.length ? (
              <div className="space-y-4">
                {availablePlans.map((plan) => {
                  const checked = selectedPlans.includes(plan.id);

                  return (
                    <label
                      key={plan.id}
                      className={`
flex
cursor-pointer
gap-4
rounded-2xl
border
p-4
transition-all
duration-200
${
  checked
    ? "border-[#C6A667] bg-[#FFF8EA] shadow-md"
    : "border-neutral-200 bg-white hover:border-[#C6A667]/50 hover:bg-[#FFFDF8]"
}
`}
                    >
                      <div className="pt-1">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => togglePlan(plan.id)}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-[#8F6B1A] break-words">
                            {plan.name}
                          </h4>

                          {!plan.is_active && (
                            <Badge variant="destructive">Inactive</Badge>
                          )}
                        </div>

                        {plan.description && (
                          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-neutral-600">
                            {plan.description}
                          </p>
                        )}

                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="rounded-xl bg-neutral-100 p-3">
                            <p className="text-xs text-neutral-500">Payments</p>

                            <p className="font-semibold">
                              {plan.number_of_payments}
                            </p>
                          </div>

                          <div className="rounded-xl bg-neutral-100 p-3">
                            <p className="text-xs text-neutral-500">Deposit</p>

                            <p className="font-semibold">
                              {plan.initial_payment_percentage}%
                            </p>
                          </div>

                          <div className="rounded-xl bg-neutral-100 p-3">
                            <p className="text-xs text-neutral-500">Interest</p>

                            <p className="font-semibold">
                              {plan.extra_percentage}%
                            </p>
                          </div>

                          <div className="rounded-xl bg-neutral-100 p-3">
                            <p className="text-xs text-neutral-500">Interval</p>

                            <p className="font-semibold">
                              Every {plan.payment_interval_months} month
                              {plan.payment_interval_months > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed p-10 text-center text-neutral-500">
                No payment plans available.
              </div>
            )}
          </div>

          {/* Footer */}

          <DialogFooter className="border-t bg-background px-5 py-4 sm:px-6">
            <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                disabled={loading}
                className="w-full sm:w-auto"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              <Button
                disabled={loading}
                className="w-full sm:w-auto"
                onClick={handleSave}
              >
                {loading ? "Saving..." : "Save Assignments"}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
