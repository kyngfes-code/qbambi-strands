"use client";

import AppointmentDetailsModal from "@/components/appointments/AppointmentDetailsModal";
import CompleteAppointmentModal from "@/components/appointments/CompleteAppointmentModal";
import CancellationModal from "@/components/CancellationModal";
import CompletedAppointmentWithOutstandingModal from "@/components/CompletedAppointmentWithOutstandingModal";
import PricingModal from "@/components/PricingModal";

export default function AdminAppointmentModals({
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

  actions,

  loading,
}) {
  return (
    <>
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />

      {pricingAppointment && (
        <PricingModal
          appointment={pricingAppointment}
          onClose={() => setPricingAppointment(null)}
          onSave={actions.handleSetPricing}
        />
      )}

      {cancelAppointment && (
        <CancellationModal
          isOpen={!!cancelAppointment}
          appointment={cancelAppointment}
          loading={actions.cancellationLoading}
          onClose={() => setCancelAppointment(null)}
          onSubmit={actions.handleCancelAppointment}
        />
      )}

      {completeAppointment && (
        <CompleteAppointmentModal
          isOpen={!!completeAppointment}
          appointment={completeAppointment}
          loading={actions.completionLoading}
          onClose={() => setCompleteAppointment(null)}
          onSubmit={actions.handleCompleteAppointment}
        />
      )}

      {outstandingAppointment && (
        <CompletedAppointmentWithOutstandingModal
          appointment={outstandingAppointment}
          isOpen={!!outstandingAppointment}
          loading={actions.settlingPayment}
          onClose={() => setOutstandingAppointment(null)}
          onSubmit={actions.handleSettleOutstanding}
        />
      )}
    </>
  );
}
