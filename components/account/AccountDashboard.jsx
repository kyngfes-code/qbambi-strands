"use client";

import { useEffect, useState } from "react";

import SummaryCards from "./SummaryCards";
import NextAppointmentCard from "./NextAppointmentCard";
import LatestOrderCard from "./LatestOrderCard";
import LatestPaymentCard from "./LatestPaymentCard";
import QuickActions from "./QuickActions";
import WelcomeCard from "./WelcomeCard";

export default function AccountDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {
    try {
      const res = await fetch("/api/account/summary");

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setSummary(data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p className="p-8">Loading dashboard...</p>;
  }

  return (
    <div className="space-y-8">
      <WelcomeCard profile={summary.profile} />

      <SummaryCards summary={summary} />

      <div className="grid gap-6 lg:grid-cols-3">
        <NextAppointmentCard appointment={summary.next_appointment} />

        <LatestOrderCard order={summary.latest_order} />

        <LatestPaymentCard payment={summary.latest_payment} />
      </div>

      <QuickActions />
    </div>
  );
}
