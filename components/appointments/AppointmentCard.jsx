"use client";

import AppointmentCardHeader from "./AppointmentCardHeader";
import AppointmentCardInfo from "./AppointmentCardInfo";

import AwaitingReviewSection from "./status/AwaitingReviewSection";
import PaymentRequiredSection from "./status/PaymentRequiredSection";
import ConfirmedSection from "./status/ConfirmedSection";
import CompletedSection from "./status/CompletedSection";

export default function AppointmentCard({
  appointment,
  onViewDetails,
  onRefresh,
}) {
  const latestPayment = appointment.appointment_payments?.length
    ? [...appointment.appointment_payments].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      )[0]
    : null;

  return (
    <div className="bg-white border rounded-2xl p-6">
      <AppointmentCardHeader appointment={appointment} />

      <AppointmentCardInfo appointment={appointment} />

      {appointment.status === "pending" && !appointment.service_amount && (
        <AwaitingReviewSection />
      )}

      {appointment.status === "pending" && appointment.service_amount > 0 && (
        <PaymentRequiredSection
          appointment={appointment}
          latestPayment={latestPayment}
          onRefresh={onRefresh}
        />
      )}

      {appointment.status === "confirmed" && (
        <ConfirmedSection appointment={appointment} />
      )}

      {appointment.status === "completed" && (
        <CompletedSection appointment={appointment} />
      )}

      <div className="mt-5">
        <button
          onClick={() => onViewDetails(appointment)}
          className="px-4 py-2 rounded-xl border bg-black hover:bg-neutral-800 transition shadow-md text-white"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
