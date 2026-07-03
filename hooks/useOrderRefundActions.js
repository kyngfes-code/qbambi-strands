"use client";

import { useState } from "react";

export default function useOrderRefundActions(refreshRefunds) {
  const [processingRefund, setProcessingRefund] = useState(false);

  async function handleProcessRefund(payload, onSuccess) {
    try {
      setProcessingRefund(true);

      const res = await fetch("/api/admin/refunds/process-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process refund.");
      }

      await refreshRefunds();

      onSuccess?.(data);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setProcessingRefund(false);
    }
  }

  return {
    processingRefund,
    handleProcessRefund,
  };
}
