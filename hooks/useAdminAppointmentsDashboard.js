"use client";

import { useEffect, useState } from "react";

export default function useAdminAppointmentsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [confirmedAppointments, setConfirmedAppointments] = useState([]);
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [cancelledAppointments, setCancelledAppointments] = useState([]);
  const [pendingAppointmentPayments, setPendingAppointmentPayments] = useState(
    [],
  );
  const [paymentHistory, setPaymentHistory] = useState([]);

  async function refreshDashboard() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/admin/appointments");

      if (!res.ok) {
        throw new Error("Failed to load appointments");
      }

      const data = await res.json();
      const pending = data.pending ?? [];
      const confirmed = data.confirmed ?? [];
      const completed = data.completed ?? [];
      const cancelled = data.cancelled ?? [];
      const pendingPayments = data.pendingPayments ?? [];

      setPendingAppointments(pending);
      setConfirmedAppointments(confirmed);
      setCompletedAppointments(completed);
      setCancelledAppointments(cancelled);
      setPendingAppointmentPayments(pendingPayments);

      /*
      ---------------------------------------------------
      Build Payment History From Loaded Appointments
      ---------------------------------------------------
      */

      const appointments = [
        ...pending,
        ...confirmed,
        ...completed,
        ...cancelled,
        ...pendingPayments.map((payment) => payment.appointment),
      ];

      const history = appointments.flatMap((appointment) => {
        const deposits = (appointment.appointment_payments || []).map(
          (payment) => ({
            ...payment,
            appointment,
            recordType: "deposit",
            created_at: payment.created_at,
          }),
        );

        const adjustments = (
          appointment.appointment_payment_adjustments || []
        ).map((adjustment) => ({
          ...adjustment,
          appointment,
          recordType: "adjustment",
          created_at: adjustment.created_at,
        }));

        return [...deposits, ...adjustments];
      });

      history.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setPaymentHistory(history);
    } catch (err) {
      console.error(err);

      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshDashboard();
  }, []);

  return {
    loading,
    error,

    pendingAppointments,
    confirmedAppointments,
    completedAppointments,
    cancelledAppointments,
    pendingPayments: pendingAppointmentPayments,

    paymentHistory,

    refreshDashboard,
  };
}
