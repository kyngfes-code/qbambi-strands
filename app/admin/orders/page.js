"use client";

import { useEffect, useState } from "react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then(setOrders);
  }, []);

  return (
    <div className="p-10 space-y-6">
      <h1 className="text-3xl font-bold">Pending Payments</h1>

      {orders.map((order) => (
        <div key={order.id} className="border p-5 rounded-xl">
          <p>Order #{order.id.slice(0, 8)}</p>
          <p>₦{order.total_amount}</p>

          {order.receipt_url && (
            <a
              href={order.receipt_url}
              target="_blank"
              className="text-blue-600 underline"
            >
              View Receipt
            </a>
          )}

          <div className="mt-3 space-x-3">
            <button
              onClick={() => confirm(order.id)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              Confirm
            </button>

            <button
              onClick={() => reject(order.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
