"use client";

import CancelledOrdersTable from "@/components/CancelledOrdersTable";
import DashboardSection from "../DashboardSection";

export default function CancelledOrdersSection({
  cancellations = [],
  actions,
}) {
  return (
    <DashboardSection
      title="Cancelled Orders"
      description="Orders that have been cancelled by administrators or customers."
    >
      <CancelledOrdersTable
        cancellations={cancellations}
        onViewOrder={actions.viewOrder}
      />
    </DashboardSection>
  );
}
