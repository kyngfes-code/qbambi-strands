"use client";

import { MoreHorizontal, Eye, RotateCcw, ReceiptText } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import PaymentStatusBadge from "./PaymentStatusBadge";
import PaymentMethodBadge from "./PaymentMethodBadge";
import EmptyState from "./EmptyState";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function formatDate(date) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function PaymentTable({
  payments = [],
  loading = false,

  onView,
  onRefund,
  onWriteOff,
}) {
  //---------------------------------------------------------

  if (loading) {
    return (
      <div className="rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment Date</TableHead>
              <TableHead>Enrollment</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Courses</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-14" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {Array.from({ length: 8 }).map((_, index) => (
              <TableRow key={index}>
                {Array.from({ length: 8 }).map((__, i) => (
                  <TableCell key={i}>
                    <div className="h-4 w-full animate-pulse rounded bg-neutral-200" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  //---------------------------------------------------------

  if (!payments.length) {
    return <EmptyState />;
  }

  //---------------------------------------------------------

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment Date</TableHead>

              <TableHead>Enrollment</TableHead>

              <TableHead>Student</TableHead>

              <TableHead>Courses</TableHead>

              <TableHead>Method</TableHead>

              <TableHead className="text-right">Amount</TableHead>

              <TableHead>Status</TableHead>

              <TableHead>Recorded By</TableHead>

              <TableHead className="w-14" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="whitespace-nowrap">
                  {formatDate(payment.payment_date || payment.created_at)}
                </TableCell>

                <TableCell className="font-medium">
                  {payment.enrollment?.enrollment_number || "-"}
                </TableCell>

                <TableCell>
                  <div className="font-medium">
                    {payment.enrollment?.first_name}{" "}
                    {payment.enrollment?.last_name}
                  </div>

                  <div className="text-xs text-neutral-500">
                    {payment.enrollment?.email}
                  </div>
                </TableCell>

                <TableCell className="max-w-[250px]">
                  <div className="space-y-1">
                    {(payment.enrollment?.courses || []).length ? (
                      payment.enrollment.courses.map((course) => (
                        <div key={course.id} className="text-sm">
                          {course.title}
                        </div>
                      ))
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <PaymentMethodBadge method={payment.payment_method} />
                </TableCell>

                <TableCell className="text-right font-semibold">
                  {formatCurrency(payment.amount)}
                </TableCell>

                <TableCell>
                  <PaymentStatusBadge status={payment.status} />
                </TableCell>

                <TableCell>
                  {payment.received_by_user?.first_name}{" "}
                  {payment.received_by_user?.last_name}
                </TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView?.(payment)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => onRefund?.(payment)}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Refund
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => onWriteOff?.(payment)}>
                        <ReceiptText className="mr-2 h-4 w-4" />
                        Write Off
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
