"use client";

import { useEffect, useState } from "react";

import AdminAppointmentStats from "@/components/AdminAppointmentStats";
import AppointmentRequestsTable from "@/components/AppointmentRequestsTable";
import PendingAppointmentPaymentsTable from "@/components/PendingAppointmentPaymentsTable";
import ConfirmedAppointmentsTable from "@/components/ConfirmedAppointmentsTable";
import CompletedAppointmentsTable from "@/components/CompletedAppointmentsTable";
import CancelledAppointmentsTable from "@/components/CancelledAppointmentsTable";
import AppointmentDetailsModal from "@/components/AppointmentDetailsModal";

export default function AdminAppointmentsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [confirmedAppointments, setConfirmedAppointments] = useState([]);
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [cancelledAppointments, setCancelledAppointments] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [pricingAppointment, setPricingAppointment] = useState(null);
  const [cancelAppointment, setCancelAppointment] = useState(null);

  /*
  ==========================================
  Refresh Dashboard
  ==========================================
  */

  async function refreshDashboard() {
    try {
      setLoading(true);
      setError("");

      /*
      --------------------------------------
      Load appointments
      --------------------------------------
      */

      const appointmentsRes = await fetch("/api/admin/appointments");

      if (!appointmentsRes.ok) {
        throw new Error("Failed to load appointments");
      }

      const appointmentsData = await appointmentsRes.json();

      setPendingAppointments(appointmentsData.pending || []);
      setConfirmedAppointments(appointmentsData.confirmed || []);
      setCompletedAppointments(appointmentsData.completed || []);
      setCancelledAppointments(appointmentsData.cancelled || []);

      /*
      --------------------------------------
      Load pending payment confirmations
      --------------------------------------
      */

      const paymentsRes = await fetch("/api/admin/appointment-payments");

      if (!paymentsRes.ok) {
        throw new Error("Failed to load appointment payments");
      }

      const paymentsData = await paymentsRes.json();

      setPendingPayments(paymentsData || []);
    } catch (err) {
      console.error(err);

      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  /*
  ==========================================
  Initial Load
  ==========================================
  */

  useEffect(() => {
    refreshDashboard();
  }, []);

  /*
  ==========================================
  View Appointment Details
  ==========================================
  */

  function handleViewAppointment(appointment) {
    setSelectedAppointment(appointment);
  }

  function handleCloseDetails() {
    setSelectedAppointment(null);
  }

  /*
  ==========================================
  Open Pricing Modal
  ==========================================
  */

  function handleOpenPricing(appointment) {
    setPricingAppointment(appointment);
  }

  /*
  ==========================================
  Open Cancellation Modal
  ==========================================
  */

  function handleOpenCancellation(appointment) {
    setCancelAppointment(appointment);
  }
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
  }) {
    try {
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

      setPricingAppointment(null);

      refreshDashboard();
    } catch (error) {
      console.error(error);

      alert(error.message || "Failed to set pricing.");
    }
  }

  /*
  ==========================================
  Confirm Appointment Payment
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

      refreshDashboard();
    } catch (error) {
      console.error(error);

      alert(error.message || "Payment confirmation failed.");
    }
  }

  /*
  ==========================================
  Reject Appointment Payment
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

      refreshDashboard();
    } catch (error) {
      console.error(error);

      alert(error.message || "Failed to reject payment.");
    }
  }

  /*
  ==========================================
  Confirm Appointment
  ==========================================
  */

  async function handleConfirmAppointment(appointmentId) {
    const confirmed = window.confirm("Confirm this appointment?");

    if (!confirmed) return;

    try {
      const res = await fetch("/api/admin/appointments/confirm", {
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
        throw new Error(data.error || "Failed to confirm appointment");
      }

      alert("Appointment confirmed.");

      refreshDashboard();
    } catch (error) {
      console.error(error);

      alert(error.message || "Failed to confirm appointment.");
    }
  }

  /*
  ==========================================
  Complete Appointment
  ==========================================
  */

  async function handleCompleteAppointment(appointmentId) {
    const confirmed = window.confirm("Mark this appointment as completed?");

    if (!confirmed) return;

    try {
      const res = await fetch("/api/admin/appointments/complete", {
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
        throw new Error(data.error || "Failed to complete appointment");
      }

      alert("Appointment completed.");

      refreshDashboard();
    } catch (error) {
      console.error(error);

      alert(error.message || "Failed to complete appointment.");
    }
  }

  /*
  ==========================================
  Cancel Appointment
  ==========================================
  */

  async function handleCancelAppointment(appointmentId) {
    const reason = window.prompt("Enter cancellation reason:");

    if (!reason?.trim()) {
      return;
    }

    const adminNote = window.prompt("Optional admin note:");

    try {
      const res = await fetch("/api/admin/appointments/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId,
          cancellationReason: reason,
          adminNote: adminNote || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel appointment");
      }

      alert("Appointment cancelled.");

      setCancelAppointment(null);

      refreshDashboard();
    } catch (error) {
      console.error(error);

      alert(error.message || "Failed to cancel appointment.");
    }
  }
  return (
    <div className="min-h-screen px-3 py-4 sm:px-5 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* =====================================
            Page Header
        ====================================== */}
        <div
          className="
            bg-white/80 backdrop-blur-sm
            rounded-2xl shadow-sm border
            p-5 sm:p-6
          "
        >
          <div
            className="
              flex flex-col gap-4
              md:flex-row md:items-center md:justify-between
            "
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Appointment Dashboard
              </h1>

              <p className="text-sm text-gray-500 mt-2">
                Manage appointment requests, payments, confirmations,
                cancellations and completed services.
              </p>
            </div>

            <button
              onClick={refreshDashboard}
              className="
                px-5 py-3
                rounded-xl
                bg-black text-white
                hover:opacity-90
                transition
                w-full sm:w-auto
              "
            >
              Refresh Dashboard
            </button>
          </div>
        </div>

        {/* =====================================
            Error Banner
        ====================================== */}
        {error && (
          <div
            className="
              bg-red-50 border border-red-200
              rounded-2xl
              p-4
              text-red-700
            "
          >
            {error}
          </div>
        )}

        {/* =====================================
            Loading State
        ====================================== */}
        {loading ? (
          <div
            className="
              bg-white rounded-2xl
              p-10
              text-center
              shadow-sm border
            "
          >
            Loading appointment dashboard...
          </div>
        ) : (
          <>
            {/* =====================================
                Dashboard Statistics
            ====================================== */}
            <AdminAppointmentStats
              appointments={[
                ...pendingAppointments,
                ...confirmedAppointments,
                ...completedAppointments,
                ...cancelledAppointments,
              ]}
              pendingPayments={pendingPayments}
            />

            {/* =====================================
                Appointment Requests
            ====================================== */}
            <section
              className="
                bg-white rounded-2xl
                shadow-sm border
                overflow-hidden
              "
            >
              <div className="p-5 border-b">
                <h2 className="text-xl font-bold">Appointment Requests</h2>

                <p className="text-sm text-gray-500 mt-1">
                  New appointments awaiting pricing, payment, or approval.
                </p>
              </div>

              <AppointmentRequestsTable
                appointments={pendingAppointments}
                onView={handleViewAppointment}
                onSetPricing={handleOpenPricing}
                onCancel={handleOpenCancellation}
              />
            </section>

            {/* =====================================
                Pending Payments
            ====================================== */}
            <section
              className="
                bg-white rounded-2xl
                shadow-sm border
                overflow-hidden
              "
            >
              <div className="p-5 border-b">
                <h2 className="text-xl font-bold">
                  Pending Appointment Payments
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Review payment receipts submitted by customers.
                </p>
              </div>

              <PendingAppointmentPaymentsTable
                payments={pendingPayments}
                onConfirm={handleConfirmPayment}
                onReject={handleRejectPayment}
                onViewAppointment={handleViewAppointment}
              />
            </section>

            {/* =====================================
                Confirmed Appointments
            ====================================== */}
            <section
              className="
                bg-white rounded-2xl
                shadow-sm border
                overflow-hidden
              "
            >
              <div className="p-5 border-b">
                <h2 className="text-xl font-bold">Confirmed Appointments</h2>

                <p className="text-sm text-gray-500 mt-1">
                  Customers who have secured their bookings.
                </p>
              </div>

              <ConfirmedAppointmentsTable
                appointments={confirmedAppointments}
                onView={handleViewAppointment}
                onComplete={handleCompleteAppointment}
                onCancel={handleOpenCancellation}
              />
            </section>

            {/* =====================================
                Completed Appointments
            ====================================== */}
            <section
              className="
                bg-white rounded-2xl
                shadow-sm border
                overflow-hidden
              "
            >
              <div className="p-5 border-b">
                <h2 className="text-xl font-bold">Completed Appointments</h2>

                <p className="text-sm text-gray-500 mt-1">
                  Services successfully delivered.
                </p>
              </div>

              <CompletedAppointmentsTable
                appointments={completedAppointments}
                onView={handleViewAppointment}
              />
            </section>

            {/* =====================================
                Cancelled Appointments
            ====================================== */}
            <section
              className="
                bg-white rounded-2xl
                shadow-sm border
                overflow-hidden
              "
            >
              <div className="p-5 border-b">
                <h2 className="text-xl font-bold">Cancelled Appointments</h2>

                <p className="text-sm text-gray-500 mt-1">
                  View cancellations and their reasons.
                </p>
              </div>

              <CancelledAppointmentsTable
                appointments={cancelledAppointments}
                onView={handleViewAppointment}
              />
            </section>
          </>
        )}

        {/* =====================================
            Appointment Details Modal
        ====================================== */}
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      </div>
    </div>
  );
}
