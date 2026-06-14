"use client";

import DashboardSection from "../DashboardSection";
import AppointmentRequestsTable from "@/components/AppointmentRequestsTable";

export default function AppointmentRequestsSection({ appointments, actions }) {
  return (
    <DashboardSection
      title="Appointment Requests"
      description="
        New appointments awaiting pricing,
        payment, or approval.
      "
    >
      <AppointmentRequestsTable
        appointments={appointments}
        onView={actions.handleViewAppointment}
        onSetPricing={actions.handleOpenPricing}
        onCancel={actions.handleOpenCancellation}
      />
    </DashboardSection>
  );
}
