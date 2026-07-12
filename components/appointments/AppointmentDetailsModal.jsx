"use client";

import OutstandingPaymentSection from "../payments/OutstandingPaymentSection";
import AppointmentDetailsContent from "./AppointmentDetailsContent";
import AppointmentPricingSection from "./AppointmentPricingSection";
// import AppointmentAdminNotes from "./AppointmentAdminNotes";

export default function AppointmentDetailsModal({
  appointment,
  onClose,
  isAdmin = false,
  onRefresh,
  actions,
}) {
  if (!appointment) return null;

  /*
  --------------------------------------------------
  Total Tips
  --------------------------------------------------
  */

  const totalTips =
    appointment.appointment_payment_adjustments?.reduce(
      (sum, adjustment) => sum + Number(adjustment.tip_amount || 0),
      0,
    ) || 0;

  /*
  --------------------------------------------------
  Latest Outstanding Payment
  --------------------------------------------------
  */

  const latestOutstandingPayment =
    appointment.appointment_payments
      ?.filter((payment) => payment.payment_type === "outstanding_payment")
      ?.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )?.[0] || null;

  return (
    <div
      className="
        fixed inset-0 z-50
        bg-black/60
        flex items-center justify-center
        p-2 sm:p-4 lg:p-6
      "
    >
      <div
        className="
          relative
          w-full
          max-w-6xl
          max-h-[95vh]
          overflow-y-auto
          rounded-2xl
          bg-white
          shadow-2xl
        "
      >
        {/* ------------------------------------------
            Header
        ------------------------------------------ */}

        <div
          className="
            sticky top-0 z-10
            bg-white
            border-b
            rounded-t-2xl
            px-4 sm:px-6 lg:px-8
            py-4
          "
        >
          <div
            className="
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div className="min-w-0">
              <h2
                className="
                  text-xl
                  sm:text-2xl
                  font-bold
                  break-words
                "
              >
                Appointment Details
              </h2>

              <p className="mt-1 text-sm text-gray-500 break-all">
                Booking ID: {appointment.id.slice(0, 8)}
              </p>
            </div>

            <button
              onClick={onClose}
              className="
                w-full
                sm:w-auto
                rounded-lg
                border
                px-5 py-2.5
                text-sm
                font-medium
                hover:bg-gray-100
                transition
              "
            >
              Close
            </button>
          </div>
        </div>

        {/* ------------------------------------------
            Body
        ------------------------------------------ */}

        <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-8">
          <AppointmentDetailsContent
            appointment={appointment}
            variant={isAdmin ? "admin" : "details"}
          />

          {/* --------------------------------------
              Pricing update section
          -------------------------------------- */}

          {isAdmin && appointment.status === "confirmed" && (
            <AppointmentPricingSection
              appointment={appointment}
              onEditPricing={() => {
                onClose();
                actions.handleOpenPricing(appointment);
              }}
            />
          )}

          {/* --------------------------------------
              Admin Tips Summary
          -------------------------------------- */}

          {isAdmin && totalTips > 0 && (
            <div
              className="
                rounded-2xl
                border
                bg-white
                p-5
                shadow-sm
              "
            >
              <p className="text-sm text-gray-500">Total Tips</p>

              <p
                className="
                  mt-2
                  text-2xl
                  font-bold
                  text-purple-700
                "
              >
                ₦{totalTips.toLocaleString()}
              </p>
            </div>
          )}

          {/* --------------------------------------
              Outstanding Payment
          -------------------------------------- */}

          <OutstandingPaymentSection
            appointment={appointment}
            latestOutstandingPayment={latestOutstandingPayment}
            isAdmin={isAdmin}
            onRefresh={onRefresh}
          />

          {/* --------------------------------------
              Admin Notes (future)
          -------------------------------------- */}

          {/*
          <AppointmentAdminNotes
            appointment={appointment}
            isAdmin={isAdmin}
          />
          */}
        </div>
      </div>
    </div>
  );
}
