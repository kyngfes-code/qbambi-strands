"use client";

import OverdueInstalmentsTable from "@/components/OverdueInstalmentsTable";
import DashboardSection from "../DashboardSection";

export default function OverdueInstalmentsSection({
  instalments = [],
  actions,
}) {
  return (
    <DashboardSection
      title="Overdue Instalments"
      titleClassName="text-red-600"
      description="Instalments that have passed their due date."
    >
      <OverdueInstalmentsTable
        instalments={instalments}
        onViewOrder={actions.viewOrder}
      />
    </DashboardSection>
  );
}
