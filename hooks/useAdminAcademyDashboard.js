"use client";

import { useCallback, useEffect, useState } from "react";

import { toast } from "sonner";

export function useAdminAcademyDashboard() {
  ////////////////////////////////////////////////////////////
  // State
  ////////////////////////////////////////////////////////////

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [processing, setProcessing] = useState(false);

  const [error, setError] = useState(null);

  ////////////////////////////////////////////////////////////
  // Dashboard
  ////////////////////////////////////////////////////////////

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/academy/dashboard", {
        cache: "no-store",
      });

      const json = await res.json();

      if (res.status === 503) {
        setError({
          type: "network",
          message:
            json.message ||
            "Unable to connect. Please check your internet connection.",
        });

        return;
      }

      if (!res.ok) {
        throw new Error(json.error || "Unable to load dashboard.");
      }

      setData(json);
    } catch (err) {
      console.error("Academy dashboard error:", err);

      const message = err?.message || "Failed to load academy dashboard.";

      setError({
        type: "error",
        message,
      });

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);
  ////////////////////////////////////////////////////////////
  // Refresh
  ////////////////////////////////////////////////////////////

  const refreshDashboard = useCallback(async () => {
    await fetchDashboard();
  }, [fetchDashboard]);

  ////////////////////////////////////////////////////////////
  // Approve Enrollment
  ////////////////////////////////////////////////////////////

  const approveEnrollment = useCallback(
    async (enrollmentId, payload = {}) => {
      try {
        setProcessing(true);

        const res = await fetch(
          `/api/admin/academy/enrollments/${enrollmentId}/approve`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Unable to approve enrollment.");
        }

        toast.success("Enrollment approved.");

        await fetchDashboard();

        return true;
      } catch (err) {
        console.error("Approve enrollment error:", err);

        toast.error(err.message || "Unable to approve enrollment.");

        return false;
      } finally {
        setProcessing(false);
      }
    },
    [fetchDashboard],
  );

  ////////////////////////////////////////////////////////////
  // Reject Enrollment
  ////////////////////////////////////////////////////////////

  const rejectEnrollment = useCallback(
    async (enrollmentId, payload = {}) => {
      try {
        setProcessing(true);

        const res = await fetch(
          `/api/admin/academy/enrollments/${enrollmentId}/reject`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Unable to reject enrollment.");
        }

        toast.success("Enrollment rejected.");

        await fetchDashboard();

        return true;
      } catch (err) {
        console.error("Reject enrollment error:", err);

        toast.error(err.message || "Unable to reject enrollment.");

        return false;
      } finally {
        setProcessing(false);
      }
    },
    [fetchDashboard],
  );

  ////////////////////////////////////////////////////////////
  // Assign Pricing
  ////////////////////////////////////////////////////////////

  const assignPricing = useCallback(
    async (enrollmentId, payload = {}) => {
      try {
        setProcessing(true);

        const res = await fetch(
          `/api/admin/academy/enrollments/${enrollmentId}/assign-pricing`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Unable to assign pricing.");
        }

        toast.success("Pricing assigned.");

        await fetchDashboard();

        return true;
      } catch (err) {
        console.error("Assign pricing error:", err);

        toast.error(err.message || "Unable to assign pricing.");

        return false;
      } finally {
        setProcessing(false);
      }
    },
    [fetchDashboard],
  );

  ////////////////////////////////////////////////////////////
  // Record Payment
  ////////////////////////////////////////////////////////////

  const recordPayment = useCallback(
    async (enrollmentId, payload = {}) => {
      try {
        setProcessing(true);

        const res = await fetch(
          `/api/admin/academy/enrollments/${enrollmentId}/record-payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Unable to record payment.");
        }

        toast.success("Payment recorded.");

        await fetchDashboard();

        return true;
      } catch (err) {
        console.error("Record payment error:", err);

        toast.error(err.message || "Unable to record payment.");

        return false;
      } finally {
        setProcessing(false);
      }
    },
    [fetchDashboard],
  );

  ////////////////////////////////////////////////////////////
  // Verify Academy Payment
  //
  // Pending payment:
  //
  // academy_enrollment_payments.status
  //          pending
  //             ↓
  //       verification RPC
  //             ↓
  // academy_enrollment_payments.status
  //          approved
  //
  // Then:
  //
  // academy_enrollments.status
  //       confirmed
  //          ↓
  //   payment_verified
  ////////////////////////////////////////////////////////////

  const verifyAcademyPayment = useCallback(
    async (payment) => {
      if (!payment?.id) {
        toast.error("Payment record is missing.");
        return false;
      }

      if (!payment?.enrollment_id) {
        toast.error("Payment enrollment is missing.");
        return false;
      }

      try {
        setProcessing(payment.id);

        console.log("Verifying academy payment:", {
          paymentId: payment.id,
          enrollmentId: payment.enrollment_id,
        });

        const res = await fetch(
          `/api/admin/academy/enrollments/${payment.enrollment_id}/payments/verify`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              payment_id: payment.id,
            }),
          },
        );

        const json = await res.json();

        console.log("Verify academy payment response:", {
          status: res.status,
          ok: res.ok,
          data: json,
        });

        if (!res.ok) {
          throw new Error(json.error || "Unable to verify academy payment.");
        }

        toast.success("Payment verified successfully.");

        await fetchDashboard();

        return true;
      } catch (err) {
        console.error("Verify academy payment error:", err);

        toast.error(err.message || "Unable to verify payment.");

        return false;
      } finally {
        setProcessing(null);
      }
    },
    [fetchDashboard],
  );

  ////////////////////////////////////////////////////////////
  // Reject Academy Payment
  //
  // Optional but recommended because your payment table
  // already supports rejected payments.
  ////////////////////////////////////////////////////////////

  const rejectAcademyPayment = useCallback(
    async (payment) => {
      if (!payment?.id) {
        toast.error("Payment record is missing.");
        return false;
      }

      if (!payment?.enrollment_id) {
        toast.error("Payment enrollment is missing.");
        return false;
      }

      try {
        setProcessing(true);

        const res = await fetch(
          `/api/admin/academy/enrollments/${payment.enrollment_id}/payments/reject`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              paymentId: payment.id,
            }),
          },
        );

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Unable to reject payment.");
        }

        toast.success("Payment rejected.");

        await fetchDashboard();

        return true;
      } catch (err) {
        console.error("Reject academy payment error:", err);

        toast.error(err.message || "Unable to reject payment.");

        return false;
      } finally {
        setProcessing(false);
      }
    },
    [fetchDashboard],
  );

  ////////////////////////////////////////////////////////////
  // Activate Student
  //
  // This is intentionally separate from payment verification.
  //
  // payment_verified
  //        ↓
  // activate RPC
  //        ↓
  // enrolled
  //
  // academy_students:
  // inactive → active
  ////////////////////////////////////////////////////////////

  async function activateAcademyStudent(enrollment) {
    if (!enrollment?.id) {
      return false;
    }

    try {
      setProcessing(enrollment.id);

      const res = await fetch(
        `/api/admin/academy/enrollments/${enrollment.id}/activate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to activate student.");
      }

      await refreshDashboard();

      return true;
    } catch (error) {
      console.error("Academy student activation error:", error);

      alert(error.message || "Unable to activate student.");

      return false;
    } finally {
      setProcessing(null);
    }
  }
  ////////////////////////////////////////////////////////////
  // Add Note
  ////////////////////////////////////////////////////////////

  const addNote = useCallback(
    async (enrollmentId, payload = {}) => {
      try {
        setProcessing(true);

        const res = await fetch(
          `/api/admin/academy/enrollments/${enrollmentId}/notes`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Unable to add note.");
        }

        toast.success("Note added.");

        await fetchDashboard();

        return true;
      } catch (err) {
        console.error("Add academy note error:", err);

        toast.error(err.message || "Unable to add note.");

        return false;
      } finally {
        setProcessing(false);
      }
    },
    [fetchDashboard],
  );

  const viewAcademyPaymentReceipt = useCallback(async (payment) => {
    const paymentId = payment?.id;

    if (!paymentId) {
      toast.error("Academy payment ID is missing.");
      return false;
    }

    try {
      console.log("Opening academy receipt:", {
        paymentId,
        payment,
      });

      const res = await fetch(
        `/api/admin/academy/payments/${paymentId}/receipt`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data = await res.json();

      console.log("Receipt API response:", {
        status: res.status,
        ok: res.ok,
        data,
      });

      if (!res.ok) {
        throw new Error(data.error || "Unable to view payment receipt.");
      }

      const receiptUrl = data?.receipt?.url;

      if (!receiptUrl) {
        throw new Error("Receipt URL was not returned.");
      }

      console.log("Receipt URL:", receiptUrl);

      window.open(receiptUrl, "_blank", "noopener,noreferrer");

      return true;
    } catch (error) {
      console.error("View academy payment receipt error:", error);

      toast.error(error.message || "Unable to view payment receipt.");

      return false;
    }
  }, []);

  ////////////////////////////////////////////////////////////
  // Initial Load
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  ////////////////////////////////////////////////////////////
  // Return
  ////////////////////////////////////////////////////////////

  return {
    data,

    loading,

    processing,

    error,

    viewAcademyPaymentReceipt,

    refreshDashboard,

    approveEnrollment,

    rejectEnrollment,

    assignPricing,

    recordPayment,

    verifyAcademyPayment,

    rejectAcademyPayment,

    activateAcademyStudent,

    addNote,
  };
}
