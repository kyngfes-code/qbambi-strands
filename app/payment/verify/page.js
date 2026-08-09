"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function PaymentVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const reference = searchParams.get("reference");

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reference) {
      setError("Missing payment reference.");
      setLoading(false);
      return;
    }

    verifyPayment();
  }, [reference]);

  async function verifyPayment() {
    try {
      const res = await fetch(`/api/paystack/verify?reference=${reference}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed.");
      }

      console.log("Verification Response:", data);

      setResult(data);
    } catch (err) {
      setError(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="max-w-xl mx-auto py-16 px-6">
        <div className="rounded-xl border bg-white p-8 text-center">
          <h1 className="text-xl font-semibold">Verifying payment...</h1>

          <p className="mt-3 text-neutral-500">
            Please wait while we verify your payment.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-xl mx-auto py-16 px-6">
        <div className="rounded-xl border bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-red-600">
            Verification Failed
          </h1>

          <p className="mt-4 text-neutral-600">{error}</p>

          <button
            onClick={() => router.push("/")}
            className="mt-8 rounded-lg bg-black px-5 py-2 text-white"
          >
            Go Home
          </button>
        </div>
      </main>
    );
  }

  if (!result) {
    return null;
  }

  const transaction = result.transaction ?? null;

  const isAppointment = transaction?.entity_type === "appointment";

  /* ----------------------------------------
     VERIFIED BUT NO TRANSACTION
  ----------------------------------------- */

  if (!transaction) {
    return (
      <main className="max-w-xl mx-auto py-16 px-6">
        <div className="rounded-xl border bg-white p-8 text-center">
          <h1
            className={`text-2xl font-bold ${
              result.verified ? "text-green-600" : "text-yellow-600"
            }`}
          >
            {result.verified ? "Payment Successful" : "Payment Pending"}
          </h1>

          <p className="mt-4 text-neutral-600">
            {result.verified
              ? "Your payment was verified, but we couldn't retrieve the transaction details."
              : "Your payment has not yet been fully verified. Please check again in a few moments."}
          </p>

          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={() => router.push("/account/orders")}
              className="rounded-lg bg-black px-5 py-2 text-white"
            >
              My Orders
            </button>

            <button
              onClick={() => router.push("/")}
              className="rounded-lg border px-5 py-2"
            >
              Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* ----------------------------------------
     FULL SUCCESS
  ----------------------------------------- */

  return (
    <main className="max-w-xl mx-auto py-16 px-6">
      <div className="rounded-xl border bg-white p-8">
        <h1
          className={`text-2xl font-bold ${
            result.verified ? "text-green-600" : "text-yellow-600"
          }`}
        >
          {result.verified ? "Payment Successful" : "Payment Pending"}
        </h1>

        <p className="mt-3 text-neutral-600">
          {result.verified
            ? "Your payment has been verified successfully."
            : "Your payment has been received and is awaiting confirmation."}
        </p>

        <div className="mt-8 space-y-3 rounded-lg border bg-neutral-50 p-5">
          <div className="flex justify-between">
            <span>Reference</span>

            <span className="font-medium">
              {transaction.reference ?? reference}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Amount</span>

            <span className="font-medium">
              ₦{Number(transaction.amount ?? 0).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Payment Type</span>

            <span className="capitalize">
              {(transaction.payment_type ?? "-").replaceAll("_", " ")}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Status</span>

            <span className="font-medium capitalize">
              {transaction.status ?? "-"}
            </span>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={() =>
              router.push(
                isAppointment
                  ? `/account/appointments/${transaction.entity_id}`
                  : "/account/orders",
              )
            }
            className="rounded-lg bg-black px-5 py-2 text-white"
          >
            {isAppointment ? "View Appointment" : "View Orders"}
          </button>

          <button
            onClick={() => router.push("/")}
            className="rounded-lg border px-5 py-2"
          >
            Home
          </button>
        </div>
      </div>
    </main>
  );
}
