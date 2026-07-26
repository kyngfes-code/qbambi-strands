"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AppointmentSummaryCard from "@/components/account/AppointmentSummaryCard";
import FinancialSummaryCard from "@/components/account/FinancialSummaryCard";
import PaymentHistoryTimeline from "@/components/account/PaymentHistoryTimeline";
import RefundRequestsCard from "@/components/account/RefundRequestsCard";
import PricingHistoryCard from "@/components/account/PricingHistoryCard";
import { useParams } from "next/navigation";
import PaymentMethodSelector from "@/components/payments/PaymentMethodSelector";
import AppointmentRefundRequestModal from "@/components/refunds/AppointmentRefundRequestModal";
import CollapsibleCard from "@/components/CollapsibleCard";
import { toast } from "sonner";

export default function AppointmentDetailsPage() {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);

  const { id } = useParams();

  useEffect(() => {
    if (id) {
      loadAppointment(id);
    }
  }, [id]);

  async function loadAppointment() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/account/appointments/${id}`);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load appointment.");
      }

      setAppointment(data.appointment);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center">
        <p className="text-neutral-500">Loading appointment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8">
        <h2 className="font-semibold text-red-700">
          Unable to load appointment
        </h2>

        <p className="mt-2 text-red-600">{error}</p>

        <Link
          href="/account/appointments"
          className="mt-6 inline-flex rounded-lg border px-4 py-2 hover:bg-white"
        >
          Back to Appointments
        </Link>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center">
        Appointment not found.
      </div>
    );
  }

  async function handleRefundRequest(payload) {
    try {
      setRefundLoading(true);

      const res = await fetch("/api/account/appointments/request-refunds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit refund request.");
      }

      toast.success("Refund request submitted successfully.");

      await loadAppointment();

      setRefundModalOpen(false);

      return data;
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
      throw err; // optional, if you want the modal to know about the error
    } finally {
      setRefundLoading(false);
    }
  }

  const details = appointment.appointment;
  const financial = appointment.financial_summary;
  const payments = appointment.payment_history ?? [];
  const refunds = appointment.refund_requests ?? [];
  const pricingHistory = appointment.pricing_history ?? [];

  const hasMadeDeposit = Number(financial.total_paid || 0) > 0;

  const paymentType =
    details.status === "completed"
      ? "outstanding_payment"
      : hasMadeDeposit
        ? "outstanding_payment"
        : "deposit";

  const canMakePayment =
    Number(financial?.balance_due || 0) > 0 &&
    (details.status === "pending" || details.status === "completed") &&
    details.payment_completion_status !== "fully_paid";

  const paymentAmount =
    details.status === "completed"
      ? Number(financial.balance_due || 0)
      : paymentType === "deposit"
        ? Number(details.deposit_required || 0)
        : Number(financial.balance_due || 0);

  const amountPaid = Number(details.amount_paid || 0);

  const refundedAmount = Number(details.refunded_amount || 0);

  const refundableBalance = Math.max(amountPaid - refundedAmount, 0);

  const pendingRefundRequest = refunds.find((r) => r.status === "pending");
  const canRequestRefund =
    refundableBalance > 0 &&
    details.status === "completed" &&
    !pendingRefundRequest;

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{details.service_name}</h1>

          <p className="mt-1 text-neutral-500">Appointment Details</p>
        </div>

        <Link
          href="/account/appointments"
          className="inline-flex items-center justify-center rounded-lg border px-5 py-2 hover:bg-neutral-50"
        >
          ← Back to Appointments
        </Link>
      </div>

      {/* Appointment */}

      <AppointmentSummaryCard appointment={details} />

      {/* Financial */}

      <FinancialSummaryCard summary={financial} />

      <div className="flex justify-end">
        {pendingRefundRequest ? (
          <button
            disabled
            className="cursor-not-allowed rounded-xl bg-amber-100 px-5 py-3 font-medium text-amber-700"
          >
            Refund Request Processing
          </button>
        ) : (
          canRequestRefund && (
            <button
              onClick={() => setRefundModalOpen(true)}
              className="rounded-xl bg-orange-600 px-5 py-3 text-white hover:bg-orange-700"
            >
              Request Refund
            </button>
          )
        )}
      </div>

      {/* Payment Methods */}

      {canMakePayment && (
        <PaymentMethodSelector
          amount={paymentAmount}
          entityType="appointment"
          entityId={details.id}
          paymentType={paymentType}
          onUploadReceipt={() => loadAppointment()}
        />
      )}

      {/* Payment Timeline */}

      <CollapsibleCard
        title="Payment History"
        description="View all payments, refunds and adjustments."
      >
        <PaymentHistoryTimeline payments={payments} />
      </CollapsibleCard>

      {/* Refund Requests */}

      <RefundRequestsCard refunds={refunds} />

      {/* Pricing History */}

      <CollapsibleCard
        title="Pricing History"
        description="View every pricing change made to this appointment."
      >
        <PricingHistoryCard history={pricingHistory} />
      </CollapsibleCard>

      <AppointmentRefundRequestModal
        appointment={appointment}
        isOpen={refundModalOpen}
        loading={refundLoading}
        onClose={() => setRefundModalOpen(false)}
        onSubmit={handleRefundRequest}
      />
    </div>
  );
}
