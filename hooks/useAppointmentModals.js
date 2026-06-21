"use client";

import { useState } from "react";

export default function useAppointmentModals() {
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [pricingAppointment, setPricingAppointment] = useState(null);

  const [cancelAppointment, setCancelAppointment] = useState(null);

  const [completeAppointment, setCompleteAppointment] = useState(null);

  const [outstandingAppointment, setOutstandingAppointment] = useState(null);

  const [refundAppointment, setRefundAppointment] = useState(null);

  return {
    selectedAppointment,
    setSelectedAppointment,

    pricingAppointment,
    setPricingAppointment,

    cancelAppointment,
    setCancelAppointment,

    completeAppointment,
    setCompleteAppointment,

    outstandingAppointment,
    setOutstandingAppointment,

    refundAppointment,
    setRefundAppointment,
  };
}
