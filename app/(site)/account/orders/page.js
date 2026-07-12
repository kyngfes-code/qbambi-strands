"use client";

import { useEffect, useState } from "react";
import NavBarCart from "@/components/NavBarCart";
import OfflineNotice from "@/components/OfflineNotice";
import { useOnlineStatus } from "@/app/OnlineStatusProvider";

import OrderCard from "@/components/orders/OrderCard";

import CustomerOrderDetailsModal from "@/components/admin/order/CustomerOrderDetailsModal";
import OrderRefundRequestModal from "@/components/refunds/OrderRefundRequestModal";
import PageSpinner from "@/components/PageSpinner";

export default function OrdersPage() {
  const isOnline = useOnlineStatus();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refundOrder, setRefundOrder] = useState(null);

  async function loadOrders() {
    try {
      setError(null);

      const res = await fetch("/api/orders");

      if (!res.ok) {
        throw new Error("Failed to load orders");
      }

      const data = await res.json();

      setOrders(data ?? []);

      return data ?? [];
    } catch (err) {
      console.error(err);
      setOrders([]);
      setError("Failed to load orders");
      return [];
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isOnline) {
      setLoading(false);
      return;
    }

    setLoading(true);
    loadOrders();
  }, [isOnline]);

  async function handleRefundRequest(refundData) {
    try {
      const res = await fetch("/api/orders/request-refund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(refundData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit refund request.");
      }

      alert("Refund request submitted successfully.");

      setRefundOrder(null);

      await loadOrders();

      const updated = orders.find((o) => o.id === refundData.orderId);

      if (updated) {
        setSelectedOrder(updated);
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  if (!isOnline) return <OfflineNotice />;

  if (loading)
    return (
      <div className="min-h-screen bg-neutral-50">
        <NavBarCart />

        <div className="mt-20">
          <PageSpinner text="Loading orders..." />
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-neutral-50">
        <NavBarCart />
        <p className="mt-20 text-center text-red-500">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold">My Orders</h1>

          <p className="mt-2 text-neutral-500">
            View your orders, payment history and delivery progress.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border bg-white p-12 text-center">
            No orders found.
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onReload={loadOrders}
                onOpenOrder={setSelectedOrder}
                onRefund={setRefundOrder}
              />
            ))}
          </div>
        )}
      </main>

      <CustomerOrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onRequestRefund={setRefundOrder}
      />

      <OrderRefundRequestModal
        order={refundOrder}
        isOpen={!!refundOrder}
        onClose={() => setRefundOrder(null)}
        onSubmit={handleRefundRequest}
      />
    </div>
  );
}
