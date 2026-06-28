"use client";

import { useMemo, useState } from "react";

export default function AdminAppointmentStats({
  appointments = [],
  pendingPayments = [],
}) {
  const [period, setPeriod] = useState("all");

  const filteredAppointments = useMemo(() => {
    const now = new Date();

    return appointments.filter((appointment) => {
      const date = new Date(appointment.completed_at || appointment.created_at);

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

  const filteredPendingPayments = useMemo(() => {
    const now = new Date();

    return pendingPayments.filter((payment) => {
      const date = new Date(payment.created_at);

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
  }, [pendingPayments, period]);

  const totalAppointments = filteredAppointments.length;

  const pendingRequests = filteredAppointments.filter(
    (a) => a.status === "pending",
  ).length;

  const confirmedAppointments = filteredAppointments.filter(
    (a) => a.status === "confirmed",
  ).length;

  const completedAppointments = filteredAppointments.filter(
    (a) => a.status === "completed",
  ).length;

  const cancelledAppointments = filteredAppointments.filter(
    (a) => a.status === "cancelled",
  ).length;

  const grossRevenue = filteredAppointments.reduce(
    (sum, appointment) => sum + Number(appointment.amount_paid || 0),
    0,
  );

  const netRevenue = filteredAppointments.reduce((sum, appointment) => {
    const amountPaid = Number(appointment.amount_paid || 0);
    const refundedAmount = Number(appointment.refunded_amount || 0);

    return sum + (amountPaid - refundedAmount);
  }, 0);

  const totalRefunds = filteredAppointments.reduce(
    (sum, appointment) => sum + Number(appointment.refunded_amount || 0),
    0,
  );

  const totalTips = filteredAppointments.reduce((sum, appointment) => {
    const tips =
      appointment.appointment_payment_adjustments?.reduce(
        (tipSum, adjustment) => tipSum + Number(adjustment.tip_amount || 0),
        0,
      ) || 0;

    return sum + tips;
  }, 0);

  const stats = [
    {
      label: "Total Appointments",
      value: totalAppointments,
      color: "bg-neutral-100",
      text: "text-neutral-800",
    },
    {
      label: "Pending Requests",
      value: pendingRequests,
      color: "bg-yellow-100",
      text: "text-yellow-700",
    },
    {
      label: "Pending Payments",
      value: filteredPendingPayments.length,
      color: "bg-orange-100",
      text: "text-orange-700",
    },
    {
      label: "Confirmed",
      value: confirmedAppointments,
      color: "bg-blue-100",
      text: "text-blue-700",
    },
    {
      label: "Completed",
      value: completedAppointments,
      color: "bg-green-100",
      text: "text-green-700",
    },
    {
      label: "Cancelled",
      value: cancelledAppointments,
      color: "bg-red-100",
      text: "text-red-700",
    },
    {
      label: "Gross Revenue",
      value: `₦${grossRevenue.toLocaleString()}`,
      color: "bg-emerald-100",
      text: "text-emerald-700",
    },
    {
      label: "Refunds",
      value: `₦${totalRefunds.toLocaleString()}`,
      color: "bg-red-100",
      text: "text-red-700",
    },
    {
      label: "Net Revenue",
      value: `₦${netRevenue.toLocaleString()}`,
      color: "bg-emerald-100",
      text: "text-emerald-700",
    },
    {
      label: "Tips",
      value: `₦${totalTips.toLocaleString()}`,
      color: "bg-purple-100",
      text: "text-purple-700",
    },
  ];

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">Appointment Overview</h2>
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { value: "today", label: "Today" },
          { value: "week", label: "This Week" },
          { value: "month", label: "This Month" },
          { value: "year", label: "This Year" },
          { value: "all", label: "All Time" },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => setPeriod(item.value)}
            className={`px-4 py-2 rounded-xl border ${
              period === item.value ? "bg-black text-white" : "bg-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.color} border rounded-2xl p-5 shadow-sm`}
          >
            <p className="text-sm font-medium text-neutral-500">{stat.label}</p>

            <p className={`mt-2 text-3xl font-bold ${stat.text}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
