"use client";

import DashboardSection from "../DashboardSection";
import CancelledAppointmentsTable from "@/components/CancelledAppointmentsTable";

export default function CancelledAppointmentsSection({
  appointments,
  actions,
}) {
  return (
    <DashboardSection
      title="Cancelled Appointments"
      description="
        View cancellations and their reasons.
      "
    >
      <CancelledAppointmentsTable
        appointments={appointments}
        onView={actions.handleViewAppointment}
        onRefund={actions.handleOpenRefund}
      />
    </DashboardSection>
  );
}
