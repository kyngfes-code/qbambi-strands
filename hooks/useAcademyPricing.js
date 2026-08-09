"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export default function useAcademyPricing(courses = []) {
  //----------------------------------------------------------
  // State
  //----------------------------------------------------------

  const [learningModeFilter, setLearningModeFilter] = useState("all");

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
  // Visible Courses
  //----------------------------------------------------------

  const visibleCourses = useMemo(() => {
    if (learningModeFilter === "all") {
      return courses;
    }

    return courses.filter((course) =>
      (course.pricing ?? []).some(
        (pricing) =>
          pricing.learning_mode === learningModeFilter &&
          pricing.active !== false,
      ),
    );
  }, [courses, learningModeFilter]);

  //----------------------------------------------------------
  // Pricing Helpers
  //----------------------------------------------------------

  const findPricing = useCallback(
    (courseId, mode, duration) => {
      if (!mode) return null;

      const course = getCourse(courseId);

      if (!course) return null;

      return (
        (course.pricing ?? []).find(
          (pricing) =>
            pricing.learning_mode === mode &&
            pricing.active !== false &&
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
            currency: pricing?.currency ?? "NGN",
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
            currency: pricing?.currency ?? "NGN",
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
          console.log("Pricing Object", pricing);
          return {
            ...course,
            duration: Number(duration),
            pricingId: pricing?.id ?? null,
            price: Number(pricing?.price ?? 0),
            currency: pricing?.currency ?? "NGN",
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
    if (!selectedPaymentPlan) {
      return {
        courseFee: Number(totalFee),
        adjustedTotal: Number(totalFee),
        extraPercentage: 0,
        extraAmount: 0,
        deposit: 0,
        remaining: Number(totalFee),
        remainingPayments: 0,
        installmentAmount: 0,
        paymentFrequency: 1,
      };
    }

    const extraPercentage = Number(selectedPaymentPlan.extra_percentage ?? 0);

    const extraAmount = (Number(totalFee) * extraPercentage) / 100;

    const adjustedTotal = Number(totalFee) + extraAmount;

    const deposit =
      adjustedTotal *
      (Number(selectedPaymentPlan.initial_payment_percentage ?? 0) / 100);

    const remaining = adjustedTotal - deposit;

    const remainingPayments = Math.max(
      Number(selectedPaymentPlan.number_of_payments) - 1,
      0,
    );

    const installmentAmount =
      remainingPayments > 0 ? remaining / remainingPayments : 0;

    return {
      courseFee: Number(totalFee),
      extraPercentage,
      extraAmount: Number(extraAmount),
      adjustedTotal: Number(adjustedTotal),
      deposit: Number(deposit),
      remaining: Number(remaining),
      remainingPayments,
      installmentAmount: Number(installmentAmount),
      paymentFrequency: Number(
        selectedPaymentPlan.payment_interval_months ?? 1,
      ),
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

  const currency = useMemo(() => {
    return selectedCourses[0]?.currency ?? "NGN";
  }, [selectedCourses]);

  return {
    learningMode,

    learningModeFilter,
    setLearningModeFilter,

    visibleCourses,

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

    currency,
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
