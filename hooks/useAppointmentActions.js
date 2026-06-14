"use client";

import { useState } from "react";

export default function useAppointmentActions(refreshDashboard) {
  const [pricingLoading, setPricingLoading] = useState(false);
  const [completionLoading, setCompletionLoading] = useState(false);
  const [settlingPayment, setSettlingPayment] = useState(false);
  const [cancellationLoading, setCancellationLoading] = useState(false);

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

      alert("Pricing has been saved successfully.");

      await refreshDashboard();

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

      alert("Payment confirmed successfully.");

      await refreshDashboard();
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

      alert("Payment rejected.");

      await refreshDashboard();
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

      alert("Appointment completed.");

      await refreshDashboard();

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

      onSuccess?.(data);

      alert(
        data.fullySettled
          ? "Outstanding balance fully settled."
          : "Payment recorded successfully.",
      );
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

      alert("Appointment cancelled.");

      await refreshDashboard();

      onSuccess?.();
    } catch (error) {
      console.error(error);

      alert(error.message || "Failed to cancel appointment.");
    } finally {
      setCancellationLoading(false);
    }
  }

  return {
    pricingLoading,
    completionLoading,
    settlingPayment,
    cancellationLoading,

    handleSetPricing,
    handleConfirmPayment,
    handleRejectPayment,
    handleCompleteAppointment,
    handleSettleOutstanding,
    handleCancelAppointment,
  };
}
