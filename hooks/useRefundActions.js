"use client";

import { useState } from "react";

export default function useRefundActions(refreshRefunds) {
  const [processingRefund, setProcessingRefund] = useState(false);

  async function handleProcessRefund(payload, onSuccess) {
    try {
      setProcessingRefund(true);

      const res = await fetch("/api/admin/refunds/process-appointment", {
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

  /*
==========================================
Reject Appointment Refund Request
==========================================
*/

  async function handleRejectRefundRequest(payload, onSuccess) {
    try {
      setProcessingRefund(true);

      const res = await fetch(
        "/api/admin/refunds/appointments/reject-refunds",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refundRequestId: payload.refundRequestId,
            rejectionReason: payload.rejectionReason,
            adminNote: payload.adminNote ?? null,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reject refund request.");
      }

      alert("Refund request rejected successfully.");

      await refreshRefunds();

      onSuccess?.(data);
    } catch (error) {
      console.error(error);

      alert(error.message || "Failed to reject refund request.");
    } finally {
      setProcessingRefund(false);
    }
  }

  return {
    processingRefund,
    handleProcessRefund,
    handleRejectRefundRequest,
  };
}
