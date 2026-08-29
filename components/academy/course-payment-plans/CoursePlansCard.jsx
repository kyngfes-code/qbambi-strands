"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { GraduationCap, CreditCard, ArrowRight } from "lucide-react";

export default function CoursePlansCard({ course, onAssign }) {
  const plans = course.paymentPlans ?? [];

  const courseStatus = course.status || "draft";

  const statusVariant = {
    draft: "secondary",
    published: "default",
    archived: "outline",
  };

  const statusLabel = {
    draft: "Draft",
    published: "Published",
    archived: "Archived",
  };

  return (
    <Card className="rounded-3xl border bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5 md:p-6">
      {/* Header */}
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#C6A667]/10 sm:h-14 sm:w-14 sm:rounded-2xl">
          <GraduationCap className="h-6 w-6 text-[#C6A667] sm:h-7 sm:w-7" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="break-words text-lg font-semibold sm:text-xl">
            {course.title}
          </h3>

          <p className="mt-1 text-sm leading-5 text-neutral-500">
            Configure which payment plans students can use for this course.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant={statusVariant[courseStatus] || "secondary"}>
              {statusLabel[courseStatus] ||
                courseStatus.charAt(0).toUpperCase() + courseStatus.slice(1)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Assigned Plans */}
      <div className="mt-6 rounded-2xl border bg-neutral-50 p-3 sm:mt-8 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h4 className="flex min-w-0 items-center gap-2 font-semibold">
            <CreditCard className="h-4 w-4 shrink-0 text-[#C6A667]" />

            <span className="truncate">Assigned Payment Plans</span>
          </h4>

          <span className="shrink-0 text-sm text-neutral-500">
            {plans.length}
          </span>
        </div>

        {plans.length > 0 ? (
          <div className="space-y-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-xl border bg-white p-3 sm:p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-medium">{plan.name}</p>

                    <p className="mt-1 text-sm leading-5 text-neutral-500">
                      {plan.numberOfPayments} payments
                      {" • "}
                      {plan.initialPaymentPercentage}% deposit
                      {plan.extraPercentage > 0 &&
                        ` • ${plan.extraPercentage}% interest`}
                    </p>
                  </div>

                  <Badge
                    variant={plan.active ? "default" : "secondary"}
                    className="w-fit shrink-0"
                  >
                    {plan.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed bg-white p-6 text-center sm:p-8">
            <p className="text-sm text-neutral-500">
              No payment plans assigned yet.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 flex flex-col gap-4 border-t pt-5 sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
        <p className="text-sm leading-5 text-neutral-500">
          Manage the payment plans available for this course.
        </p>

        <Button onClick={onAssign} className="w-full shrink-0 sm:w-auto">
          Manage Plans
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
