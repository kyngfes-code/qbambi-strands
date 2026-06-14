"use client";

import DashboardSection from "../DashboardSection";
import ConfirmedAppointmentsTable from "@/components/ConfirmedAppointmentsTable";

export default function ConfirmedAppointmentsSection({
  appointments,
  actions,
}) {
  return (
    <DashboardSection
      title="Confirmed Appointments"
      description="Customers who have secured their bookings."
    >
      <ConfirmedAppointmentsTable
        appointments={appointments}
        onView={actions.handleViewAppointment}
        onComplete={actions.handleOpenComplete}
        onCancel={actions.handleOpenCancellation}
      />
    </DashboardSection>
  );
}
