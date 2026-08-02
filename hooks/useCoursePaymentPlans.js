"use client";

import { useCallback, useEffect, useState } from "react";

export default function useCoursePaymentPlans() {
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState(null);

  const [availablePlans, setAvailablePlans] = useState([]);

  const [assignedPlans, setAssignedPlans] = useState([]);

  const [assignModalOpen, setAssignModalOpen] = useState(false);

  //----------------------------------------------------------
  // Load All Courses + Assigned Plans
  //----------------------------------------------------------

  const refresh = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/academy/course-payment-plans", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to load course payment plans.");
      }

      setCourses(data.courses ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  //----------------------------------------------------------
  // Load Single Course Assignment
  //----------------------------------------------------------

  const openAssignModal = useCallback(async (course) => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/admin/academy/course-payment-plans/${course.id}`,
        {
          cache: "no-store",
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to load payment plans.");
      }

      setSelectedCourse(data.course);

      setAvailablePlans(data.availablePlans ?? []);

      setAssignedPlans(data.assignedPlans ?? []);

      setAssignModalOpen(true);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  //----------------------------------------------------------
  // Save Assignment
  //----------------------------------------------------------

  const saveAssignments = useCallback(
    async (paymentPlanIds) => {
      if (!selectedCourse) return;

      try {
        setSaving(true);

        const res = await fetch(
          `/api/admin/academy/course-payment-plans/${selectedCourse.id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              paymentPlanIds,
            }),
          },
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Unable to save assignments.");
        }

        setAssignModalOpen(false);

        await refresh();
      } catch (err) {
        console.error(err);

        alert(err.message);
      } finally {
        setSaving(false);
      }
    },
    [selectedCourse, refresh],
  );

  //----------------------------------------------------------
  // Close Modal
  //----------------------------------------------------------

  const closeModal = useCallback(() => {
    setAssignModalOpen(false);

    setSelectedCourse(null);

    setAssignedPlans([]);

    setAvailablePlans([]);
  }, []);

  //----------------------------------------------------------

  useEffect(() => {
    refresh();
  }, [refresh]);

  //----------------------------------------------------------

  return {
    courses,

    loading,
    saving,

    refresh,

    selectedCourse,

    availablePlans,

    assignedPlans,

    assignModalOpen,

    openAssignModal,

    closeModal,

    saveAssignments,
  };
}
