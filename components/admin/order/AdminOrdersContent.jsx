"use client";

import AdminOrderStats from "./AdminOrderStats";
import DeliveredOrdersSection from "./sections/DeliveredOrdersSection";
import DashboardToolbar from "./DashboardToolbar";
import PendingConfirmationsSection from "./sections/PendingConfirmationsSection";
import PaymentRejectionsSection from "./sections/PaymentRejectionsSection";
import CancelledOrdersSection from "./sections/CancelledOrdersSection";
import OverdueInstalmentsSection from "./sections/OverdueInstalmentsSection";
import PaymentHistorySection from "./sections/PaymentHistorySection";
import PaymentPlansSection from "./sections/PaymentPlansSection";

export default function AdminOrdersContent({ data, actions }) {
  const {
    overview,
    plans,
    history,
    overdue,
    pending,
    deliveredOrders,
    rejections,
    cancelledOrders,
  } = data;

  return (
    <div className="space-y-8 p-6">
      <DashboardToolbar
        title="Orders Dashboard"
        description="Monitor payments, deliveries and customer orders."
        period={actions.period}
        onPeriodChange={actions.setPeriod}
        onRefresh={actions.refresh}
        refreshing={actions.refreshing}
      />
      <AdminOrderStats overview={overview} />

      <PaymentPlansSection plans={plans} actions={actions} />

      <PaymentHistorySection history={history} actions={actions} />

      <OverdueInstalmentsSection instalments={overdue} actions={actions} />

      <PendingConfirmationsSection orders={pending} actions={actions} />

      <DeliveredOrdersSection orders={deliveredOrders} actions={actions} />

      <PaymentRejectionsSection rejections={rejections} actions={actions} />

      <CancelledOrdersSection
        cancellations={cancelledOrders}
        actions={actions}
      />
    </div>
  );
}
