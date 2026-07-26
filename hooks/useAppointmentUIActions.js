"use client";

export default function useAppointmentUIActions(modals) {
  async function handleViewAppointment(appointment) {
    try {
      const res = await fetch(`/api/admin/appointments/${appointment.id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load appointment.");
      }

      console.log("FULL APPOINTMENT", data.appointment);

      if (
        data.appointment.status === "completed" &&
        Number(data.appointment.balance_due || 0) > 0
      ) {
        modals.setOutstandingAppointment(data.appointment);
        return;
      }

      modals.setSelectedAppointment(data.appointment);
    } catch (err) {
      console.error(err);
    }
  }

  // function handleViewAppointment(appointment) {
  //   if (
  //     appointment.status === "completed" &&
  //     Number(appointment.balance_due || 0) > 0
  //   ) {
  //     modals.setOutstandingAppointment(appointment);
  //     return;
  //   }

  //   modals.setSelectedAppointment(appointment);
  // }

  function handleOpenPricing(appointment) {
    modals.setPricingAppointment(appointment);
  }

  function handleOpenCancellation(appointment) {
    modals.setCancelAppointment(appointment);
  }

  function handleOpenComplete(appointment) {
    modals.setCompleteAppointment(appointment);
  }

  function handleOpenRefund(appointment) {
    modals.setRefundAppointment(appointment);
  }

  return {
    handleViewAppointment,
    handleOpenPricing,
    handleOpenCancellation,
    handleOpenComplete,
    handleOpenRefund,
  };
}
