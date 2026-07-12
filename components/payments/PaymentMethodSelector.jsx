"use client";

import { useState } from "react";

import PaystackButton from "./PaystackButton";
import BankTransferPayment from "./BankTransferPayment";

export default function PaymentMethodSelector({
  amount,
  entityType,
  entityId,
  paymentType,
  onUploadReceipt,
}) {
  const [selectedMethod, setSelectedMethod] = useState("paystack");

  return (
    <div className="mt-6 w-full">
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-neutral-900">
          Choose Payment Method
        </h3>

        <p className="mt-1 text-sm text-neutral-500">
          Select how you would like to complete your payment.
        </p>
      </div>

      {/* Payment Method Selector */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setSelectedMethod("paystack")}
          className={`
            flex items-center justify-center gap-2
            rounded-xl border px-4 py-3
            text-sm font-medium
            transition-all duration-200

            ${
              selectedMethod === "paystack"
                ? "border-black bg-black text-white shadow"
                : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50"
            }
          `}
        >
          <span className="text-base">💳</span>
          <span>Paystack</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedMethod("bank")}
          className={`
            flex items-center justify-center gap-2
            rounded-xl border px-4 py-3
            text-sm font-medium
            transition-all duration-200

            ${
              selectedMethod === "bank"
                ? "border-black bg-black text-white shadow"
                : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50"
            }
          `}
        >
          <span className="text-base">🏦</span>
          <span>Bank Transfer</span>
        </button>
      </div>

      {/* Selected Method */}
      <div className="mt-6">
        {selectedMethod === "paystack" ? (
          <PaystackButton
            entityType={entityType}
            entityId={entityId}
            paymentType={paymentType}
            className="w-full sm:w-auto"
          />
        ) : (
          <BankTransferPayment
            amount={amount}
            entityType={entityType}
            entityId={entityId}
            paymentType={paymentType}
            onUploadReceipt={onUploadReceipt}
          />
        )}
      </div>
    </div>
  );
}
