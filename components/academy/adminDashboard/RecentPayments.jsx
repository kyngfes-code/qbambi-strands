"use client";

import Link from "next/link";
import { ArrowRight, Calendar, CreditCard, Eye, Receipt } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

//////////////////////////////////////////////////////////////

const METHOD_STYLES = {
  cash: "bg-green-100 text-green-800",
  transfer: "bg-blue-100 text-blue-800",
  bank_transfer: "bg-blue-100 text-blue-800",
  pos: "bg-purple-100 text-purple-800",
  card: "bg-purple-100 text-purple-800",
  online: "bg-cyan-100 text-cyan-800",
};

//////////////////////////////////////////////////////////////

const STATUS_STYLES = {
  completed: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-red-100 text-red-800",
  partially_refunded: "bg-orange-100 text-orange-800",
};

//////////////////////////////////////////////////////////////

function formatCurrency(amount = 0) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

//////////////////////////////////////////////////////////////

function formatDate(date) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(new Date(date));
}

//////////////////////////////////////////////////////////////

export default function RecentPayments({ payments = [], loading = false }) {
  ////////////////////////////////////////////////////////////

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg bg-neutral-100"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  ////////////////////////////////////////////////////////////

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-0">
        {/* Header */}

        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold">Recent Payments</h2>

            <p className="mt-1 text-sm text-neutral-500">
              Latest payment activity.
            </p>
          </div>

          <Button asChild variant="outline" size="sm">
            <Link href="/admin/academy/payments">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Empty */}

        {payments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <Receipt className="mb-4 h-12 w-12 text-neutral-300" />

            <h3 className="text-lg font-semibold">No Payments Yet</h3>

            <p className="mt-2 text-sm text-neutral-500">
              Payment history will appear here.
            </p>
          </div>
        )}

        {/* Desktop */}

        {payments.length > 0 && (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr className="text-left text-sm">
                    <th className="px-6 py-4 font-medium">Student</th>

                    <th className="px-6 py-4 font-medium">Amount</th>

                    <th className="px-6 py-4 font-medium">Method</th>

                    <th className="px-6 py-4 font-medium">Status</th>

                    <th className="px-6 py-4 font-medium">Date</th>

                    <th className="px-6 py-4 text-right font-medium">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-t">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium">
                            {payment.enrollment?.first_name}{" "}
                            {payment.enrollment?.last_name}
                          </div>

                          <div className="text-sm text-neutral-500">
                            {payment.enrollment?.email}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-semibold">
                        {formatCurrency(payment.amount)}
                      </td>

                      <td className="px-6 py-4">
                        <Badge
                          className={
                            METHOD_STYLES[payment.payment_method] ||
                            "bg-neutral-100"
                          }
                        >
                          {payment.payment_method?.replace("_", " ")}
                        </Badge>
                      </td>

                      <td className="px-6 py-4">
                        <Badge
                          className={
                            STATUS_STYLES[payment.status] || "bg-neutral-100"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </td>

                      <td className="px-6 py-4">
                        {formatDate(payment.payment_date || payment.created_at)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Button asChild variant="ghost" size="icon">
                          <Link href={`/admin/academy/payments/${payment.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}

            <div className="divide-y lg:hidden">
              {payments.map((payment) => (
                <div key={payment.id} className="space-y-4 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-neutral-100 p-3">
                        <CreditCard className="h-5 w-5" />
                      </div>

                      <div>
                        <h3 className="font-medium">
                          {payment.enrollment?.first_name}{" "}
                          {payment.enrollment?.last_name}
                        </h3>

                        <p className="text-sm text-neutral-500">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>
                    </div>

                    <Badge
                      className={
                        STATUS_STYLES[payment.status] || "bg-neutral-100"
                      }
                    >
                      {payment.status}
                    </Badge>
                  </div>

                  <div className="grid gap-2 text-sm">
                    <div>
                      <span className="font-medium">Method:</span>{" "}
                      {payment.payment_method?.replace("_", " ")}
                    </div>

                    <div className="flex items-center gap-2 text-neutral-500">
                      <Calendar className="h-4 w-4" />

                      {formatDate(payment.payment_date || payment.created_at)}
                    </div>
                  </div>

                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/admin/academy/payments/${payment.id}`}>
                      View Payment
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
