"use client";

import PaymentStatusCard from "@/components/payments/PaymentStatusCard";
import PaymentMethodSelector from "@/components/payments/PaymentMethodSelector";

export default function PaymentRequiredSection({
  appointment,
  latestPayment,
  onRefresh,
}) {
  return (
    <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
      <p className="font-medium text-orange-700">Payment Required</p>

      {/* Pricing Summary */}
      <div className="mt-3 space-y-1">
        <p>
          <strong>Service Cost:</strong> ₦
          {Number(appointment.service_amount || 0).toLocaleString()}
        </p>

        <p>
          <strong>Deposit Required:</strong> ₦
          {Number(appointment.deposit_required || 0).toLocaleString()}
        </p>

        <p>
          <strong>Amount Paid:</strong> ₦
          {Number(appointment.amount_paid || 0).toLocaleString()}
        </p>

        <p>
          <strong>Balance Due:</strong> ₦
          {Number(appointment.balance_due || 0).toLocaleString()}
        </p>
      </div>

      <p className="text-sm text-orange-600 mt-3">
        Please complete the required payment to secure your appointment slot.
      </p>

      {/* Existing Payment Status */}
      {latestPayment && (
        <PaymentStatusCard
          status={latestPayment.status}
          serviceAmount={appointment.service_amount}
          amountPaid={appointment.amount_paid}
          balanceDue={appointment.balance_due}
          rejectionReason={latestPayment.rejection_reason}
          updatedAt={latestPayment.confirmed_at || latestPayment.created_at}
        />
      )}

      {/* Payment Methods */}
      {!["pending", "confirmed"].includes(latestPayment?.status) && (
        <div className="mt-5">
          <PaymentMethodSelector
            amount={appointment.deposit_required}
            appointmentId={appointment.id}
            customerEmail={appointment.user?.email}
            customerName={appointment.user?.name}
            onUploadReceipt={onRefresh}
          />
        </div>
      )}

      {/* Awaiting Admin Review */}
      {latestPayment?.status === "pending" && (
        <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="font-medium text-yellow-700">Payment Under Review</p>

          <p className="mt-1 text-sm text-yellow-600">
            Your payment has been submitted and is awaiting confirmation from
            our team.
          </p>
        </div>
      )}

      {/* Payment Confirmed */}
      {latestPayment?.status === "confirmed" && (
        <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="font-medium text-green-700">Payment Confirmed</p>

          <p className="mt-1 text-sm text-green-600">
            Your payment has been confirmed. We will proceed with your
            appointment.
          </p>
        </div>
      )}
    </div>
  );
}
