"use client";

import NavBarCart from "@/components/NavBarCart";
import PaymentPlan from "@/components/PaymentPlan";
import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState(null);

  async function loadOrders() {
    const res = await fetch("/api/orders");

    if (!res.ok) {
      setOrders([]);
      setError("Failed to load orders. Please try again.");
      setLoading(false);
      return;
    }

    const text = await res.text();
    if (!text) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setOrders(JSON.parse(text));
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handlePaystack(orderId) {
    const res = await fetch("/api/paystack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });

    const data = await res.json();
    window.location.href = data.data.authorization_url;
  }

  async function submitReceipt(orderId) {
    if (!receipt) return alert("Please upload receipt");

    const formData = new FormData();
    formData.append("orderId", orderId);
    formData.append("receipt", receipt);

    const res = await fetch("/api/orders/receipt", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      alert("Receipt uploaded. Awaiting confirmation.");
      setSelectedOrder(null);
      loadOrders();
    }
  }

  if (loading) {
    return <p>Loading orders...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (orders.length === 0) {
    return <p>No orders found.</p>;
  }

  return (
    <div>
      <header>
        <NavBarCart />
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-3xl font-bold">My Orders</h1>

        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white border rounded-2xl p-6 space-y-4"
          >
            {/* Order Header */}
            <div className="flex items-center justify-between">
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
                <span
                  className={`text-sm px-3 py-1 rounded-full ${
                    order.status === "paid"
                      ? "bg-green-100 text-green-700"
                      : order.status === "awaiting_confirmation"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
            <PaymentPlan order={order} />

            {/* Payment Options */}
            {order.status === "pending" && (
              <div className="space-y-3">
                <button
                  onClick={() => handlePaystack(order.id)}
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

            {/* Mobile Transfer Section */}
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
                  className="w-full"
                />

                <button
                  onClick={() => submitReceipt(order.id)}
                  className="w-full py-2 bg-black text-white rounded-lg"
                >
                  Upload Receipt
                </button>
              </div>
            )}

            {/* Paid */}
            {order.status === "paid" && (
              <p className="text-green-600 font-semibold">
                Thank you for your payment
              </p>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}
