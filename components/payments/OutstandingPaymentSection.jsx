"use client";

import PaymentMethodSelector from "@/components/payments/PaymentMethodSelector";
import PaymentStatusCard from "@/components/payments/PaymentStatusCard";

export default function OutstandingPaymentSection({
  appointment,
  latestOutstandingPayment,
  isAdmin = false,
  onRefresh,
}) {
  if (!appointment) return null;

  const balanceDue = Number(appointment.balance_due || 0);

  /*
  --------------------------------------------------
  Admin never sees customer payment actions
  --------------------------------------------------
  */

  if (isAdmin) return null;

  /*
  --------------------------------------------------
  Nothing owed
  --------------------------------------------------
  */

  if (balanceDue <= 0) {
    return (
      <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
        <h3 className="text-lg font-semibold text-green-700">
          Outstanding Balance Cleared
        </h3>

        <p className="mt-2 text-sm text-green-600">
          This appointment has been fully paid.
        </p>
      </div>
    );
  }

  /*
  --------------------------------------------------
  Outstanding payment status
  --------------------------------------------------
  */

  const status = latestOutstandingPayment?.status;

  return (
    <section className="mt-8 rounded-2xl border bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b px-4 py-4 sm:px-6">
        <h2 className="text-lg sm:text-xl font-semibold">
          Outstanding Payment
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Complete the remaining balance to fully settle this appointment.
        </p>
      </div>

      {/* Summary */}
      <div className="p-4 sm:p-6">
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-3
            gap-4
          "
        >
          <div className="rounded-xl border p-4">
            <p className="text-sm text-gray-500">Service Cost</p>

            <p className="mt-2 text-xl font-bold">
              ₦
              {Number(
                appointment.service_amount ?? appointment.service_price ?? 0,
              ).toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-sm text-gray-500">Amount Paid</p>

            <p className="mt-2 text-xl font-bold text-green-600">
              ₦{Number(appointment.amount_paid || 0).toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-orange-300 bg-orange-50 p-4">
            <p className="text-sm text-orange-700">Balance Due</p>

            <p className="mt-2 text-xl font-bold text-orange-700">
              ₦{balanceDue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* -----------------------------------------
            Awaiting confirmation
        ----------------------------------------- */}

        {(status === "pending" ||
          status === "submitted" ||
          status === "processing") && (
          <PaymentStatusCard
            status={status}
            amountPaid={appointment.amount_paid}
            balanceDue={appointment.balance_due}
            updatedAt={
              latestOutstandingPayment.updated_at ||
              latestOutstandingPayment.created_at
            }
          />
        )}

        {/* -----------------------------------------
            Rejected
        ----------------------------------------- */}

        {status === "rejected" && (
          <>
            <PaymentStatusCard
              status="rejected"
              rejectionReason={latestOutstandingPayment.rejection_reason}
              amountPaid={appointment.amount_paid}
              balanceDue={appointment.balance_due}
              updatedAt={
                latestOutstandingPayment.updated_at ||
                latestOutstandingPayment.created_at
              }
            />

            <div className="mt-6">
              <PaymentMethodSelector
                amount={balanceDue}
                appointmentId={appointment.id}
                customerEmail={appointment.user?.email}
                customerName={appointment.user?.name}
                paymentType="outstanding_payment"
                entityType="appointment"
                entityId={appointment.id}
                onUploadReceipt={onRefresh}
              />
            </div>
          </>
        )}

        {/* -----------------------------------------
            No outstanding payment yet
        ----------------------------------------- */}

        {!latestOutstandingPayment && (
          <>
            <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-4">
              <p className="font-medium text-orange-700">
                Outstanding payment required
              </p>

              <p className="mt-2 text-sm text-orange-600">
                Your service has been completed. Please pay the remaining
                balance to complete this appointment.
              </p>
            </div>

            <div className="mt-6">
              <PaymentMethodSelector
                amount={balanceDue}
                appointmentId={appointment.id}
                customerEmail={appointment.user?.email}
                customerName={appointment.user?.name}
                paymentType="outstanding_payment"
                entityType="appointment"
                entityId={appointment.id}
                onUploadReceipt={onRefresh}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
