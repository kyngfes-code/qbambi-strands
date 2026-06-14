"use client";

export default function useAppointmentUIActions(modals) {
  function handleViewAppointment(appointment) {
    if (
      appointment.status === "completed" &&
      Number(appointment.balance_due || 0) > 0
    ) {
      modals.setOutstandingAppointment(appointment);
      return;
    }

    modals.setSelectedAppointment(appointment);
  }

  function handleOpenPricing(appointment) {
    modals.setPricingAppointment(appointment);
  }

  function handleOpenCancellation(appointment) {
    modals.setCancelAppointment(appointment);
  }

  function handleOpenComplete(appointment) {
    modals.setCompleteAppointment(appointment);
  }

  return {
    handleViewAppointment,
    handleOpenPricing,
    handleOpenCancellation,
    handleOpenComplete,
  };
}
