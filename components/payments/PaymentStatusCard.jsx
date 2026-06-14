"use client";

export default function PaymentStatusCard({
  status,
  title,
  message,
  amountPaid,
  balanceDue,
  serviceAmount,
  rejectionReason,
  updatedAt,
}) {
  /*
  ==========================================
  Status Styles
  ==========================================
  */

  const styles = {
    pending: {
      container: "bg-yellow-50 border-yellow-200",
      title: "text-yellow-700",
      text: "text-yellow-600",
      defaultTitle: "Payment Pending",
      defaultMessage: "Your payment is awaiting review by our team.",
    },

    submitted: {
      container: "bg-orange-50 border-orange-200",
      title: "text-orange-700",
      text: "text-orange-600",
      defaultTitle: "Receipt Submitted",
      defaultMessage:
        "Your receipt has been received and is awaiting confirmation.",
    },

    confirmed: {
      container: "bg-green-50 border-green-200",
      title: "text-green-700",
      text: "text-green-600",
      defaultTitle: "Payment Confirmed",
      defaultMessage: "Your payment has been successfully confirmed.",
    },

    rejected: {
      container: "bg-red-50 border-red-200",
      title: "text-red-700",
      text: "text-red-600",
      defaultTitle: "Payment Rejected",
      defaultMessage: "Your payment could not be verified.",
    },

    cancelled: {
      container: "bg-gray-50 border-gray-200",
      title: "text-gray-700",
      text: "text-gray-600",
      defaultTitle: "Cancelled",
      defaultMessage: "This payment request has been cancelled.",
    },
  };

  const config = styles[status] || styles.pending;

  return (
    <div
      className={`
        mt-6
        rounded-2xl
        border
        p-5
        ${config.container}
      `}
    >
      {/* Title */}
      <h3
        className={`
          text-base sm:text-lg
          font-semibold
          ${config.title}
        `}
      >
        {title || config.defaultTitle}
      </h3>

      {/* Message */}
      <p
        className={`
          mt-2
          text-sm
          ${config.text}
        `}
      >
        {message || config.defaultMessage}
      </p>

      {/* Financial Summary */}
      {(serviceAmount !== undefined ||
        amountPaid !== undefined ||
        balanceDue !== undefined) && (
        <div className="mt-4 space-y-2 text-sm">
          {serviceAmount !== undefined && (
            <p>
              <strong>Total Cost:</strong> ₦
              {Number(serviceAmount).toLocaleString()}
            </p>
          )}

          {amountPaid !== undefined && (
            <p>
              <strong>Amount Paid:</strong> ₦
              {Number(amountPaid).toLocaleString()}
            </p>
          )}

          {balanceDue !== undefined && (
            <p>
              <strong>Balance Due:</strong> ₦
              {Number(balanceDue).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Rejection Reason */}
      {status === "rejected" && rejectionReason && (
        <div className="mt-4 rounded-xl bg-white/70 p-3 border">
          <p className="text-sm">
            <strong>Reason:</strong> {rejectionReason}
          </p>
        </div>
      )}

      {/* Timestamp */}
      {updatedAt && (
        <p className="mt-4 text-xs text-gray-500">
          Updated on {new Date(updatedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}
