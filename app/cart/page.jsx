"use client";

import { useEffect, useState } from "react";
import { getUserCart } from "@/lib/data-service";
import { supabase } from "@/lib/supabase";
import NavBarCart from "@/components/NavBarCart";

export default function Page() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadCart() {
    try {
      const data = await getUserCart();
      setCart(data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function updateQty(id, qty) {
    if (qty < 1) return;

    await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, quantity: qty }),
    });

    loadCart();
  }

  async function removeItem(id) {
    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    loadCart();
  }

  if (loading) return <p className="text-center mt-20">Loading cart…</p>;

  if (cart.length === 0) {
    return <div className="min-h-screen bg-neutral-50">
      <NavBarCart/>
      <p className="text-center mt-20">Your cart is empty</p>;
      </div>
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-neutral-50">
      <NavBarCart />

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Cart</h1>

        <div className="space-y-6">
          {cart.map((item) => (
            <div
              key={item.id}
              className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border p-5 flex gap-5"
            >
              <img
                src={item.store.image}
                alt={item.store.title}
                className="w-28 h-28 object-cover rounded-xl"
              />

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{item.store.title}</h2>
                  <p className="text-sm text-neutral-500">
                    ₦{item.price.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="px-3 py-1 hover:bg-neutral-100"
                    >
                      −
                    </button>
                    <span className="px-4">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="px-3 py-1 hover:bg-neutral-100"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="ml-auto text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-2xl border p-6 flex items-center justify-between">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-bold">₦{total.toLocaleString()}</span>
        </div>

        <div className="max-w-3xl mx-auto">
          <button
            className="w-full bg-black text-white py-4 rounded-xl text-lg hover:opacity-90 transition"
            onClick={async () => {
              const res = await fetch("/api/orders", { method: "POST" });
              const data = await res.json();

              if (!res.ok) {
                alert(data.error || "Checkout failed");
                return;
              }
              window.location.href = "/orders";
            }}
          >
            Checkout
          </button>
        </div>
      </main>
    </div>
  );
}
