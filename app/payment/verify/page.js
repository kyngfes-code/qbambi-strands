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

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="max-w-xl mx-auto py-16 px-6">
        <div className="bg-white rounded-xl border p-8 text-center">
          <h1 className="text-xl font-semibold">Verifying payment...</h1>

          <p className="text-neutral-500 mt-3">
            Please wait while we verify your payment.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-xl mx-auto py-16 px-6">
        <div className="bg-white rounded-xl border p-8 text-center">
          <h1 className="text-xl font-semibold text-red-600">
            Verification Failed
          </h1>

          <p className="mt-4 text-neutral-600">{error}</p>

          <button
            onClick={() => router.push("/")}
            className="mt-8 rounded-lg bg-black text-white px-5 py-2"
          >
            Go Home
          </button>
        </div>
      </main>
    );
  }

  const transaction = result.transaction;
  const isAppointment = transaction.entity_type === "appointment";

  return (
    <main className="max-w-xl mx-auto py-16 px-6">
      <div className="bg-white rounded-xl border p-8">
        {result.verified ? (
          <>
            <h1 className="text-2xl font-bold text-green-600">
              Payment Successful
            </h1>

            <p className="mt-3 text-neutral-600">
              Your payment has been verified successfully.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-yellow-600">
              Payment Pending
            </h1>

            <p className="mt-3 text-neutral-600">
              Your payment has been received but is still awaiting confirmation.
            </p>
          </>
        )}

        <div className="mt-8 border rounded-lg p-5 bg-neutral-50 space-y-3">
          <div className="flex justify-between">
            <span>Reference</span>
            <span className="font-medium">{transaction.reference}</span>
          </div>

          <div className="flex justify-between">
            <span>Amount</span>
            <span className="font-medium">
              ₦{Number(transaction.amount).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Payment Type</span>
            <span className="capitalize">
              {transaction.payment_type.replaceAll("_", " ")}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Status</span>
            <span className="capitalize font-medium">{transaction.status}</span>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={() =>
              router.push(
                isAppointment
                  ? `/account/appointments/${transaction.entity_id}`
                  : "/account/orders",
              )
            }
            className="rounded-lg bg-black text-white px-5 py-2"
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
