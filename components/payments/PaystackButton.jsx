"use client";

import { useState } from "react";

export default function PaystackButton({
  entityType,
  entityId,
  paymentType,
  label = "Pay with Paystack",
  className = "",
}) {
  const [loading, setLoading] = useState(false);

  async function handlePaystackPayment() {
    try {
      setLoading(true);

      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entityType,
          entityId,
          paymentType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize Paystack payment.");
      }

      if (!data.authorizationUrl) {
        throw new Error("Missing Paystack authorization URL.");
      }

      // Redirect customer to Paystack
      window.location.href = data.authorizationUrl;
    } catch (error) {
      console.error("Paystack initialization error:", error);

      alert(
        error.message ||
          "Unable to initialize Paystack payment. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handlePaystackPayment}
      disabled={loading}
      className={`
        w-full
        sm:w-auto
        rounded-xl
        bg-green-600
        px-5
        py-3
        font-medium
        text-white
        transition
        hover:bg-green-700
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${className}
      `}
    >
      {loading ? "Redirecting..." : label}
    </button>
  );
}
