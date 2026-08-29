"use client";

import {
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";

function formatCurrency(value) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function paymentMethodLabel(method) {
  switch (method) {
    case "bank_transfer":
      return "Bank Transfer";

    case "paystack":
      return "Paystack";

    case "pos":
      return "POS";

    case "cash":
      return "Cash";

    default:
      return method || "—";
  }
}

function paymentTypeLabel(type) {
  switch (type) {
    case "initial_payment":
      return "Initial Payment";

    case "full_payment":
      return "Full Payment";

    case "outstanding_payment":
      return "Outstanding Payment";

    case "instalment":
      return "Instalment";

    default:
      return type || "—";
  }
}

function hasReceipt(payment) {
  return Boolean(payment?.receipt_url || payment?.receipt_filename);
}

export default function AcademyPaymentApprovalTable({
  pendingPayments = [],
  paymentVerified = [],
  loading = false,
  processing = null,
  onVerifyPayment,
  onActivateStudent,
  onViewReceipt,
}) {
  return (
    <div className="space-y-6">
      {/* ================================================== */}
      {/* PENDING PAYMENT VERIFICATION */}
      {/* ================================================== */}

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <Clock3 className="h-5 w-5 text-amber-600" />
            </div>

            <div>
              <h2 className="font-semibold text-neutral-900">
                Pending Payment Verification
              </h2>

              <p className="text-sm text-neutral-500">
                Payments waiting for verification.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-neutral-500">
            Loading payments...
          </div>
        ) : !pendingPayments.length ? (
          <div className="p-8 text-center text-sm text-neutral-500">
            No pending payments.
          </div>
        ) : (
          <>
            {/* ============================= */}
            {/* Desktop */}
            {/* ============================= */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="border-b bg-neutral-50">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium">Student</th>

                    <th className="px-5 py-3 text-left font-medium">Payment</th>

                    <th className="px-5 py-3 text-left font-medium">Type</th>

                    <th className="px-5 py-3 text-left font-medium">Method</th>

                    <th className="px-5 py-3 text-left font-medium">
                      Reference
                    </th>

                    <th className="px-5 py-3 text-left font-medium">Date</th>

                    <th className="px-5 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {pendingPayments.map((payment) => (
                    <tr key={payment.id}>
                      {/* Student */}

                      <td className="px-5 py-4">
                        <div className="font-medium">
                          {payment.student_name || "—"}
                        </div>

                        <div className="text-xs text-neutral-500">
                          {payment.student_number || "No student number"}
                        </div>

                        <div className="text-xs text-neutral-500">
                          {payment.email || "—"}
                        </div>
                      </td>

                      {/* Amount */}

                      <td className="px-5 py-4 font-semibold">
                        {formatCurrency(payment.amount)}
                      </td>

                      {/* Payment Type */}

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                          {paymentTypeLabel(payment.payment_type)}
                        </span>
                      </td>

                      {/* Method */}

                      <td className="px-5 py-4">
                        {paymentMethodLabel(payment.payment_method)}
                      </td>

                      {/* Reference */}

                      <td className="px-5 py-4">
                        <span className="font-mono text-xs">
                          {payment.payment_reference || "—"}
                        </span>
                      </td>

                      {/* Date */}

                      <td className="px-5 py-4 text-neutral-500">
                        {formatDate(payment.payment_date)}
                      </td>

                      {/* Actions */}

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={
                              !hasReceipt(payment) || processing === payment.id
                            }
                            onClick={() => onViewReceipt?.(payment)}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Receipt
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            disabled={processing === payment.id}
                            onClick={() => onVerifyPayment?.(payment)}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />

                            {processing === payment.id
                              ? "Verifying..."
                              : "Verify Payment"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ============================= */}
            {/* Mobile */}
            {/* ============================= */}

            <div className="divide-y md:hidden">
              {pendingPayments.map((payment) => (
                <div key={payment.id} className="space-y-4 p-5">
                  {/* Student / Amount */}

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium">
                        {payment.student_name || "—"}
                      </div>

                      <div className="text-xs text-neutral-500">
                        {payment.student_number || "—"}
                      </div>

                      <div className="text-xs text-neutral-500">
                        {payment.email || "—"}
                      </div>
                    </div>

                    <div className="text-right font-semibold">
                      {formatCurrency(payment.amount)}
                    </div>
                  </div>

                  {/* Details */}

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-neutral-500">
                        Payment Type
                      </div>

                      <div>{paymentTypeLabel(payment.payment_type)}</div>
                    </div>

                    <div>
                      <div className="text-xs text-neutral-500">Method</div>

                      <div>{paymentMethodLabel(payment.payment_method)}</div>
                    </div>

                    <div>
                      <div className="text-xs text-neutral-500">Date</div>

                      <div>{formatDate(payment.payment_date)}</div>
                    </div>

                    <div>
                      <div className="text-xs text-neutral-500">Status</div>

                      <span className="inline-flex rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                        Pending
                      </span>
                    </div>

                    <div className="col-span-2">
                      <div className="text-xs text-neutral-500">Reference</div>

                      <div className="break-all font-mono text-xs">
                        {payment.payment_reference || "—"}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={
                        !hasReceipt(payment) || processing === payment.id
                      }
                      onClick={() => onViewReceipt?.(payment)}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Receipt
                    </Button>

                    <Button
                      type="button"
                      disabled={processing === payment.id}
                      onClick={() => onVerifyPayment?.(payment)}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />

                      {processing === payment.id ? "Verifying..." : "Verify"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ================================================== */}
      {/* PAYMENT VERIFIED / AWAITING ACTIVATION */}
      {/* ================================================== */}

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <CreditCard className="h-5 w-5 text-emerald-600" />
            </div>

            <div>
              <h2 className="font-semibold text-neutral-900">
                Payments Verified — Awaiting Activation
              </h2>

              <p className="text-sm text-neutral-500">
                These students have met the required payment and are waiting for
                activation.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-neutral-500">
            Loading enrollments...
          </div>
        ) : !paymentVerified.length ? (
          <div className="p-8 text-center text-sm text-neutral-500">
            No students are awaiting activation.
          </div>
        ) : (
          <>
            {/* ============================= */}
            {/* Desktop */}
            {/* ============================= */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="border-b bg-neutral-50">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium">Student</th>

                    <th className="px-5 py-3 text-left font-medium">
                      Required
                    </th>

                    <th className="px-5 py-3 text-left font-medium">Paid</th>

                    <th className="px-5 py-3 text-left font-medium">Balance</th>

                    <th className="px-5 py-3 text-left font-medium">
                      Payment Status
                    </th>

                    <th className="px-5 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {paymentVerified.map((enrollment) => (
                    <tr key={enrollment.id}>
                      {/* Student */}

                      <td className="px-5 py-4">
                        <div className="font-medium">
                          {enrollment.student_name || "—"}
                        </div>

                        <div className="text-xs text-neutral-500">
                          {enrollment.student_number || "—"}
                        </div>

                        <div className="text-xs text-neutral-500">
                          {enrollment.email || "—"}
                        </div>
                      </td>

                      {/* Required */}

                      <td className="px-5 py-4">
                        {formatCurrency(enrollment.initial_payment_amount)}
                      </td>

                      {/* Paid */}

                      <td className="px-5 py-4 font-semibold text-emerald-700">
                        {formatCurrency(enrollment.amount_paid)}
                      </td>

                      {/* Balance */}

                      <td className="px-5 py-4">
                        {formatCurrency(enrollment.balance_due)}
                      </td>

                      {/* Status */}

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          Payment Verified
                        </span>
                      </td>

                      {/* Actions */}

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={
                              !hasReceipt(enrollment) ||
                              processing === enrollment.id
                            }
                            onClick={() => onViewReceipt?.(enrollment)}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Receipt
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            disabled={processing === enrollment.id}
                            onClick={() => onActivateStudent?.(enrollment)}
                          >
                            <User className="mr-2 h-4 w-4" />

                            {processing === enrollment.id
                              ? "Activating..."
                              : "Activate Student"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ============================= */}
            {/* Mobile */}
            {/* ============================= */}

            <div className="divide-y md:hidden">
              {paymentVerified.map((enrollment) => (
                <div key={enrollment.id} className="space-y-4 p-5">
                  {/* Student */}

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium">
                        {enrollment.student_name || "—"}
                      </div>

                      <div className="text-xs text-neutral-500">
                        {enrollment.student_number || "—"}
                      </div>

                      <div className="text-xs text-neutral-500">
                        {enrollment.email || "—"}
                      </div>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      Verified
                    </span>
                  </div>

                  {/* Financial Details */}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-neutral-500">Required</div>

                      <div className="font-medium">
                        {formatCurrency(enrollment.initial_payment_amount)}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-neutral-500">Paid</div>

                      <div className="font-medium text-emerald-700">
                        {formatCurrency(enrollment.amount_paid)}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-neutral-500">Balance</div>

                      <div className="font-medium">
                        {formatCurrency(enrollment.balance_due)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={
                        !hasReceipt(enrollment) || processing === enrollment.id
                      }
                      onClick={() => onViewReceipt?.(enrollment)}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Receipt
                    </Button>

                    <Button
                      type="button"
                      disabled={processing === enrollment.id}
                      onClick={() => onActivateStudent?.(enrollment)}
                    >
                      <User className="mr-2 h-4 w-4" />

                      {processing === enrollment.id
                        ? "Activating..."
                        : "Activate"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
