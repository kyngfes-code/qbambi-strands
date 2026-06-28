"use client";

import PaymentRejectionsTable from "@/components/PaymentRejectionsTable";
import DashboardSection from "../DashboardSection";

export default function PaymentRejectionsSection({ rejections = [], actions }) {
  return (
    <DashboardSection
      title="Payment Rejections"
      description="Payments rejected by administrators, including rejection reasons and customer notifications."
    >
      <PaymentRejectionsTable
        rejections={rejections}
        onViewOrder={actions.viewOrder}
      />
    </DashboardSection>
  );
}
