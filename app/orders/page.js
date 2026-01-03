"use client";

import { useEffect, useState } from "react";
import NavBarCart from "@/components/NavBarCart";
import PaymentPlan from "@/components/PaymentPlan";
import OfflineNotice from "@/components/OfflineNotice";
import { useOnlineStatus } from "../OnlineStatusProvider";

export default function OrdersPage() {
  const isOnline = useOnlineStatus();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState(null);
  const [uploadingOrderId, setUploadingOrderId] = useState(null);

  async function loadOrders() {
    try {
      setError(null);
      const res = await fetch("/api/orders");

      if (!res.ok) {
        throw new Error("Failed to load orders");
      }

      const data = await res.json();
      setOrders(data || []);
    } catch (err) {
      console.error(err);
      setOrders([]);
      setError("Failed to load orders");
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

  if (!isOnline) {
    return <OfflineNotice />;
  }

  if (loading) {
    return <p className="text-center mt-20">Loading orders…</p>;
  }

  if (error) {
    return <p className="text-center mt-20 text-red-500">{error}</p>;
  }

  if (!orders.length) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <NavBarCart />
        <p className="text-center mt-20">No orders found.</p>
      </div>
    );
  }

  async function handlePaystack(order) {
    if (!isOnline) return;

    const amount =
      order.payment_plan?.next_instalment_amount ?? order.total_amount;

    const res = await fetch("/api/paystack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: order.id,
        amount,
        context: order.payment_plan ? "instalment" : "full",
      }),
    });

    const data = await res.json();
    window.location.href = data.data.authorization_url;
  }

  async function submitReceipt(order) {
    if (!isOnline) return;
    if (!receipt) return alert("Please upload receipt");

    try {
      setUploadingOrderId(order.id);

      const formData = new FormData();
      formData.append("orderId", order.id);

      if (order.payment_plan?.next_instalment_id) {
        formData.append("instalmentId", order.payment_plan.next_instalment_id);
      }

      formData.append("receipt", receipt);

      const res = await fetch("/api/orders/receipt", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      alert("Receipt uploaded. Awaiting confirmation.");
      setSelectedOrder(null);
      setReceipt(null);
      loadOrders();
    } catch (err) {
      console.error(err);
      alert("Failed to upload receipt. Please try again.");
    } finally {
      setUploadingOrderId(null);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <NavBarCart />

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-3xl font-bold">My Orders</h1>

        {orders.map((order) => {
          const canPay =
            order.status === "pending" ||
            (order.status === "payment_plan_active" &&
              order.payment_plan?.status === "active");

          return (
            <div
              key={order.id}
              className="bg-white border rounded-2xl p-6 space-y-4"
            >
              {/* Header */}
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-neutral-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold">
                    ₦{order.total_amount.toLocaleString()}
                  </p>
                  <span className="text-sm px-3 py-1 rounded-full bg-yellow-100">
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Payment Plan */}
              {order.status === "pending" && !order.payment_plan && (
                <PaymentPlan order={order} onPlanCreated={loadOrders} />
              )}

              {/* Payment Actions */}
              {canPay && (
                <div className="space-y-3">
                  <button
                    onClick={() => handlePaystack(order)}
                    className="w-full py-2 bg-black text-white rounded-lg"
                  >
                    Pay with Paystack
                  </button>

                  <button
                    onClick={() =>
                      setSelectedOrder(
                        selectedOrder === order.id ? null : order.id
                      )
                    }
                    className="w-full py-2 border rounded-lg"
                  >
                    Pay via Mobile Transfer
                  </button>
                </div>
              )}

              {/* Mobile Transfer */}
              {selectedOrder === order.id && (
                <div className="border rounded-xl p-4 space-y-3">
                  <p className="font-semibold">Bank Transfer Details</p>

                  <div className="text-sm bg-neutral-100 p-3 rounded-lg">
                    <p>
                      <b>Bank:</b> Access Bank
                    </p>
                    <p>
                      <b>Account Name:</b> QBambi Strands
                    </p>
                    <p>
                      <b>Account Number:</b> 1234567890
                    </p>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setReceipt(e.target.files[0])}
                  />

                  <button
                    onClick={() => submitReceipt(order)}
                    disabled={uploadingOrderId === order.id}
                    className={`w-full py-2 rounded-lg text-white transition ${
                      uploadingOrderId === order.id
                        ? "bg-neutral-400 cursor-not-allowed"
                        : "bg-black"
                    } `}
                  >
                    {uploadingOrderId === order.id
                      ? "Uploading…"
                      : "Upload Receipt"}
                  </button>
                </div>
              )}

              {order.status === "paid" && (
                <p className="text-green-600 font-semibold">
                  Thank you for your payment
                </p>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
