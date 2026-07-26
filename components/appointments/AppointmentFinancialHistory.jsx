"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Receipt } from "lucide-react";

export default function AppointmentFinancialHistory({
  appointment,
  variant = "customer",
}) {
  const [expanded, setExpanded] = useState(false);

  const customerLedger = useMemo(() => {
    return (appointment.payment_history || [])
      .map((entry) => ({
        label: entry.description,
        amount: entry.amount,
        paymentMethod: entry.payment_method || entry.refund_method,
        createdAt: entry.created_at,
        status: entry.status,
        adminNote: entry.description,
        transactionType: entry.transaction_type,
        recordType: entry.record_type,
        tipAmount: entry.tip_amount,
      }))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [appointment]);

  const visibleEntries = expanded ? customerLedger : customerLedger.slice(0, 3);

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      {/* Header */}

      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="
          w-full
          flex
          items-center
          justify-between
          gap-4
          p-4
          sm:p-5
          text-left
          hover:bg-gray-50
          rounded-t-2xl
          transition
        "
      >
        <div className="flex items-center gap-3 min-w-0">
          <Receipt className="h-5 w-5 text-gray-600 shrink-0" />

          <div className="min-w-0">
            <h3 className="font-semibold text-base sm:text-lg">
              Financial History
            </h3>

            <p className="text-xs sm:text-sm text-gray-500">
              {customerLedger.length} transaction
              {customerLedger.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {expanded ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-gray-500" />
        )}
      </button>

      {/* Body */}

      {expanded && (
        <div className="border-t px-4 sm:px-5 py-5">
          {customerLedger.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No payments recorded.
            </div>
          ) : (
            <div className="space-y-4">
              {visibleEntries.map((entry, index) => {
                const isRejected = entry.status === "rejected";

                const isNegative =
                  entry.label === "Refund" ||
                  entry.label === "Overpayment Refund" ||
                  entry.label === "Write Off";

                return (
                  <div
                    key={index}
                    className={`
                      rounded-xl
                      border
                      p-4
                      ${
                        isRejected
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-white"
                      }
                    `}
                  >
                    <div
                      className="
                        flex
                        flex-col
                        gap-4
                        sm:flex-row
                        sm:justify-between
                        sm:items-start
                      "
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p
                            className={`font-medium ${
                              isRejected ? "text-red-700" : ""
                            }`}
                          >
                            {entry.label}
                          </p>

                          {entry.status && (
                            <span
                              className={`
                                text-xs
                                px-2 py-1
                                rounded-full
                                whitespace-nowrap
                                ${
                                  entry.status === "confirmed"
                                    ? "bg-green-100 text-green-700"
                                    : entry.status === "rejected"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-gray-100 text-gray-700"
                                }
                              `}
                            >
                              {entry.status}
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-xs sm:text-sm text-gray-500 break-words">
                          {new Date(entry.createdAt).toLocaleString()}
                        </p>

                        {entry.paymentMethod && (
                          <p className="text-xs sm:text-sm text-gray-500 mt-1 break-words">
                            Method:{" "}
                            {entry.paymentMethod
                              .replaceAll("_", " ")
                              .toUpperCase()}
                          </p>
                        )}

                        {variant === "admin" && entry.adminNote && (
                          <p className="mt-2 text-xs sm:text-sm text-blue-600 break-words">
                            <strong>Admin Note:</strong> {entry.adminNote}
                          </p>
                        )}
                      </div>

                      <div className="sm:text-right">
                        <p
                          className={`
                            text-lg
                            font-bold
                            ${
                              isRejected
                                ? "text-red-700"
                                : isNegative
                                  ? "text-red-600"
                                  : "text-green-700"
                            }
                          `}
                        >
                          {isNegative ? "-" : "+"}₦
                          {Number(entry.amount).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Outstanding */}

          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <div
              className="
                flex
                flex-col
                gap-2
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div>
                <p className="text-sm text-gray-500">Outstanding Payment</p>

                <p className="mt-1 text-2xl font-bold text-red-600">
                  ₦{Number(appointment.balance_due || 0).toLocaleString()}
                </p>
              </div>

              {Number(appointment.balance_due || 0) <= 0 && (
                <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  Fully Paid
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
