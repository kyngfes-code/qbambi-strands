"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import OfflineNotice from "@/components/OfflineNotice";

import { getUserCart } from "@/lib/data-service";
import { useOnlineStatus } from "@/app/OnlineStatusProvider";

export default function Page() {
  const isOnline = useOnlineStatus();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);

  async function loadCart() {
    try {
      const data = await getUserCart();
      setCart(data ?? []);
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
    loadCart();
  }, [isOnline]);

  const total = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0,
    );
  }, [cart]);

  async function updateQty(id, qty) {
    if (qty < 1 || !isOnline) return;

    try {
      setUpdatingId(id);

      await fetch("/api/cart", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          quantity: qty,
        }),
      });

      await loadCart();
    } finally {
      setUpdatingId(null);
    }
  }

  async function removeItem(id) {
    if (!isOnline) return;

    try {
      setUpdatingId(id);

      await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });

      await loadCart();
    } finally {
      setUpdatingId(null);
    }
  }

  async function checkout() {
    try {
      setCheckingOut(true);

      const res = await fetch("/api/orders", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Checkout failed.");
        return;
      }

      window.location.href = "/account/orders";
    } finally {
      setCheckingOut(false);
    }
  }

  if (!isOnline) return <OfflineNotice />;

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Your Cart</h1>

          <p className="mt-2 text-sm text-neutral-500">
            {cart.length} item{cart.length !== 1 && "s"}
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-neutral-500">
            Loading cart...
          </div>
        ) : cart.length === 0 ? (
          <div className="rounded-2xl border bg-white py-20 text-center">
            <h2 className="text-xl font-semibold">Your cart is empty</h2>

            <p className="mt-3 text-neutral-500">
              Browse the store and add your favourite styles.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-5">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-5 sm:flex-row">
                    <div className="mx-auto sm:mx-0">
                      <Image
                        src={item.store.image}
                        alt={item.store.title}
                        width={140}
                        height={140}
                        className="h-32 w-32 rounded-xl object-cover sm:h-36 sm:w-36"
                      />
                    </div>

                    <div className="flex flex-1 flex-col">
                      <div>
                        <h2 className="text-lg font-semibold">
                          {item.store.title}
                        </h2>

                        <p className="mt-2 text-lg font-bold">
                          ₦{Number(item.price).toLocaleString()}
                        </p>
                      </div>

                      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="flex w-fit items-center overflow-hidden rounded-lg border">
                          <button
                            disabled={updatingId === item.id}
                            onClick={() =>
                              updateQty(item.id, item.quantity - 1)
                            }
                            className="px-4 py-2 hover:bg-neutral-100 disabled:opacity-50"
                          >
                            −
                          </button>

                          <span className="min-w-[48px] text-center">
                            {item.quantity}
                          </span>

                          <button
                            disabled={updatingId === item.id}
                            onClick={() =>
                              updateQty(item.id, item.quantity + 1)
                            }
                            className="px-4 py-2 hover:bg-neutral-100 disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-sm text-neutral-500">
                          Subtotal:
                          <span className="ml-2 font-semibold text-black">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>

                        <button
                          disabled={updatingId === item.id}
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:underline sm:ml-auto disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="sticky bottom-0 mt-8 rounded-2xl border bg-white p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total</span>

                <span className="text-2xl font-bold">
                  ₦{total.toLocaleString()}
                </span>
              </div>

              <button
                disabled={checkingOut}
                onClick={checkout}
                className="mt-5 w-full rounded-xl bg-black py-4 text-lg font-medium text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {checkingOut ? "Processing..." : "Checkout"}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
