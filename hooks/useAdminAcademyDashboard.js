"use client";

import { useCallback, useEffect, useState } from "react";

import { toast } from "sonner";

//////////////////////////////////////////////////////////////

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

      if (!res.ok) {
        throw new Error(json.error || "Unable to load dashboard.");
      }

      setData(json);
    } catch (err) {
      console.error(err);

      setError(err.message);

      toast.error(err.message || "Failed to load dashboard.");
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
        console.error(err);

        toast.error(err.message);

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
        console.error(err);

        toast.error(err.message);

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
    async (enrollmentId, payload) => {
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
          throw new Error(json.error);
        }

        toast.success("Pricing assigned.");

        await fetchDashboard();

        return true;
      } catch (err) {
        toast.error(err.message);

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
    async (enrollmentId, payload) => {
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
          throw new Error(json.error);
        }

        toast.success("Payment recorded.");

        await fetchDashboard();

        return true;
      } catch (err) {
        toast.error(err.message);

        return false;
      } finally {
        setProcessing(false);
      }
    },
    [fetchDashboard],
  );

  ////////////////////////////////////////////////////////////
  // Add Note
  ////////////////////////////////////////////////////////////

  const addNote = useCallback(
    async (enrollmentId, payload) => {
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
          throw new Error(json.error);
        }

        toast.success("Note added.");

        await fetchDashboard();

        return true;
      } catch (err) {
        toast.error(err.message);

        return false;
      } finally {
        setProcessing(false);
      }
    },
    [fetchDashboard],
  );

  ////////////////////////////////////////////////////////////
  // Initial Load
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  ////////////////////////////////////////////////////////////

  return {
    data,

    loading,

    processing,

    error,

    refreshDashboard,

    approveEnrollment,

    rejectEnrollment,

    assignPricing,

    recordPayment,

    addNote,
  };
}
