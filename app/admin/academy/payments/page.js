"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import PaymentStatsCards from "@/components/academy/payments/PaymentStatsCards";
import useAdminAcademyPayments from "@/hooks/useAdminAcademyPayments";
import PaymentSearch from "@/components/academy/payments/PaymentSearch";
import PaymentFilters from "@/components/academy/payments/PaymentFilters";
import EmptyState from "@/components/academy/payments/EmptyState";
import PaymentTable from "@/components/academy/payments/PaymentTable";
import PaymentPagination from "@/components/academy/payments/PaymentPagination";
import PaymentDetailsModal from "@/components/academy/payments/PaymentDetailsModal";
import RefundPaymentDialog from "@/components/academy/payments/RefundPaymentDialog";
import WriteOffDialog from "@/components/academy/payments/WriteOffDialog";
import BackButton from "../BackButton";

export default function AcademyPaymentsPage() {
  ////////////////////////////////////////////////////////////
  // Hook
  ////////////////////////////////////////////////////////////

  const paymentActions = useAdminAcademyPayments();
  const payments = paymentActions.payments ?? [];

  ////////////////////////////////////////////////////////////
  // Dialog State
  ////////////////////////////////////////////////////////////

  const [selectedPayment, setSelectedPayment] = useState(null);

  const [detailsOpen, setDetailsOpen] = useState(false);

  const [refundOpen, setRefundOpen] = useState(false);

  const [writeOffOpen, setWriteOffOpen] = useState(false);

  ////////////////////////////////////////////////////////////
  // Handlers
  ////////////////////////////////////////////////////////////

  function openPayment(payment) {
    setSelectedPayment(payment);
    setDetailsOpen(true);
  }

  function openRefund(payment) {
    setSelectedPayment(payment);
    setRefundOpen(true);
  }

  function openWriteOff(payment) {
    setSelectedPayment(payment);
    setWriteOffOpen(true);
  }

  function closeDialogs() {
    setDetailsOpen(false);
    setRefundOpen(false);
    setWriteOffOpen(false);

    setSelectedPayment(null);
  }

  const stats = payments.stats ?? {
    totalCollected: 0,
    totalRefunded: 0,
    outstandingBalance: 0,
    paymentCount: 0,
  };

  const filters = payments.filters ?? { search: "" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <BackButton />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Academy Payments
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Monitor payments, refunds, write-offs and overall academy revenue.
          </p>
        </div>

        <Button onClick={payments.refreshPayments} disabled={payments.loading}>
          {payments.loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <PaymentStatsCards stats={stats} />

      <PaymentSearch
        value={filters.search}
        onChange={(value) => payments.updateFilter("search", value)}
      />

      <PaymentFilters
        filters={filters}
        courses={payments.courses}
        admins={payments.admins}
        onChange={payments.updateFilter}
        onReset={payments.resetFilters}
      />
      {/* Payments Table */}

      {!paymentActions.loading && payments.length === 0 ? (
        <EmptyState
          title="No Payments Found"
          description="No academy payments match your current search or filters."
          actionLabel="Reset Filters"
          onAction={payments.resetFilters}
        />
      ) : (
        <PaymentTable
          payments={payments.payments}
          loading={payments.loading}
          onView={openPayment}
          onRefund={openRefund}
          onWriteOff={openWriteOff}
          onRefresh={payments.refreshPayments}
        />
      )}

      {/* Pagination */}

      {payments.pagination && payments.pagination.totalPages > 1 && (
        <PaymentPagination
          page={payments.pagination.page}
          totalPages={payments.pagination.totalPages}
          pageSize={payments.pagination.pageSize}
          total={payments.pagination.total}
          onPageChange={(page) => payments.updateFilter("page", page)}
          onPageSizeChange={(pageSize) =>
            payments.updateFilter("pageSize", pageSize)
          }
        />
      )}

      <PaymentDetailsModal
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open);

          if (!open) {
            setTimeout(() => {
              setSelectedPayment(null);
            }, 150);
          }
        }}
        payment={selectedPayment}
        loading={payments?.loading}
        onRefund={() => {
          setDetailsOpen(false);
          setRefundOpen(true);
        }}
        onWriteOff={() => {
          setDetailsOpen(false);
          setWriteOffOpen(true);
        }}
      />

      {/* Refund Dialog */}

      <RefundPaymentDialog
        open={refundOpen}
        onOpenChange={(open) => {
          setRefundOpen(open);

          if (!open) {
            setSelectedPayment(null);
          }
        }}
        payment={selectedPayment}
        loading={payments.processing}
        onSubmit={async (values) => {
          if (!selectedPayment) return;

          const success = await payments.refundPayment(
            selectedPayment.id,
            values,
          );

          if (success) {
            closeDialogs();

            payments?.refreshPayments();
          }
        }}
      />
      {/* Write Off Dialog */}

      <WriteOffDialog
        open={writeOffOpen}
        onOpenChange={(open) => {
          setWriteOffOpen(open);

          if (!open) {
            setSelectedPayment(null);
          }
        }}
        payment={selectedPayment}
        loading={payments.processing}
        onSubmit={async (values) => {
          if (!selectedPayment) return;

          const success = await payments.writeOffPayment(
            selectedPayment.id,
            values,
          );

          if (success) {
            closeDialogs();

            payments.refreshPayments();
          }
        }}
      />
    </div>
  );
}
