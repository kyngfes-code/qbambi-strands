"use client";

import { useState } from "react";

import PaystackButton from "./PaystackButton";
import BankTransferPayment from "./BankTransferPayment";

export default function PaymentMethodSelector({
  amount,
  appointmentId,
  customerEmail,
  customerName,
  onUploadReceipt,
}) {
  /*
  ==========================================
  Selected Method
  ==========================================
  */

  const [selectedMethod, setSelectedMethod] = useState("paystack");

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Choose Payment Method</h3>

        <p className="text-sm text-gray-500 mt-1">
          Select how you would like to pay.
        </p>
      </div>

      {/* Method Tabs */}
      <div
        className="
          flex flex-col
          sm:flex-row
          gap-3
        "
      >
        {/* Paystack */}
        <button
          type="button"
          onClick={() => setSelectedMethod("paystack")}
          className={`
            flex-1
            rounded-xl
            border
            px-4 py-3
            text-sm font-medium
            transition

            ${
              selectedMethod === "paystack"
                ? "bg-black text-white border-black"
                : "bg-white hover:bg-gray-50 border-gray-300"
            }
          `}
        >
          💳 Paystack
        </button>

        {/* Bank Transfer */}
        <button
          type="button"
          onClick={() => setSelectedMethod("bank")}
          className={`
            flex-1
            rounded-xl
            border
            px-4 py-3
            text-sm font-medium
            transition

            ${
              selectedMethod === "bank"
                ? "bg-black text-white border-black"
                : "bg-white hover:bg-gray-50 border-gray-300"
            }
          `}
        >
          🏦 Bank Transfer
        </button>
      </div>

      {/* Payment Method Content */}
      <div className="mt-6">
        {selectedMethod === "paystack" && (
          <PaystackButton
            amount={amount}
            appointmentId={appointmentId}
            customerEmail={customerEmail}
            customerName={customerName}
          />
        )}

        {selectedMethod === "bank" && (
          <BankTransferPayment
            amount={amount}
            appointmentId={appointmentId}
            onUploadReceipt={onUploadReceipt}
          />
        )}
      </div>
    </div>
  );
}
