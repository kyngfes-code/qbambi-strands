"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export default function useAcademyPaymentPlans() {
  const [paymentPlans, setPaymentPlans] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [toggling, setToggling] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState(null);

  //-------------------------------------------------------
  // Load
  //-------------------------------------------------------

  const refreshPaymentPlans = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/academy/payment-plans");

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to load payment plans.");
      }

      setPaymentPlans(data.paymentPlans ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPaymentPlans();
  }, [refreshPaymentPlans]);

  //-------------------------------------------------------
  // Create / Update
  //-------------------------------------------------------

  const savePaymentPlan = useCallback(
    async (values) => {
      try {
        setSaving(true);

        const method = values.id ? "PATCH" : "POST";

        const url = values.id
          ? `/api/admin/academy/payment-plans/${values.id}`
          : "/api/admin/academy/payment-plans";

        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Unable to save payment plan.");
        }

        await refreshPaymentPlans();

        setSelectedPlan(null);

        return {
          success: true,
          data,
        };
      } catch (err) {
        console.error(err);

        return {
          success: false,
          error: err.message,
        };
      } finally {
        setSaving(false);
      }
    },
    [refreshPaymentPlans],
  );

  //-------------------------------------------------------
  // Toggle Active / Inactive
  //-------------------------------------------------------

  const togglePaymentPlan = useCallback(async (plan) => {
    try {
      setToggling(true);

      const res = await fetch(`/api/admin/academy/payment-plans/${plan.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_active: !plan.is_active,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to update payment plan.");
      }

      setPaymentPlans((prev) =>
        prev.map((item) =>
          item.id === plan.id
            ? {
                ...item,
                is_active: !item.is_active,
              }
            : item,
        ),
      );

      return {
        success: true,
      };
    } catch (err) {
      console.error(err);

      return {
        success: false,
        error: err.message,
      };
    } finally {
      setToggling(false);
    }
  }, []);

  //-------------------------------------------------------
  // Delete
  //-------------------------------------------------------

  const deletePaymentPlan = useCallback(async (id) => {
    try {
      setDeleting(true);

      const res = await fetch(`/api/admin/academy/payment-plans/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to delete payment plan.");
      }

      setPaymentPlans((prev) => prev.filter((plan) => plan.id !== id));

      setSelectedPlan(null);

      return {
        success: true,
      };
    } catch (err) {
      console.error(err);

      return {
        success: false,
        error: err.message,
      };
    } finally {
      setDeleting(false);
    }
  }, []);

  //-------------------------------------------------------
  // Helpers
  //-------------------------------------------------------

  const activePlans = useMemo(
    () => paymentPlans.filter((plan) => plan.is_active),
    [paymentPlans],
  );

  const inactivePlans = useMemo(
    () => paymentPlans.filter((plan) => !plan.is_active),
    [paymentPlans],
  );

  //-------------------------------------------------------

  return {
    paymentPlans,

    activePlans,
    inactivePlans,

    loading,
    saving,
    deleting,
    toggling,

    selectedPlan,
    setSelectedPlan,

    refreshPaymentPlans,

    savePaymentPlan,
    deletePaymentPlan,
    togglePaymentPlan,
  };
}
