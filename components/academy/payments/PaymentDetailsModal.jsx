"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Separator } from "@/components/ui/separator";

import PaymentStatusBadge from "./PaymentStatusBadge";
import PaymentMethodBadge from "./PaymentMethodBadge";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(date) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-6 py-2">
      <p className="text-sm text-neutral-500">{label}</p>

      <div className="text-right text-sm font-medium">{value ?? "-"}</div>
    </div>
  );
}

export default function PaymentDetailsModal({
  open,
  onOpenChange,

  payment,
}) {
  if (!payment) return null;

  //----------------------------------------------------------

  const enrollment = payment.enrollment || {};

  const studentName = [enrollment.first_name, enrollment.last_name]
    .filter(Boolean)
    .join(" ");

  //----------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>

          <DialogDescription>
            View complete payment information.
          </DialogDescription>
        </DialogHeader>

        {/* Payment Summary */}

        <div className="rounded-xl border bg-neutral-50 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-neutral-500">Amount Paid</p>

              <h2 className="mt-1 text-3xl font-bold">
                {formatCurrency(payment.amount)}
              </h2>
            </div>

            <div className="flex gap-3">
              <PaymentStatusBadge status={payment.status} />

              <PaymentMethodBadge method={payment.payment_method} />
            </div>
          </div>
        </div>

        {/* Student */}

        <section className="space-y-2">
          <h3 className="font-semibold">Student Information</h3>

          <Separator />

          <DetailRow label="Student" value={studentName} />

          <DetailRow label="Email" value={enrollment.email} />

          <DetailRow label="Phone" value={enrollment.phone} />

          <DetailRow
            label="Enrollment Number"
            value={enrollment.enrollment_number}
          />
        </section>

        {/* Payment */}

        <section className="space-y-2">
          <h3 className="font-semibold">Payment Information</h3>

          <Separator />

          <DetailRow
            label="Payment Date"
            value={formatDate(payment.payment_date || payment.created_at)}
          />

          <DetailRow label="Amount" value={formatCurrency(payment.amount)} />

          <DetailRow
            label="Payment Method"
            value={<PaymentMethodBadge method={payment.payment_method} />}
          />

          <DetailRow
            label="Reference"
            value={payment.reference || payment.payment_reference}
          />

          <DetailRow label="Transaction ID" value={payment.transaction_id} />

          <DetailRow label="Receipt Number" value={payment.receipt_number} />
        </section>

        {/* Financial */}

        <section className="space-y-2">
          <h3 className="font-semibold">Financial Summary</h3>

          <Separator />

          <DetailRow
            label="Total Course Fee"
            value={formatCurrency(enrollment.total_course_fee)}
          />

          <DetailRow
            label="Total Paid"
            value={formatCurrency(enrollment.amount_paid)}
          />

          <DetailRow
            label="Outstanding Balance"
            value={formatCurrency(enrollment.balance_due)}
          />

          <DetailRow
            label="Payment Status"
            value={<PaymentStatusBadge status={enrollment.payment_status} />}
          />
        </section>

        {/* Courses */}

        <section className="space-y-2">
          <h3 className="font-semibold">Courses</h3>

          <Separator />

          {enrollment.courses?.length ? (
            <div className="space-y-3">
              {enrollment.courses.map((course) => (
                <div key={course.id} className="rounded-lg border p-4">
                  <div className="font-medium">{course.title}</div>

                  <div className="mt-1 text-sm text-neutral-500">
                    {course.category} • {course.level}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">
              No course information available.
            </p>
          )}
        </section>

        {/* Audit */}

        <section className="space-y-2">
          <h3 className="font-semibold">Audit Trail</h3>

          <Separator />

          <DetailRow
            label="Recorded By"
            value={
              payment.received_by_user
                ? `${payment.received_by_user.first_name} ${payment.received_by_user.last_name}`
                : "-"
            }
          />

          <DetailRow label="Created" value={formatDate(payment.created_at)} />

          <DetailRow
            label="Last Updated"
            value={formatDate(payment.updated_at)}
          />
        </section>
      </DialogContent>
    </Dialog>
  );
}
