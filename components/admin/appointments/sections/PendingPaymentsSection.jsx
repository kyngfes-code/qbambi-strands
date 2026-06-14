"use client";

import DashboardSection from "../DashboardSection";
import PendingAppointmentPaymentsTable from "@/components/PendingAppointmentPaymentsTable";

export default function PendingPaymentsSection({ payments, actions }) {
  return (
    <DashboardSection
      title="Pending Appointment Payments"
      description="
        Review payment receipts submitted
        by customers.
      "
    >
      <PendingAppointmentPaymentsTable
        payments={payments}
        onConfirm={actions.handleConfirmPayment}
        onReject={actions.handleRejectPayment}
        onViewAppointment={actions.handleViewAppointment}
      />
    </DashboardSection>
  );
}
