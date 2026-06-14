"use client";

import { useState } from "react";

export default function PaystackButton({
  appointmentId,
  label = "Pay with Paystack",
  className = "",
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);

  async function handlePaystackPayment() {
    try {
      setLoading(true);

      const res = await fetch("/api/appointments/paystack/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize Paystack payment");
      }

      /*
      Expected response:

      {
        authorization_url: "...",
      }
      */

      if (!data.authorization_url) {
        throw new Error("Missing Paystack authorization URL.");
      }

      /*
      Redirect customer to Paystack
      */

      window.location.href = data.authorization_url;

      /*
      This won't usually execute because
      Paystack redirects away.
      */

      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error) {
      console.error("Paystack error:", error);

      alert(error.message || "Unable to initialize Paystack payment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handlePaystackPayment}
      disabled={loading}
      className={`
        px-5 py-3
        rounded-xl
        bg-green-600
        text-white
        font-medium
        transition
        hover:bg-green-700
        disabled:opacity-50
        disabled:cursor-not-allowed
        w-full sm:w-auto
        ${className}
      `}
    >
      {loading ? "Redirecting..." : label}
    </button>
  );
}
