"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export default function useAcademyPricing(courses = []) {
  //----------------------------------------------------------
  // State
  //----------------------------------------------------------

  const [learningMode, setLearningMode] = useState("");

  const [selectedCourses, setSelectedCourses] = useState([]);

  // NEW
  const [availablePaymentPlans, setAvailablePaymentPlans] = useState([]);

  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState(null);
  const [loadingPaymentPlans, setLoadingPaymentPlans] = useState(false);

  //----------------------------------------------------------
  // Course Helpers
  //----------------------------------------------------------

  const getCourse = useCallback(
    (courseId) => courses.find((course) => course.id === courseId),
    [courses],
  );

  //----------------------------------------------------------
  // Pricing Helpers
  //----------------------------------------------------------

  const findPricing = useCallback(
    (courseId, mode, duration) => {
      if (!mode) return null;

      const course = getCourse(courseId);

      if (!course) return null;

      return (
        course.pricing?.find(
          (pricing) =>
            pricing.learning_mode === mode &&
            Number(pricing.duration_months) === Number(duration),
        ) || null
      );
    },
    [getCourse],
  );

  //----------------------------------------------------------
  // Available Durations
  //----------------------------------------------------------

  const getAvailableDurations = useCallback(
    (courseId, mode = learningMode) => {
      if (!mode) return [];

      const course = getCourse(courseId);

      if (!course) return [];

      return [
        ...new Set(
          (course.pricing ?? [])
            .filter(
              (pricing) =>
                pricing.learning_mode === mode && pricing.active !== false,
            )
            .map((pricing) => Number(pricing.duration_months)),
        ),
      ].sort((a, b) => a - b);
    },
    [getCourse, learningMode],
  );

  //----------------------------------------------------------
  // Price Helper
  //----------------------------------------------------------

  const getCurrentPrice = useCallback(
    (courseId, duration) => {
      const pricing = findPricing(courseId, learningMode, duration);

      return Number(pricing?.price ?? 0);
    },
    [findPricing, learningMode],
  );

  //----------------------------------------------------------
  // Learning Mode
  //----------------------------------------------------------

  const updateLearningMode = useCallback(
    (mode) => {
      setLearningMode(mode);

      setSelectedCourses((previous) =>
        previous.map((course) => {
          const durations = getAvailableDurations(course.courseId, mode);

          const duration = durations.includes(course.duration)
            ? course.duration
            : durations[0];

          const pricing = findPricing(course.courseId, mode, duration);

          return {
            ...course,
            duration,
            pricingId: pricing?.id ?? null,
            price: Number(pricing?.price ?? 0),
          };
        }),
      );

      // Reset payment plan when learning mode changes
      setSelectedPaymentPlan(null);
      setAvailablePaymentPlans([]);
    },
    [findPricing, getAvailableDurations],
  );

  //----------------------------------------------------------
  // Toggle Course
  //----------------------------------------------------------

  const toggleCourse = useCallback(
    (courseId) => {
      setSelectedCourses((previous) => {
        const exists = previous.some((course) => course.courseId === courseId);

        if (exists) {
          return previous.filter((course) => course.courseId !== courseId);
        }

        const durations = getAvailableDurations(courseId);

        if (!durations.length) return previous;

        const duration = durations[0];

        const pricing = findPricing(courseId, learningMode, duration);

        return [
          ...previous,
          {
            courseId,
            duration,
            pricingId: pricing?.id ?? null,
            price: Number(pricing?.price ?? 0),
          },
        ];
      });

      setSelectedPaymentPlan(null);
    },
    [learningMode, findPricing, getAvailableDurations],
  );

  //----------------------------------------------------------
  // Duration Change
  //----------------------------------------------------------

  const updateDuration = useCallback(
    (courseId, duration) => {
      setSelectedCourses((previous) =>
        previous.map((course) => {
          if (course.courseId !== courseId) return course;

          const pricing = findPricing(courseId, learningMode, Number(duration));

          return {
            ...course,
            duration: Number(duration),
            pricingId: pricing?.id ?? null,
            price: Number(pricing?.price ?? 0),
          };
        }),
      );

      setSelectedPaymentPlan(null);
    },
    [findPricing, learningMode],
  );

  //----------------------------------------------------------
  // Payment Plan Helpers
  //----------------------------------------------------------

  const selectPaymentPlan = useCallback((plan) => {
    setSelectedPaymentPlan(plan);
  }, []);

  //----------------------------------------------------------
  // Helpers
  //----------------------------------------------------------

  const isSelected = useCallback(
    (courseId) =>
      selectedCourses.some((course) => course.courseId === courseId),
    [selectedCourses],
  );

  const getSelectedCourse = useCallback(
    (courseId) =>
      selectedCourses.find((course) => course.courseId === courseId),
    [selectedCourses],
  );

  //----------------------------------------------------------
  // Total Course Fee
  //----------------------------------------------------------

  const totalFee = useMemo(() => {
    return selectedCourses.reduce(
      (total, course) => total + Number(course.price || 0),
      0,
    );
  }, [selectedCourses]);

  //----------------------------------------------------------
  // Load Available Payment Plans
  //----------------------------------------------------------

  const loadPaymentPlans = useCallback(async () => {
    if (!selectedCourses.length) {
      setAvailablePaymentPlans([]);
      setSelectedPaymentPlan(null);
      return;
    }

    try {
      setLoadingPaymentPlans(true);

      const ids = selectedCourses.map((c) => c.courseId).join(",");

      const res = await fetch(`/api/academy/payment-plans?courses=${ids}`);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to load payment plans.");
      }

      const plans = data.paymentPlans || [];

      setAvailablePaymentPlans(plans);

      // Auto-select default / first plan
      if (plans.length) {
        const defaultPlan = plans.find((p) => p.is_default) || plans[0];

        setSelectedPaymentPlan(defaultPlan);
      } else {
        setSelectedPaymentPlan(null);
      }
    } catch (err) {
      console.error(err);

      setAvailablePaymentPlans([]);
      setSelectedPaymentPlan(null);
    } finally {
      setLoadingPaymentPlans(false);
    }
  }, [selectedCourses]);

  useEffect(() => {
    loadPaymentPlans();
  }, [loadPaymentPlans]);

  //----------------------------------------------------------
  // Payment Calculations
  //----------------------------------------------------------

  const paymentBreakdown = useMemo(() => {
    if (!selectedPaymentPlan)
      return {
        courseFee: totalFee,
        adjustedTotal: totalFee,
        additionalFee: 0,
        deposit: 0,
        remaining: totalFee,
        remainingPayments: 0,
        installmentAmount: 0,
      };

    const interest = Number(selectedPaymentPlan.additional_fee_percentage) || 0;

    const adjustedTotal = Number(totalFee * (1 + interest / 100)).toFixed(2);

    const deposit =
      adjustedTotal *
      (Number(selectedPaymentPlan.initial_payment_percentage) / 100);

    const remaining = Number(adjustedTotal - deposit).toFixed(2);

    const remainingPayments = Math.max(
      Number(selectedPaymentPlan.number_of_payments) - 1,
      0,
    );

    const installmentAmount = remainingPayments
      ? Number((remaining / remainingPayments).toFixed(2))
      : 0;

    return {
      courseFee: totalFee,

      additionalFee: interest,

      adjustedTotal,

      deposit,

      remaining,

      remainingPayments,

      installmentAmount,

      paymentFrequency: selectedPaymentPlan.monthly_interval,
    };
  }, [selectedPaymentPlan, totalFee]);
  //----------------------------------------------------------
  // Payload
  //----------------------------------------------------------

  const enrollmentCourses = useMemo(() => {
    return selectedCourses.map((course) => ({
      course_id: course.courseId,
      pricing_id: course.pricingId,
      duration_months: course.duration,
      amount: Number(course.price),
    }));
  }, [selectedCourses]);

  //----------------------------------------------------------
  // Reset
  //----------------------------------------------------------

  const resetPricing = useCallback(() => {
    setLearningMode("");
    setSelectedCourses([]);
    setAvailablePaymentPlans([]);
    setSelectedPaymentPlan(null);
  }, []);

  //----------------------------------------------------------

  return {
    learningMode,
    selectedCourses,

    totalFee,

    enrollmentCourses,

    availablePaymentPlans,
    setAvailablePaymentPlans,

    loadingPaymentPlans,
    loadPaymentPlans,

    selectedPaymentPlan,
    setSelectedPaymentPlan,
    selectPaymentPlan,

    paymentBreakdown,

    updateLearningMode,
    toggleCourse,
    updateDuration,

    isSelected,
    getSelectedCourse,
    getAvailableDurations,

    getCourse,
    findPricing,
    getCurrentPrice,

    resetPricing,
  };
}
