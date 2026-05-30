"use client";

import { useEffect, useState } from "react";

import PaymentPlansTable from "@/components/PaymentPlansTable";
import PaymentHistoryTable from "@/components/PaymentHistoryTable";
import OverdueInstalmentsTable from "@/components/OverdueInstalmentsTable";
import AdminOverviewStats from "@/components/AdminOverviewStats";
import PendingConfirmationsTable from "@/components/PendingConfirmationsTable";
import NavBarAdmin from "@/components/NavBarAdmin";
import DeliveredOrdersTable from "@/components/DeliveredOrdersTable";

export default function AdminOrdersPage() {
  const [overview, setOverview] = useState(null);
  const [plans, setPlans] = useState([]);
  const [history, setHistory] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [pending, setPending] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ fetch all admin data
  async function loadAdminData() {
    try {
      setLoading(true);

      const [o, p, h, d, pend, delivered] = await Promise.all([
        fetch("/api/admin/overview").then((r) => r.json()),
        fetch("/api/admin/payment-plans").then((r) => r.json()),
        fetch("/api/admin/payment-history").then((r) => r.json()),
        fetch("/api/admin/overdue-instalments").then((r) => r.json()),
        fetch("/api/admin/pending-confirmations").then((r) => r.json()),
        fetch("/api/admin/delivered-orders").then((r) => r.json()),
      ]);

      setOverview(o);
      setPlans(p);
      setHistory(h);
      setOverdue(d);
      setPending(pend);
      setDeliveredOrders(delivered);
    } catch (error) {
      console.error("Failed to load admin dashboard:", error);
      alert("Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  // ✅ confirm payment handler
  const confirmPayment = async (orderId, paymentMethod) => {
    try {
      const res = await fetch("/api/admin/confirm-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          paymentMethod,
        }),
      });

      if (!res.ok) {
        throw new Error("Payment confirmation failed");
      }

      // refresh pending + stats
      await loadAdminData();
    } catch (error) {
      console.error(error);
      alert("Failed to confirm payment");
    }
  };

  // ✅ confirm instalment payment
  const confirmInstalmentPayment = async ({ orderId, instalmentId }) => {
    try {
      const res = await fetch("/api/admin/confirm-instalment-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          instalmentId,
        }),
      });

      if (!res.ok) {
        throw new Error("Instalment confirmation failed");
      }

      // refresh dashboard
      await loadAdminData();
    } catch (error) {
      console.error(error);
      alert("Failed to confirm instalment");
    }
  };

  //view order handler
  const viewOrder = async (orderId) => {
    const res = await fetch(`/api/admin/orders/${orderId}`);

    if (!res.ok) {
      alert("Failed to load order");
      return;
    }

    const data = await res.json();

    setSelectedOrder(data);
  };

  //confirm delivery handler
  const confirmDelivery = async (orderId) => {
    try {
      const res = await fetch("/api/admin/confirm-delivery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
        }),
      });

      if (!res.ok) {
        throw new Error("Delivery confirmation failed");
      }

      await loadAdminData();
    } catch (error) {
      console.error(error);
      alert("Failed to confirm delivery");
    }
  };

  if (loading) {
    return <p className="p-6">Loading admin dashboard...</p>;
  }

  return (
    <>
      <div className="space-y-8 p-6">
        <AdminOverviewStats overview={overview} />

        <section>
          <h2 className="font-bold text-xl mb-3">Payment Plans</h2>
          <PaymentPlansTable plans={plans} />
        </section>

        <section>
          <h2 className="font-bold text-xl mb-3">Payment History</h2>
          <PaymentHistoryTable history={history} onViewOrder={viewOrder} />
        </section>

        <section>
          <h2 className="font-bold text-xl text-red-600 mb-3">
            Overdue Instalments
          </h2>
          <OverdueInstalmentsTable instalments={overdue} />
        </section>

        <section>
          <h2 className="font-bold text-xl text-orange-600 mb-3">
            Pending Confirmations
          </h2>

          <PendingConfirmationsTable
            orders={pending}
            onConfirm={confirmPayment}
            onConfirmInstalment={confirmInstalmentPayment}
            onConfirmDelivery={confirmDelivery}
            onViewOrder={viewOrder}
          />
        </section>

        <section>
          <h2 className="font-bold text-xl text-green-600 mb-3">
            Delivered Orders
          </h2>

          <DeliveredOrdersTable orders={deliveredOrders} />
        </section>
      </div>
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h2 className="font-bold text-xl">
                Order #{selectedOrder.id.slice(0, 8)}
              </h2>

              <button
                onClick={() => setSelectedOrder(null)}
                className="text-red-500"
              >
                Close
              </button>
            </div>

            <p>Customer: {selectedOrder.users?.name}</p>

            <p>Email: {selectedOrder.users?.email}</p>

            <p>Status: {selectedOrder.status}</p>

            <p>Total: ₦{Number(selectedOrder.total_amount).toLocaleString()}</p>

            <div className="mt-6 space-y-4">
              {selectedOrder.order_items?.map((item) => (
                <div key={item.id} className="border rounded-lg p-3 flex gap-4">
                  <img
                    src={item.store?.image}
                    alt={item.store?.title}
                    className="w-20 h-20 object-cover rounded"
                  />

                  <div>
                    <p className="font-semibold">{item.store?.title}</p>

                    <p>Quantity: {item.quantity}</p>

                    <p>₦{Number(item.price).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
