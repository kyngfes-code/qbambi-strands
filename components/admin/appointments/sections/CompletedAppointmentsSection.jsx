"use client";

import PeriodFilter from "@/components/PeriodFilter";
import DashboardSection from "../DashboardSection";
import CompletedAppointmentsTable from "@/components/CompletedAppointmentsTable";
import { useState, useMemo } from "react";
import StatCard from "@/components/StatCard";

export default function CompletedAppointmentsSection({
  appointments,
  actions,
}) {
  const [period, setPeriod] = useState("all");
  const [search, setSearch] = useState("");

  const filteredAppointments = useMemo(() => {
    const now = new Date();

    return appointments.filter((appointment) => {
      const date = new Date(appointment.confirmed_at || appointment.created_at);

      let matchesPeriod = true;

      switch (period) {
        case "today":
          matchesPeriod = date.toDateString() === now.toDateString();
          break;

        case "week": {
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);

          matchesPeriod = date >= weekAgo;
          break;
        }

        case "month":
          matchesPeriod =
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();
          break;

        case "year":
          matchesPeriod = date.getFullYear() === now.getFullYear();
          break;

        default:
          matchesPeriod = true;
      }

      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        appointment.id?.toLowerCase().includes(query) ||
        appointment.user?.id?.toLowerCase().includes(query) ||
        appointment.user?.name?.toLowerCase().includes(query) ||
        appointment.user?.email?.toLowerCase().includes(query) ||
        appointment.service_name?.toLowerCase().includes(query);

      return matchesPeriod && matchesSearch;
    });
  }, [appointments, period, search]);

  const summary = useMemo(() => {
    return filteredAppointments.reduce(
      (acc, appointment) => {
        const tips =
          appointment.appointment_payment_adjustments?.reduce(
            (sum, adjustment) => sum + Number(adjustment.tip_amount || 0),
            0,
          ) || 0;

        acc.appointments += 1;
        acc.revenue += Number(appointment.amount_paid || 0);
        acc.tips += tips;
        acc.refunds += Number(appointment.refunded_amount || 0);
        acc.outstanding += Number(appointment.balance_due || 0);

        return acc;
      },
      {
        appointments: 0,
        revenue: 0,
        tips: 0,
        refunds: 0,
        outstanding: 0,
      },
    );
  }, [filteredAppointments]);

  const netRevenue = summary.revenue + summary.tips - summary.refunds;

  return (
    <DashboardSection
      title="Completed Appointments"
      description="
        Services successfully delivered.
      "
    >
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <StatCard title="Appointments" value={summary.appointments} />

        <StatCard
          title="Revenue"
          value={`₦${summary.revenue.toLocaleString()}`}
        />

        <StatCard title="Tips" value={`₦${summary.tips.toLocaleString()}`} />

        <StatCard
          title="Refunds"
          value={`₦${summary.refunds.toLocaleString()}`}
        />

        <StatCard
          title="Net Revenue"
          value={`₦${netRevenue.toLocaleString()}`}
        />

        <StatCard
          title="Outstanding"
          value={`₦${summary.outstanding.toLocaleString()}`}
        />
      </div>
      <PeriodFilter value={period} onChange={setPeriod} />
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by customer, email, appointment ID, service..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 border rounded-xl px-4 py-3"
        />
      </div>
      <CompletedAppointmentsTable
        appointments={filteredAppointments}
        onView={actions.handleViewAppointment}
        onRefund={actions.handleOpenRefund}
      />
    </DashboardSection>
  );
}
