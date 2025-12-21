"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function UserOrders({ orders }) {
  if (!orders || orders.length === 0) {
    return <p className="text-gray-500">No orders yet</p>;
  }

  return (
    <section className="w-full max-w-5xl mt-16 px-4">
      <h2 className="text-2xl font-bold text-pink-700 mb-4">Recent Orders</h2>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders yet</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-xl shadow p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                <p className="text-sm text-gray-500">
                  ₦{order.total_amount?.toLocaleString()} • {order.status}
                </p>
              </div>

              <Button variant="outline" className="rounded-xl">
                View
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
