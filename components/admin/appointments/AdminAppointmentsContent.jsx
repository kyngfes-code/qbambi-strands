"use client";

import AdminAppointmentStats from "@/components/AdminAppointmentStats";

import PendingPaymentsSection from "./sections/PendingPaymentsSection";
import CompletedAppointmentsSection from "./sections/CompletedAppointmentsSection";
import CancelledAppointmentsSection from "./sections/CancelledAppointmentsSection";
import AppointmentRequestsSection from "./sections/AppointmentRequestsSection";
import ConfirmedAppointmentsSection from "./sections/ConfirmedAppointmentsSection";

export default function AdminAppointmentsContent({ data, actions }) {
  const {
    pendingAppointments,
    confirmedAppointments,
    completedAppointments,
    cancelledAppointments,
    pendingPayments,
  } = data;

  return (
    <>
      {/* =====================================
          Dashboard Statistics
      ====================================== */}
      <AdminAppointmentStats
        appointments={[
          ...pendingAppointments,
          ...confirmedAppointments,
          ...completedAppointments,
          ...cancelledAppointments,
        ]}
        pendingPayments={pendingPayments}
      />

      {/* =====================================
          Appointment Requests
      ====================================== */}
      <AppointmentRequestsSection
        appointments={pendingAppointments}
        actions={actions}
      />

      {/* =====================================
          Pending Payment Confirmations
      ====================================== */}
      <PendingPaymentsSection payments={pendingPayments} actions={actions} />

      {/* =====================================
          Confirmed Appointments
      ====================================== */}
      <ConfirmedAppointmentsSection
        appointments={confirmedAppointments}
        actions={actions}
      />

      {/* =====================================
          Completed Appointments
      ====================================== */}
      <CompletedAppointmentsSection
        appointments={completedAppointments}
        actions={actions}
      />

      {/* =====================================
          Cancelled Appointments
      ====================================== */}
      <CancelledAppointmentsSection
        appointments={cancelledAppointments}
        actions={actions}
      />
    </>
  );
}
