"use client";

import OrderHeader from "./OrderHeader";
import FinancialSummary from "./FinancialSummary";
import PaymentProgress from "./PaymentProgress";
import DeliveryNotice from "./DeliveryNotice";
import StatusCard from "./StatusCard";
import OrderActions from "./OrderActions";
import PaymentSection from "./PaymentSection";

export default function OrderCard({ order, onReload, onOpenOrder, onRefund }) {
  const financial = order.financialSummary || {};

  const total = Number(financial.totalAmount || 0);
  const paid = Number(financial.totalPaid || 0);
  const refunded = Number(financial.refundedAmount || 0);
  const balanceDue = Number(financial.balanceDue || 0);
  const netPaid = Number(financial.netReceived || 0);

  const showPaymentSection =
    balanceDue > 0 &&
    (order.status === "pending" ||
      order.status === "rejected" ||
      (order.status === "payment_plan_active" &&
        order.payment_plan?.status === "active"));

  return (
    <article className="rounded-3xl border bg-white shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="p-5 sm:p-6 lg:p-7 space-y-6">
        <OrderHeader order={order} />

        <FinancialSummary
          total={total}
          paid={paid}
          netPaid={netPaid}
          refunded={refunded}
          balanceDue={balanceDue}
        />

        <PaymentProgress total={total} paid={paid} />

        <DeliveryNotice />

        {order.status === "pending" && !order.payment_plan && (
          <div className="rounded-2xl border bg-neutral-50 p-5 text-center">
            <p className="font-medium">Flexible payment plans coming soon ✨</p>

            <p className="mt-1 text-sm text-neutral-500">
              We're working on making split payments available.
            </p>
          </div>
        )}

        {showPaymentSection && (
          <PaymentSection
            order={order}
            balanceDue={balanceDue}
            onReload={onReload}
          />
        )}

        <StatusCard order={order} />

        <OrderActions
          order={order}
          onViewDetails={onOpenOrder}
          onRequestRefund={onRefund}
        />
      </div>
    </article>
  );
}
