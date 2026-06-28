"use client";

import PaymentHistoryTable from "@/components/PaymentHistoryTable";
import DashboardSection from "../DashboardSection";

export default function PaymentHistorySection({ history = [], actions }) {
  return (
    <DashboardSection
      title="Payment History"
      description="History of all confirmed customer payments."
    >
      <PaymentHistoryTable history={history} onViewOrder={actions.viewOrder} />
    </DashboardSection>
  );
}
