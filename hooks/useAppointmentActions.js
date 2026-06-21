"use client";

import { useState } from "react";

export default function useAppointmentActions(refreshDashboard) {
  const [pricingLoading, setPricingLoading] = useState(false);
  const [completionLoading, setCompletionLoading] = useState(false);
  const [settlingPayment, setSettlingPayment] = useState(false);
  const [cancellationLoading, setCancellationLoading] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);

  /*
  ==========================================
  Set Appointment Pricing
  ==========================================
  */

  async function handleSetPricing({
    appointmentId,
    serviceAmount,
    depositRequired,
    adminNotes,
    onSuccess,
  }) {
    try {
      setPricingLoading(true);

      const res = await fetch("/api/admin/appointments/pricing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId,
          serviceAmount,
          depositRequired,
          adminNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to set pricing");
      }

      await refreshDashboard();
      alert("Pricing has been saved successfully.");
      onSuccess?.();
    } catch (error) {
      console.error(error);

      alert(error.message || "Failed to set pricing.");
    } finally {
      setPricingLoading(false);
    }
  }

  /*
  ==========================================
  Confirm Payment
  ==========================================
  */

  async function handleConfirmPayment(paymentId) {
    const confirmed = window.confirm("Confirm this payment?");

    if (!confirmed) return;

    try {
      const res = await fetch("/api/admin/appointment-payments/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to confirm payment");
      }

      await refreshDashboard();
      alert("Payment confirmed successfully.");
    } catch (error) {
      console.error(error);

      alert(error.message || "Payment confirmation failed.");
    }
  }

  /*
  ==========================================
  Reject Payment
  ==========================================
  */

  async function handleRejectPayment(paymentId) {
    const reason = window.prompt("Enter rejection reason:");

    if (!reason?.trim()) {
      return;
    }

    try {
      const res = await fetch("/api/admin/appointment-payments/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId,
          rejectionReason: reason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reject payment");
      }

      await refreshDashboard();
      alert("Payment rejected.");
    } catch (error) {
      console.error(error);

      alert(error.message || "Failed to reject payment.");
    }
  }

  /*
  ==========================================
  Complete Appointment
  ==========================================
  */

  async function handleCompleteAppointment(payload, onSuccess) {
    const confirmed = window.confirm("Mark this appointment as completed?");

    if (!confirmed) return;

    try {
      setCompletionLoading(true);

      const res = await fetch("/api/admin/appointments/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to complete appointment");
      }

      await refreshDashboard();
      alert("Appointment completed.");
      onSuccess?.();
    } catch (error) {
      console.error(error);

      alert(error.message || "Failed to complete appointment.");
    } finally {
      setCompletionLoading(false);
    }
  }

  /*
  ==========================================
  Settle Outstanding Balance
  ==========================================
  */

  async function handleSettleOutstanding(payload, onSuccess) {
    try {
      setSettlingPayment(true);

      const res = await fetch("/api/admin/appointments/settle-outstanding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to settle payment.");
      }

      await refreshDashboard();

      alert(
        data.fullySettled
          ? "Outstanding balance fully settled."
          : "Payment recorded successfully.",
      );

      onSuccess?.(data);
    } catch (err) {
      console.error(err);

      alert(err.message);
    } finally {
      setSettlingPayment(false);
    }
  }

  /*
  ==========================================
  Cancel Appointment
  ==========================================
  */

  async function handleCancelAppointment(payload, onSuccess) {
    try {
      setCancellationLoading(true);

      const res = await fetch("/api/admin/appointments/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel appointment");
      }

      await refreshDashboard();
      alert("Appointment cancelled.");
      onSuccess?.();
    } catch (error) {
      console.error(error);

      alert(error.message || "Failed to cancel appointment.");
    } finally {
      setCancellationLoading(false);
    }
  }

  async function handleRequestRefund(payload, onSuccess) {
    try {
      setRefundLoading(true);

      const res = await fetch("/api/admin/refunds/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create refund request");
      }

      alert("Refund request created successfully.");

      await refreshDashboard();

      onSuccess?.(data);
    } catch (error) {
      console.error(error);

      alert(error.message || "Failed to create refund request.");
    } finally {
      setRefundLoading(false);
    }
  }

  return {
    pricingLoading,
    completionLoading,
    settlingPayment,
    cancellationLoading,
    refundLoading,

    handleSetPricing,
    handleConfirmPayment,
    handleRejectPayment,
    handleCompleteAppointment,
    handleSettleOutstanding,
    handleCancelAppointment,
    handleRequestRefund,
  };
}
