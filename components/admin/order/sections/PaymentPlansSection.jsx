"use client";

import PaymentPlansTable from "@/components/PaymentPlansTable";
import DashboardSection from "../DashboardSection";

export default function PaymentPlansSection({ plans = [], actions }) {
  return (
    <DashboardSection
      title="Payment Plans"
      description="Customers currently paying for orders in instalments."
    >
      <PaymentPlansTable plans={plans} onViewOrder={actions.viewOrder} />
    </DashboardSection>
  );
}
