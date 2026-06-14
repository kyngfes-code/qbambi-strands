"use client";

import { useState } from "react";
import ReceiptUploader from "./ReceiptUploader";

export default function BankTransferPayment({
  amount,
  appointmentId,
  onReceiptUploaded,
}) {
  const [showInstructions, setShowInstructions] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const depositAmount = Number(amount || 0);

  async function handleReceiptSelected(file) {
    if (!file) return;

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append("appointmentId", appointmentId);
      formData.append("amount", depositAmount);
      formData.append("receipt", file);

      const res = await fetch("/api/appointments/upload-receipt", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.status === 409) {
        setError(data.error);
        return;
      }

      if (!res.ok) {
        setError(data.error || "Failed to upload receipt");
        return;
      }

      // Success
      setError("");
      alert("Receipt submitted successfully.");

      onReceiptUploaded?.();
    } catch (err) {
      console.error(err);

      setError(err.message || "Failed to upload receipt.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-4 border border-gray-200 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setShowInstructions(!showInstructions)}
        className="
          w-full
          flex items-center justify-between
          px-4 py-4
          bg-white
          hover:bg-gray-50
          transition
        "
      >
        <div className="text-left">
          <h3 className="font-semibold text-gray-900">Pay via Bank Transfer</h3>

          <p className="text-sm text-gray-500">
            Transfer and upload your receipt.
          </p>
        </div>

        <span className="text-sm font-medium text-gray-600">
          {showInstructions ? "Hide" : "Show"}
        </span>
      </button>

      {showInstructions && (
        <div className="bg-gray-50 border-t px-4 py-5 space-y-5">
          <div>
            <p className="text-sm text-gray-500">Amount to Transfer</p>

            <p className="text-2xl font-bold text-gray-900">
              ₦{depositAmount.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl border p-4 space-y-3">
            <div>
              <p className="text-xs uppercase text-gray-500">Bank Name</p>

              <p className="font-semibold">First Bank Nigeria</p>
            </div>

            <div>
              <p className="text-xs uppercase text-gray-500">Account Name</p>

              <p className="font-semibold">Q-Bambi Strands</p>
            </div>

            <div>
              <p className="text-xs uppercase text-gray-500">Account Number</p>

              <p className="font-semibold text-lg tracking-wider">2048036410</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-medium text-blue-700">Instructions</h4>

            <ol className="mt-2 text-sm text-blue-600 space-y-2 list-decimal list-inside">
              <li>Transfer the exact deposit amount.</li>

              <li>
                Use booking ID {appointmentId?.slice(0, 8)} as payment
                reference.
              </li>

              <li>Upload your payment receipt below.</li>

              <li>Wait for admin confirmation.</li>
            </ol>
          </div>

          <ReceiptUploader onFileSelected={handleReceiptSelected} />

          {uploading && (
            <p className="text-sm text-blue-600">Uploading receipt...</p>
          )}

          {success && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
