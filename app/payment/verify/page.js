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

  // ==========================================================
  // VERIFY PAYMENT
  // ==========================================================

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
      setLoading(true);
      setError("");

      const res = await fetch(
        `/api/paystack/verify?reference=${encodeURIComponent(reference)}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed.");
      }

      console.log("Paystack Verification Response:", data);

      setResult(data);
    } catch (err) {
      console.error("Payment verification error:", err);

      setError(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-50 px-6 py-20">
        <div className="mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-black" />

          <h1 className="mt-6 text-2xl font-bold text-neutral-900">
            Verifying payment...
          </h1>

          <p className="mt-3 text-neutral-500">
            Please wait while we verify your payment.
          </p>

          <p className="mt-4 break-all text-xs text-neutral-400">
            Reference: {reference || "—"}
          </p>
        </div>
      </main>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <main className="min-h-screen bg-neutral-50 px-6 py-20">
        <div className="mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
            !
          </div>

          <h1 className="mt-5 text-2xl font-bold text-red-600">
            Verification Failed
          </h1>

          <p className="mt-4 text-neutral-600">{error}</p>

          {reference && (
            <p className="mt-4 break-all text-xs text-neutral-400">
              Reference: {reference}
            </p>
          )}

          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={() => router.push("/account")}
              className="rounded-lg bg-black px-5 py-2 text-white"
            >
              My Account
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

  // ==========================================================
  // NO RESULT
  // ==========================================================

  if (!result) {
    return null;
  }

  const transaction = result.transaction ?? null;

  // ==========================================================
  // TRANSACTION TYPE
  // ==========================================================

  const entityType = transaction?.entity_type ?? null;

  const isAppointment = entityType === "appointment";

  const isOrder = entityType === "order" || entityType === "orders";

  const isAcademy =
    entityType === "academy" ||
    entityType === "academy_enrollment" ||
    entityType === "academy_payment";

  // ==========================================================
  // PAYMENT STATUS
  // ==========================================================

  const isVerified = result.verified === true;

  const pageTitle = isVerified ? "Payment Successful" : "Payment Pending";

  const pageDescription = isVerified
    ? isAcademy
      ? "Your Academy payment has been verified successfully."
      : "Your payment has been verified successfully."
    : "Your payment has been received and is awaiting confirmation.";

  // ==========================================================
  // PAYMENT TYPE DISPLAY
  // ==========================================================

  const paymentType = transaction?.payment_type
    ? transaction.payment_type.replaceAll("_", " ")
    : isAcademy
      ? "Academy Payment"
      : "-";

  // ==========================================================
  // AMOUNT
  // ==========================================================

  const amount = Number(transaction?.amount ?? 0);

  const formattedAmount = Number.isFinite(amount)
    ? `₦${amount.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "₦0.00";

  // ==========================================================
  // VERIFIED BUT NO TRANSACTION
  // ==========================================================

  if (!transaction) {
    return (
      <main className="min-h-screen bg-neutral-50 px-6 py-20">
        <div className="mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center shadow-sm">
          <div
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
              isVerified
                ? "bg-green-100 text-green-600"
                : "bg-yellow-100 text-yellow-600"
            }`}
          >
            {isVerified ? "✓" : "!"}
          </div>

          <h1
            className={`mt-5 text-2xl font-bold ${
              isVerified ? "text-green-600" : "text-yellow-600"
            }`}
          >
            {pageTitle}
          </h1>

          <p className="mt-4 text-neutral-600">
            {isVerified
              ? "Your payment was verified, but we couldn't retrieve the transaction details."
              : "Your payment has not yet been fully verified. Please check again in a few moments."}
          </p>

          <div className="mt-8 rounded-xl border bg-neutral-50 p-5 text-left">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-neutral-500">
                Payment Reference
              </span>

              <span className="break-all font-medium text-neutral-900">
                {reference || "—"}
              </span>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={() =>
                router.push(
                  isAcademy ? "/academy/dashboard" : "/account/orders",
                )
              }
              className="rounded-lg bg-black px-5 py-2 text-white"
            >
              {isAcademy ? "Academy Dashboard" : "My Orders"}
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

  // ==========================================================
  // DESTINATION
  // ==========================================================

  function handleContinue() {
    // Academy payment
    if (isAcademy) {
      router.push("/academy/dashboard");
      return;
    }

    // Appointment payment
    if (isAppointment && transaction.entity_id) {
      router.push(`/account/appointments/${transaction.entity_id}`);
      return;
    }

    // Order payment
    if (isOrder) {
      router.push("/account/orders");
      return;
    }

    // Safe fallback
    router.push("/account");
  }

  // ==========================================================
  // BUTTON TEXT
  // ==========================================================

  const continueButtonText = isAcademy
    ? "Academy Dashboard"
    : isAppointment
      ? "View Appointment"
      : isOrder
        ? "View Orders"
        : "My Account";

  // ==========================================================
  // SUCCESS
  // ==========================================================

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-20">
      <div className="mx-auto max-w-xl rounded-2xl border bg-white p-8 shadow-sm">
        {/* ==================================================
            STATUS
        ================================================== */}

        <div className="text-center">
          <div
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
              isVerified
                ? "bg-green-100 text-green-600"
                : "bg-yellow-100 text-yellow-600"
            }`}
          >
            {isVerified ? "✓" : "!"}
          </div>

          <h1
            className={`mt-5 text-2xl font-bold ${
              isVerified ? "text-green-600" : "text-yellow-600"
            }`}
          >
            {pageTitle}
          </h1>

          <p className="mt-3 text-neutral-600">{pageDescription}</p>
        </div>

        {/* ==================================================
            ACADEMY NOTICE
        ================================================== */}

        {isAcademy && isVerified && (
          <div className="mt-6 rounded-xl border border-[#C6A667]/30 bg-[#faf7f1] p-5">
            <p className="font-semibold text-neutral-900">Q-bambi Academy</p>

            <p className="mt-1 text-sm text-neutral-600">
              Your Academy payment has been recorded successfully. You can
              continue to your student dashboard.
            </p>
          </div>
        )}

        {/* ==================================================
            PAYMENT DETAILS
        ================================================== */}

        <div className="mt-8 space-y-4 rounded-xl border bg-neutral-50 p-5">
          {/* Reference */}

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-neutral-500">Reference</span>

            <span className="break-all font-medium text-neutral-900 sm:text-right">
              {transaction.reference ?? reference ?? "—"}
            </span>
          </div>

          {/* Amount */}

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-neutral-500">Amount</span>

            <span className="font-semibold text-neutral-900">
              {formattedAmount}
            </span>
          </div>

          {/* Payment Type */}

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-neutral-500">Payment Type</span>

            <span className="capitalize font-medium text-neutral-900">
              {paymentType}
            </span>
          </div>

          {/* Entity Type */}

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-neutral-500">Transaction</span>

            <span className="font-medium capitalize text-neutral-900">
              {isAcademy
                ? "Academy Enrollment"
                : isAppointment
                  ? "Appointment"
                  : isOrder
                    ? "Order"
                    : "Account Payment"}
            </span>
          </div>

          {/* Status */}

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-neutral-500">Status</span>

            <span
              className={`font-medium capitalize ${
                isVerified ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {transaction.status ?? "pending"}
            </span>
          </div>
        </div>

        {/* ==================================================
            ACADEMY PAYMENT DETAILS
        ================================================== */}

        {isAcademy && (
          <div className="mt-6 rounded-xl border p-5">
            <h2 className="font-semibold text-neutral-900">Academy Payment</h2>

            <div className="mt-4 space-y-3 text-sm">
              {transaction.enrollment_id && (
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500">Enrollment</span>

                  <span className="font-medium">
                    {transaction.enrollment_id}
                  </span>
                </div>
              )}

              {transaction.payment_plan_id && (
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500">Payment Plan</span>

                  <span className="font-medium">
                    {transaction.payment_plan_id}
                  </span>
                </div>
              )}

              {transaction.amount && (
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500">Amount Paid</span>

                  <span className="font-semibold">{formattedAmount}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================
            ACTIONS
        ================================================== */}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleContinue}
            className="flex-1 rounded-lg bg-black px-5 py-3 text-center font-medium text-white transition hover:bg-neutral-800"
          >
            {continueButtonText}
          </button>

          <button
            onClick={() => router.push("/")}
            className="flex-1 rounded-lg border border-neutral-300 px-5 py-3 font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            Home
          </button>
        </div>
      </div>
    </main>
  );
}
