"use client";

import DashboardSection from "../DashboardSection";
import CompletedAppointmentsTable from "@/components/CompletedAppointmentsTable";

export default function CompletedAppointmentsSection({
  appointments,
  actions,
}) {
  return (
    <DashboardSection
      title="Completed Appointments"
      description="
        Services successfully delivered.
      "
    >
      <CompletedAppointmentsTable
        appointments={appointments}
        onView={actions.handleViewAppointment}
      />
    </DashboardSection>
  );
}
