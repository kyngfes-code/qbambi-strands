"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function UserOrders({ orders }) {
  const [openOrderId, setOpenOrderId] = useState(null);

  if (!orders || orders.length === 0) {
    return <p className="text-gray-500">No orders yet</p>;
  }

  return (
    <section className="w-full max-w-5xl mt-16 px-4">
      <h2 className="text-2xl font-bold text-pink-700 mb-4">Recent Orders</h2>

      <div className="grid gap-4">
        {orders.map((order, index) => {
          const isOpen = openOrderId === order.id;

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-xl shadow p-4"
            >
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>

                  <p className="text-sm text-gray-500">
                    ₦{order.total_amount?.toLocaleString()} • {order.status}
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setOpenOrderId(isOpen ? null : order.id)}
                >
                  {isOpen ? "Close" : "View"}
                </Button>
              </div>

              {/* Expanded Details */}
              {isOpen && (
                <div className="mt-6 space-y-4 border-t pt-4">
                  <h3 className="font-semibold text-lg">Order Items</h3>

                  {order.order_items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 items-center border rounded-xl p-3"
                    >
                      <img
                        src={item.store?.image}
                        alt={item.store?.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />

                      <div className="flex-1">
                        <p className="font-medium">{item.store?.title}</p>

                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>

                        <p className="text-sm text-gray-500">
                          ₦{item.price?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
