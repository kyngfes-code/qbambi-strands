"use client";

import { useEffect, useState } from "react";

import PaymentMethodSelector from "@/components/payments/PaymentMethodSelector";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
}

export default function AcademyPaymentPage() {
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // --------------------------------------------------
  // Load payment context
  // --------------------------------------------------

  async function loadPayment() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/academy/payments", {
        cache: "no-store",
      });

      const result = await response.json();

      // --------------------------------------------------
      // Already enrolled
      // --------------------------------------------------

      if (response.status === 409 && result.redirect) {
        window.location.href = result.redirect;
        return;
      }

      if (!response.ok) {
        throw new Error(result.error || "Unable to load payment information.");
      }

      setData(result);
    } catch (err) {
      console.error("Academy payment load error:", err);

      setError(
        err.message || "Unable to load your academy payment information.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayment();
  }, []);

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="animate-pulse space-y-5">
            <div className="h-8 w-72 rounded bg-neutral-200" />
            <div className="h-24 rounded-2xl bg-neutral-200" />
            <div className="h-48 rounded-2xl bg-neutral-200" />
            <div className="h-64 rounded-2xl bg-neutral-200" />
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-lg font-semibold text-red-900">
              Unable to load payment
            </h1>

            <p className="mt-2 text-sm leading-6 text-red-700">{error}</p>

            <button
              type="button"
              onClick={loadPayment}
              className="mt-5 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // --------------------------------------------------
  // Payment verified
  // --------------------------------------------------

  if (data.state === "payment_verified") {
    const enrollment = data.enrollment;
    const payment = data.payment;

    return (
      <div className="min-h-screen bg-neutral-50 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-medium text-neutral-500">
              Q-bambi Academy
            </p>

            <h1 className="mt-1 text-2xl font-bold">Payment Verification</h1>

            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">
              <h2 className="font-semibold text-green-800">Payment Verified</h2>

              <p className="mt-2 text-sm leading-6 text-green-700">
                Your required payment has been verified successfully. Your
                enrollment is now awaiting final activation by the academy
                administration.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border bg-neutral-50 p-4">
                <p className="text-xs text-neutral-500">Enrollment Number</p>

                <p className="mt-1 font-semibold">
                  {enrollment.enrollmentNumber || "—"}
                </p>
              </div>

              <div className="rounded-xl border bg-neutral-50 p-4">
                <p className="text-xs text-neutral-500">Selected Plan</p>

                <p className="mt-1 font-semibold">{payment.planName}</p>
              </div>

              <div className="rounded-xl border bg-neutral-50 p-4">
                <p className="text-xs text-neutral-500">Amount Paid</p>

                <p className="mt-1 font-semibold">
                  {formatCurrency(payment.amountPaid)}
                </p>
              </div>

              <div className="rounded-xl border bg-neutral-50 p-4">
                <p className="text-xs text-neutral-500">Balance Due</p>

                <p className="mt-1 font-semibold">
                  {formatCurrency(payment.balanceDue)}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border p-5">
              <p className="text-sm font-semibold">What happens next?</p>

              <p className="mt-2 text-sm leading-6 text-neutral-600">
                The academy administration will complete the final activation of
                your enrollment. Once activated, your student dashboard will
                become available.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Payment required
  // --------------------------------------------------

  const enrollment = data.enrollment;
  const payment = data.payment;

  const {
    requiredAmount,
    amountPaid,
    balanceDue,
    totalPayable,
    planName,
    paymentType,
    isInitialPaymentPlan,
  } = payment;

  // --------------------------------------------------
  // Bank transfer receipt
  // --------------------------------------------------

  async function handleUploadReceipt(payload) {
    try {
      setSubmitting(true);

      const response = await fetch(
        `/api/academy/enrollments/${enrollment.id}/payments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...payload,

            amount: requiredAmount,

            paymentMethod: "bank_transfer",

            paymentType,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to submit payment receipt.");
      }

      // Refresh server-calculated payment state
      await loadPayment();

      return result;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        {/* -------------------------------------------------- */}
        {/* Header */}
        {/* -------------------------------------------------- */}

        <div className="mb-8">
          <p className="text-sm font-medium text-neutral-500">
            Q-bambi Academy
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Complete Your Enrollment Payment
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Your academy enrollment has been confirmed. Make the required
            payment below to continue with your enrollment.
          </p>
        </div>

        {/* -------------------------------------------------- */}
        {/* Enrollment Summary */}
        {/* -------------------------------------------------- */}

        <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Enrollment Summary</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border bg-neutral-50 p-4">
              <p className="text-xs text-neutral-500">Student</p>

              <p className="mt-1 font-semibold">
                {enrollment.firstName} {enrollment.lastName}
              </p>
            </div>

            <div className="rounded-xl border bg-neutral-50 p-4">
              <p className="text-xs text-neutral-500">Enrollment Number</p>

              <p className="mt-1 font-semibold">
                {enrollment.enrollmentNumber || "—"}
              </p>
            </div>

            <div className="rounded-xl border bg-neutral-50 p-4">
              <p className="text-xs text-neutral-500">Selected Plan</p>

              <p className="mt-1 font-semibold">{planName}</p>
            </div>

            <div className="rounded-xl border bg-neutral-50 p-4">
              <p className="text-xs text-neutral-500">Payment Type</p>

              <p className="mt-1 font-semibold">
                {isInitialPaymentPlan ? "Initial Deposit" : "Full Payment"}
              </p>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------- */}
        {/* Amount */}
        {/* -------------------------------------------------- */}

        <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">
            Amount Required Now
          </p>

          <p className="mt-2 text-4xl font-bold tracking-tight">
            {formatCurrency(requiredAmount)}
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            {isInitialPaymentPlan
              ? "This is the required initial deposit for your selected payment plan."
              : "This is the remaining amount required to complete your full payment."}
          </p>

          {amountPaid > 0 && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-neutral-50 p-4">
                <p className="text-xs text-neutral-500">Already Paid</p>

                <p className="mt-1 font-semibold">
                  {formatCurrency(amountPaid)}
                </p>
              </div>

              <div className="rounded-xl bg-neutral-50 p-4">
                <p className="text-xs text-neutral-500">Total Payable</p>

                <p className="mt-1 font-semibold">
                  {formatCurrency(totalPayable)}
                </p>
              </div>
            </div>
          )}

          <div className="mt-4 rounded-xl bg-neutral-50 p-4">
            <p className="text-xs text-neutral-500">Account Balance</p>

            <p className="mt-1 font-semibold">{formatCurrency(balanceDue)}</p>
          </div>
        </div>

        {/* -------------------------------------------------- */}
        {/* Important Notice */}
        {/* -------------------------------------------------- */}

        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-semibold text-amber-900">Important</h2>

          <p className="mt-2 text-sm leading-6 text-amber-800">
            Make the required payment to gain access to your student dashboard.
          </p>

          <p className="mt-2 text-sm leading-6 text-amber-800">
            Paystack payments can be automatically verified after a successful
            transaction. Bank transfer payments require academy administration
            to review and verify the submitted receipt.
          </p>

          <p className="mt-2 text-sm leading-6 font-medium text-amber-900">
            Payment verification does not immediately activate your student
            account. Final activation is performed by academy administration.
          </p>
        </div>

        {/* -------------------------------------------------- */}
        {/* Payment Method */}
        {/* -------------------------------------------------- */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
          <PaymentMethodSelector
            amount={requiredAmount}
            entityType="academy_enrollment"
            entityId={enrollment.id}
            paymentType={paymentType}
            onUploadReceipt={handleUploadReceipt}
          />

          {submitting && (
            <p className="mt-4 text-center text-sm text-neutral-500">
              Submitting your payment information...
            </p>
          )}
        </div>

        {/* -------------------------------------------------- */}
        {/* Footer */}
        {/* -------------------------------------------------- */}

        <p className="mt-6 text-center text-xs leading-5 text-neutral-500">
          Your payment information is securely recorded against your academy
          enrollment. Please keep your payment reference or transfer receipt for
          your records.
        </p>
      </div>
    </div>
  );
}
