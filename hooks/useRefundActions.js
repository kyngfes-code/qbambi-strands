"use client";

import { useState } from "react";

export default function useRefundActions(refreshRefunds) {
  const [processingRefund, setProcessingRefund] = useState(false);

  async function handleProcessRefund(payload, onSuccess) {
    try {
      setProcessingRefund(true);

      const res = await fetch("/api/admin/refunds/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process refund");
      }

      await refreshRefunds();

      alert("Refund processed successfully.");

      onSuccess?.(data);
    } catch (error) {
      console.error(error);

      alert(error.message || "Failed to process refund.");
    } finally {
      setProcessingRefund(false);
    }
  }

  return {
    processingRefund,
    handleProcessRefund,
  };
}
