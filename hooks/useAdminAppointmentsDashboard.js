"use client";

import { useEffect, useState } from "react";

export default function useAdminAppointmentsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [confirmedAppointments, setConfirmedAppointments] = useState([]);
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [cancelledAppointments, setCancelledAppointments] = useState([]);

  const [pendingPayments, setPendingPayments] = useState([]);

  async function refreshDashboard() {
    try {
      setLoading(true);
      setError("");

      const appointmentsRes = await fetch("/api/admin/appointments");

      if (!appointmentsRes.ok) {
        throw new Error("Failed to load appointments");
      }

      const appointmentsData = await appointmentsRes.json();

      setPendingAppointments(appointmentsData.pending || []);
      setConfirmedAppointments(appointmentsData.confirmed || []);
      setCompletedAppointments(appointmentsData.completed || []);
      setCancelledAppointments(appointmentsData.cancelled || []);

      const paymentsRes = await fetch("/api/admin/appointment-payments");

      if (!paymentsRes.ok) {
        throw new Error("Failed to load appointment payments");
      }

      const paymentsData = await paymentsRes.json();

      setPendingPayments(paymentsData || []);
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

    pendingPayments,

    refreshDashboard,
  };
}
