"use client";

import { useEffect, useState } from "react";

import PaymentPlansTable from "@/components/PaymentPlansTable";
import PaymentHistoryTable from "@/components/PaymentHistoryTable";
import OverdueInstalmentsTable from "@/components/OverdueInstalmentsTable";
import AdminOverviewStats from "@/components/AdminOverviewStats";
import PendingConfirmationsTable from "@/components/PendingConfirmationsTable";

export default function AdminOrdersPage() {
  const [overview, setOverview] = useState(null);
  const [plans, setPlans] = useState([]);
  const [history, setHistory] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ fetch all admin data
  async function loadAdminData() {
    setLoading(true);

    const [o, p, h, d, pend] = await Promise.all([
      fetch("/api/admin/overview").then((r) => r.json()),
      fetch("/api/admin/payment-plans").then((r) => r.json()),
      fetch("/api/admin/payment-history").then((r) => r.json()),
      fetch("/api/admin/overdue-instalments").then((r) => r.json()),
      fetch("/api/admin/pending-confirmations").then((r) => r.json()),
    ]);

    setOverview(o);
    setPlans(p);
    setHistory(h);
    setOverdue(d);
    setPending(pend);

    setLoading(false);
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  // ✅ confirm payment handler
  const confirmPayment = async (orderId) => {
    await fetch("/api/admin/confirm-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });

    // refresh pending + stats
    loadAdminData();
  };

  if (loading || !overview) {
    return <p>Loading admin dashboard…</p>;
  }

  // ✅ confirm instalment payment
  const confirmInstalmentPayment = async ({ orderId, instalmentId }) => {
    await fetch("/api/admin/confirm-instalment-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, instalmentId }),
    });

    // refresh dashboard
    loadAdminData();
  };

  return (
    <div className="space-y-8">
      {/* OVERVIEW */}
      <AdminOverviewStats overview={overview} />

      {/* PAYMENT PLANS */}
      <section>
        <h2 className="font-bold text-xl">Payment Plans</h2>
        <PaymentPlansTable plans={plans} />
      </section>

      {/* PAYMENT HISTORY */}
      <section>
        <h2 className="font-bold text-xl">Payment History</h2>
        <PaymentHistoryTable history={history} />
      </section>

      {/* OVERDUE */}
      <section>
        <h2 className="font-bold text-xl text-red-600">Overdue Instalments</h2>
        <OverdueInstalmentsTable instalments={overdue} />
      </section>

      {/* PENDING CONFIRMATIONS */}
      <section>
        <h2 className="font-bold text-xl text-orange-600">
          Pending Confirmations
        </h2>

        <PendingConfirmationsTable
          orders={pending}
          onConfirm={confirmPayment}
          onConfirmInstalment={confirmInstalmentPayment}
        />
      </section>
    </div>
  );
}
