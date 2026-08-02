"use client";

import { ArrowLeft, CalendarDays, Printer } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import EnrollmentStatusBadge from "../EnrollmentStatusBadge";

export default function EnrollmentHeader({ enrollment, onPrint }) {
  if (!enrollment) return null;

  return (
    <div className="rounded-3xl border bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-5">
          <Link
            href="/admin/academy/enrollments"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Enrollments
          </Link>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              {enrollment.first_name} {enrollment.last_name}
            </h1>

            <div className="flex flex-wrap items-center gap-3">
              <EnrollmentStatusBadge status={enrollment.status} />

              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
                #{enrollment.reference_number}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />

              <span>
                Submitted {new Date(enrollment.created_at).toLocaleDateString()}
              </span>
            </div>

            {enrollment.learning_mode && (
              <span className="rounded-full bg-[#C6A667]/10 px-3 py-1 text-xs font-medium text-[#8d6d2d]">
                {enrollment.learning_mode}
              </span>
            )}

            {enrollment.payment_plan && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {enrollment.payment_plan}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={onPrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>
    </div>
  );
}
