"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { GraduationCap, CreditCard, ArrowRight } from "lucide-react";

export default function CoursePlansCard({ course, onAssign }) {
  const plans = course.paymentPlans ?? [];

  return (
    <Card className="rounded-3xl border bg-white p-6 shadow-sm transition hover:shadow-md">
      {/* Header */}

      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#C6A667]/10">
          <GraduationCap className="h-7 w-7 text-[#C6A667]" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-xl font-semibold">{course.title}</h3>

          <p className="mt-1 text-sm text-neutral-500">
            Configure which payment plans students can use for this course.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {course.level && <Badge variant="secondary">{course.level}</Badge>}

            {course.category && (
              <Badge variant="outline">{course.category}</Badge>
            )}

            <Badge variant={course.active ? "default" : "secondary"}>
              {course.active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Assigned Plans */}

      <div className="mt-8 rounded-2xl border bg-neutral-50 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="flex items-center gap-2 font-semibold">
            <CreditCard className="h-4 w-4 text-[#C6A667]" />
            Assigned Payment Plans
          </h4>

          <span className="text-sm text-neutral-500">{plans.length}</span>
        </div>

        {plans.length > 0 ? (
          <div className="space-y-3">
            {plans.map((plan) => (
              <div key={plan.id} className="rounded-xl border bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{plan.name}</p>

                    <p className="mt-1 text-sm text-neutral-500">
                      {plan.numberOfPayments} payments •{" "}
                      {plan.initialPaymentPercentage}% deposit
                      {plan.extraPercentage > 0 &&
                        ` • ${plan.extraPercentage}% interest`}
                    </p>
                  </div>

                  <Badge variant={plan.active ? "default" : "secondary"}>
                    {plan.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed bg-white p-8 text-center">
            <p className="text-sm text-neutral-500">
              No payment plans assigned yet.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}

      <div className="mt-8 flex items-center justify-between border-t pt-6">
        <p className="text-sm text-neutral-500">
          Click below to manage payment plans.
        </p>

        <Button onClick={onAssign}>
          Manage Plans
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
