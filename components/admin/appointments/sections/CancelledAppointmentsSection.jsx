"use client";

import { useMemo, useState } from "react";
import DashboardSection from "../DashboardSection";
import CancelledAppointmentsTable from "@/components/CancelledAppointmentsTable";
import PeriodFilter from "@/components/PeriodFilter";

export default function CancelledAppointmentsSection({
  appointments,
  actions,
}) {
  const [period, setPeriod] = useState("all");

  const filteredAppointments = useMemo(() => {
    const now = new Date();

    return appointments.filter((appointment) => {
      const date = new Date(appointment.confirmed_at || appointment.created_at);

      switch (period) {
        case "today":
          return date.toDateString() === now.toDateString();

        case "week": {
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);

          return date >= weekAgo;
        }

        case "month":
          return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );

        case "year":
          return date.getFullYear() === now.getFullYear();

        default:
          return true;
      }
    });
  }, [appointments, period]);
  return (
    <DashboardSection
      title="Cancelled Appointments"
      description="
        View cancellations and their reasons.
      "
    >
      <PeriodFilter value={period} onChange={setPeriod} />

      <CancelledAppointmentsTable
        appointments={filteredAppointments}
        onView={actions.handleViewAppointment}
        onRefund={actions.handleOpenRefund}
      />
    </DashboardSection>
  );
}
