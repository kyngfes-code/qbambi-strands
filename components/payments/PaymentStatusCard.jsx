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
  const styles = {
    pending: {
      container: "bg-yellow-50 border-yellow-200",
      title: "text-yellow-800",
      text: "text-yellow-700",
      defaultTitle: "Payment Pending",
      defaultMessage: "Your payment is awaiting review by our team.",
    },

    submitted: {
      container: "bg-orange-50 border-orange-200",
      title: "text-orange-800",
      text: "text-orange-700",
      defaultTitle: "Receipt Submitted",
      defaultMessage:
        "Your receipt has been received and is awaiting confirmation.",
    },

    confirmed: {
      container: "bg-green-50 border-green-200",
      title: "text-green-800",
      text: "text-green-700",
      defaultTitle: "Payment Confirmed",
      defaultMessage: "Your payment has been successfully confirmed.",
    },

    rejected: {
      container: "bg-red-50 border-red-200",
      title: "text-red-800",
      text: "text-red-700",
      defaultTitle: "Payment Rejected",
      defaultMessage: "Your payment could not be verified.",
    },

    cancelled: {
      container: "bg-gray-50 border-gray-200",
      title: "text-gray-800",
      text: "text-gray-700",
      defaultTitle: "Payment Cancelled",
      defaultMessage: "This payment request has been cancelled.",
    },
  };

  const config = styles[status] || styles.pending;

  return (
    <div
      className={`
        mt-6
        w-full
        rounded-2xl
        border
        p-4
        sm:p-5
        lg:p-6
        ${config.container}
      `}
    >
      {/* Header */}
      <div>
        <h3
          className={`
            text-base
            sm:text-lg
            lg:text-xl
            font-semibold
            ${config.title}
          `}
        >
          {title || config.defaultTitle}
        </h3>

        <p
          className={`
            mt-2
            text-sm
            sm:text-base
            leading-relaxed
            ${config.text}
          `}
        >
          {message || config.defaultMessage}
        </p>
      </div>

      {/* Financial Summary */}
      {(serviceAmount !== undefined ||
        amountPaid !== undefined ||
        balanceDue !== undefined) && (
        <div className="mt-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {serviceAmount !== undefined && (
              <div className="rounded-xl bg-white/70 p-4 border">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Total Cost
                </p>

                <p className="mt-1 text-lg font-semibold">
                  ₦{Number(serviceAmount).toLocaleString()}
                </p>
              </div>
            )}

            {amountPaid !== undefined && (
              <div className="rounded-xl bg-white/70 p-4 border">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Amount Paid
                </p>

                <p className="mt-1 text-lg font-semibold text-green-700">
                  ₦{Number(amountPaid).toLocaleString()}
                </p>
              </div>
            )}

            {balanceDue !== undefined && (
              <div className="rounded-xl bg-white/70 p-4 border">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Balance Due
                </p>

                <p className="mt-1 text-lg font-semibold text-red-700">
                  ₦{Number(balanceDue).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rejection Reason */}
      {status === "rejected" && rejectionReason && (
        <div className="mt-6 rounded-xl border border-red-200 bg-white p-4">
          <p className="text-sm font-semibold text-red-700">Rejection Reason</p>

          <p className="mt-2 text-sm text-gray-700 break-words">
            {rejectionReason}
          </p>
        </div>
      )}

      {/* Timestamp */}
      {updatedAt && (
        <div className="mt-6 border-t border-black/10 pt-4">
          <p className="text-xs sm:text-sm text-gray-500 break-words">
            Last updated: {new Date(updatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
