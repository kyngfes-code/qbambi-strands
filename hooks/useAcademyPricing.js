"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export default function useAcademyPricing(courses = []) {
  // ==========================================================
  // STATE
  // ==========================================================

  const [learningModeFilter, setLearningModeFilter] = useState("all");

  const [learningMode, setLearningMode] = useState("");

  const [selectedCourse, setSelectedCourse] = useState(null);

  const [availablePaymentPlans, setAvailablePaymentPlans] = useState([]);

  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState(null);

  const [loadingPaymentPlans, setLoadingPaymentPlans] = useState(false);

  // ==========================================================
  // COURSE HELPERS
  // ==========================================================

  const getCourse = useCallback(
    (courseId) => {
      if (!courseId) {
        return null;
      }

      return courses.find((course) => String(course.id) === String(courseId));
    },
    [courses],
  );

  // ==========================================================
  // VISIBLE COURSES
  // ==========================================================

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

  // ==========================================================
  // PRICING HELPERS
  // ==========================================================

  const findPricing = useCallback(
    (courseId, mode, duration) => {
      if (!courseId || !mode || !duration) {
        return null;
      }

      const course = getCourse(courseId);

      if (!course) {
        return null;
      }

      return (
        (course.pricing ?? []).find(
          (pricing) =>
            pricing.learning_mode === mode &&
            pricing.active !== false &&
            Number(pricing.duration_months) === Number(duration),
        ) ?? null
      );
    },
    [getCourse],
  );

  // ==========================================================
  // AVAILABLE DURATIONS
  // ==========================================================

  const getAvailableDurations = useCallback(
    (courseId, mode = learningMode) => {
      if (!courseId || !mode) {
        return [];
      }

      const course = getCourse(courseId);

      if (!course) {
        return [];
      }

      return [
        ...new Set(
          (course.pricing ?? [])
            .filter(
              (pricing) =>
                pricing.learning_mode === mode && pricing.active !== false,
            )
            .map((pricing) => Number(pricing.duration_months))
            .filter((duration) => Number.isFinite(duration) && duration > 0),
        ),
      ].sort((a, b) => a - b);
    },
    [getCourse, learningMode],
  );

  // ==========================================================
  // CURRENT PRICE
  // ==========================================================

  const getCurrentPrice = useCallback(
    (courseId, duration) => {
      const pricing = findPricing(courseId, learningMode, duration);

      return Number(pricing?.price ?? 0);
    },
    [findPricing, learningMode],
  );

  // ==========================================================
  // LEARNING MODE
  // ==========================================================

  const updateLearningMode = useCallback(
    (mode) => {
      console.log("========== UPDATE LEARNING MODE ==========");

      console.log("New learning mode:", mode);
      console.log("Previous selected course:", selectedCourse);

      setLearningMode(mode);

      if (!selectedCourse) {
        console.log("No selected course. Clearing payment plans.");

        setSelectedPaymentPlan(null);
        setAvailablePaymentPlans([]);

        return;
      }

      const durations = getAvailableDurations(selectedCourse.courseId, mode);

      console.log("Available durations:", durations);

      const duration = durations.includes(Number(selectedCourse.duration))
        ? Number(selectedCourse.duration)
        : (durations[0] ?? null);

      console.log("Selected duration after mode change:", duration);

      const pricing = duration
        ? findPricing(selectedCourse.courseId, mode, duration)
        : null;

      console.log("Pricing after mode change:", pricing);

      setSelectedCourse({
        ...selectedCourse,

        duration,

        pricingId: pricing?.id ?? null,

        price: Number(pricing?.price ?? 0),

        currency: pricing?.currency ?? "NGN",
      });

      // Pricing changed, so payment plan must be reloaded.
      setSelectedPaymentPlan(null);
      setAvailablePaymentPlans([]);

      console.log("===========================================");
    },
    [selectedCourse, findPricing, getAvailableDurations],
  );

  // ==========================================================
  // SELECT COURSE
  //
  // ONE ENROLLMENT = ONE COURSE
  // ==========================================================

  const selectCourse = useCallback(
    (courseId) => {
      console.log("========== SELECT COURSE ==========");

      console.log("courseId:", courseId);
      console.log("learningMode:", learningMode);

      const course = getCourse(courseId);

      console.log("Found course:", course);

      if (!course) {
        console.warn("Course not found. Clearing selection.");

        setSelectedCourse(null);
        setSelectedPaymentPlan(null);
        setAvailablePaymentPlans([]);

        return;
      }

      const durations = getAvailableDurations(courseId);

      console.log("Available durations:", durations);

      if (!durations.length) {
        console.warn("No durations available for selected course.");

        setSelectedCourse({
          courseId,

          duration: null,

          pricingId: null,

          price: 0,

          currency: "NGN",
        });

        setSelectedPaymentPlan(null);
        setAvailablePaymentPlans([]);

        return;
      }

      const duration = durations[0];

      const pricing = findPricing(courseId, learningMode, duration);

      console.log("Selected duration:", duration);
      console.log("Selected pricing:", pricing);

      setSelectedCourse({
        courseId,

        duration,

        pricingId: pricing?.id ?? null,

        price: Number(pricing?.price ?? 0),

        currency: pricing?.currency ?? "NGN",
      });

      // Payment plans belong to the selected course.
      setSelectedPaymentPlan(null);
      setAvailablePaymentPlans([]);

      console.log("====================================");
    },
    [getCourse, getAvailableDurations, findPricing, learningMode],
  );

  // ==========================================================
  // TOGGLE COURSE
  //
  // BACKWARD COMPATIBILITY
  // ==========================================================

  const toggleCourse = useCallback(
    (courseId) => {
      console.log("========== TOGGLE COURSE ==========");

      console.log("courseId:", courseId);
      console.log("Current selected course:", selectedCourse);

      if (
        selectedCourse &&
        String(selectedCourse.courseId) === String(courseId)
      ) {
        console.log("Deselecting course.");

        setSelectedCourse(null);
        setSelectedPaymentPlan(null);
        setAvailablePaymentPlans([]);

        return;
      }

      console.log("Selecting course.");

      selectCourse(courseId);

      console.log("====================================");
    },
    [selectedCourse, selectCourse],
  );

  // ==========================================================
  // UPDATE DURATION
  // ==========================================================

  const updateDuration = useCallback(
    (courseId, duration) => {
      console.log("========== UPDATE COURSE DURATION ==========");

      console.log("courseId:", courseId);
      console.log("duration:", duration);
      console.log("learningMode:", learningMode);

      if (!selectedCourse) {
        console.warn("Cannot update duration: no selected course.");

        return;
      }

      if (String(selectedCourse.courseId) !== String(courseId)) {
        console.warn(
          "Cannot update duration: course does not match selected course.",
        );

        return;
      }

      const numericDuration = Number(duration);

      const pricing = findPricing(courseId, learningMode, numericDuration);

      console.log("Pricing for new duration:", pricing);

      setSelectedCourse((previous) => ({
        ...previous,

        duration: numericDuration,

        pricingId: pricing?.id ?? null,

        price: Number(pricing?.price ?? 0),

        currency: pricing?.currency ?? "NGN",
      }));

      // Duration changed, therefore previous payment plan
      // may no longer apply.
      setSelectedPaymentPlan(null);
      setAvailablePaymentPlans([]);

      console.log("==============================================");
    },
    [selectedCourse, findPricing, learningMode],
  );

  // ==========================================================
  // SELECT PAYMENT PLAN
  // ==========================================================

  const selectPaymentPlan = useCallback((plan) => {
    console.log("========== SELECT PAYMENT PLAN ==========");

    console.log("Selected payment plan:", plan);

    setSelectedPaymentPlan(plan);

    console.log("=========================================");
  }, []);

  // ==========================================================
  // SELECTED STATE
  // ==========================================================

  const isSelected = useCallback(
    (courseId) => {
      return Boolean(
        selectedCourse && String(selectedCourse.courseId) === String(courseId),
      );
    },
    [selectedCourse],
  );

  const getSelectedCourse = useCallback(
    (courseId) => {
      if (
        selectedCourse &&
        String(selectedCourse.courseId) === String(courseId)
      ) {
        return selectedCourse;
      }

      return null;
    },
    [selectedCourse],
  );

  // ==========================================================
  // COURSE FEE
  // ==========================================================

  const totalFee = useMemo(() => {
    return Number(selectedCourse?.price ?? 0);
  }, [selectedCourse]);

  // ==========================================================
  // LOAD PAYMENT PLANS
  //
  // API EXPECTS:
  //
  // /api/academy/payment-plans?courses=id1,id2
  //
  // NOT:
  //
  // /api/academy/payment-plans?course_id=id
  // ==========================================================

  const loadPaymentPlans = useCallback(async () => {
    console.log("========== LOAD PAYMENT PLANS ==========");

    console.log("Selected course:", selectedCourse);

    console.log("Learning mode:", learningMode);

    // ------------------------------------------------------
    // No selected course
    // ------------------------------------------------------

    if (!selectedCourse?.courseId) {
      console.log("No selected course. Clearing payment plans.");

      setAvailablePaymentPlans([]);
      setSelectedPaymentPlan(null);
      setLoadingPaymentPlans(false);

      return;
    }

    const courseId = String(selectedCourse.courseId).trim();

    // ------------------------------------------------------
    // Invalid course ID
    // ------------------------------------------------------

    if (!courseId) {
      console.warn("Selected course ID is empty.");

      setAvailablePaymentPlans([]);
      setSelectedPaymentPlan(null);
      setLoadingPaymentPlans(false);

      return;
    }

    // ------------------------------------------------------
    // Build API URL
    // ------------------------------------------------------

    const params = new URLSearchParams();

    /*
     * IMPORTANT:
     *
     * The API route expects `courses`,
     * not `course_id`.
     */

    params.set("courses", courseId);

    const url = `/api/academy/payment-plans?${params.toString()}`;

    console.log("Payment plan request URL:", url);

    console.log("Payment plan request course IDs:", [courseId]);

    // ------------------------------------------------------
    // Request
    // ------------------------------------------------------

    try {
      setLoadingPaymentPlans(true);

      const res = await fetch(url, {
        method: "GET",
        cache: "no-store",
      });

      console.log("Payment plan HTTP status:", res.status);

      console.log("Payment plan HTTP ok:", res.ok);

      // ----------------------------------------------------
      // Parse response
      // ----------------------------------------------------

      const data = await res.json();

      console.log("Payment plan response data:", data);

      // ----------------------------------------------------
      // API error
      // ----------------------------------------------------

      if (!res.ok) {
        console.error("Payment plan API returned an error:", {
          status: res.status,
          statusText: res.statusText,
          data,
          url,
        });

        throw new Error(data?.error || "Unable to load payment plans.");
      }

      // ----------------------------------------------------
      // Normalize plans
      // ----------------------------------------------------

      const plans = Array.isArray(data?.paymentPlans) ? data.paymentPlans : [];

      console.log("Normalized payment plans:", plans);

      console.log("Payment plan count:", plans.length);

      // ----------------------------------------------------
      // Store plans
      // ----------------------------------------------------

      setAvailablePaymentPlans(plans);

      // ----------------------------------------------------
      // Automatically select default plan
      // ----------------------------------------------------

      if (plans.length > 0) {
        const defaultPlan =
          plans.find((plan) => plan.is_default === true) || plans[0];

        console.log("Automatically selected payment plan:", defaultPlan);

        setSelectedPaymentPlan(defaultPlan);
      } else {
        console.warn("API returned zero payment plans.");

        setSelectedPaymentPlan(null);
      }
    } catch (error) {
      console.error("Academy payment plan loading error:", error);

      setAvailablePaymentPlans([]);
      setSelectedPaymentPlan(null);
    } finally {
      setLoadingPaymentPlans(false);

      console.log("========== END LOAD PAYMENT PLANS ==========");
    }
  }, [selectedCourse, learningMode]);

  // ==========================================================
  // LOAD PLANS WHEN SELECTED COURSE CHANGES
  // ==========================================================

  useEffect(() => {
    loadPaymentPlans();
  }, [loadPaymentPlans]);

  // ==========================================================
  // PAYMENT BREAKDOWN
  // ==========================================================

  const paymentBreakdown = useMemo(() => {
    const courseFee = Number(totalFee);

    // ------------------------------------------------------
    // No payment plan selected
    // ------------------------------------------------------

    if (!selectedPaymentPlan) {
      return {
        courseFee,

        adjustedTotal: courseFee,

        extraPercentage: 0,

        extraAmount: 0,

        deposit: 0,

        remaining: courseFee,

        remainingPayments: 0,

        installmentAmount: 0,

        paymentFrequency: 1,
      };
    }

    // ------------------------------------------------------
    // Plan values
    // ------------------------------------------------------

    const extraPercentage = Number(selectedPaymentPlan.extra_percentage ?? 0);

    const initialPaymentPercentage = Number(
      selectedPaymentPlan.initial_payment_percentage ?? 0,
    );

    const numberOfPayments = Number(
      selectedPaymentPlan.number_of_payments ?? 1,
    );

    const paymentIntervalMonths = Number(
      selectedPaymentPlan.payment_interval_months ?? 1,
    );

    // ------------------------------------------------------
    // Calculations
    // ------------------------------------------------------

    const extraAmount = (courseFee * extraPercentage) / 100;

    const adjustedTotal = courseFee + extraAmount;

    const deposit = adjustedTotal * (initialPaymentPercentage / 100);

    const remaining = Math.max(adjustedTotal - deposit, 0);

    const remainingPayments = Math.max(numberOfPayments - 1, 0);

    const installmentAmount =
      remainingPayments > 0 ? remaining / remainingPayments : 0;

    return {
      courseFee,

      adjustedTotal,

      extraPercentage,

      extraAmount,

      deposit,

      remaining,

      remainingPayments,

      installmentAmount,

      paymentFrequency: paymentIntervalMonths,
    };
  }, [selectedPaymentPlan, totalFee]);

  // ==========================================================
  // ENROLLMENT COURSE
  //
  // ONE COURSE ONLY
  // ==========================================================

  const enrollmentCourse = useMemo(() => {
    if (!selectedCourse) {
      return null;
    }

    return {
      course_id: selectedCourse.courseId,

      pricing_id: selectedCourse.pricingId,

      duration_months: selectedCourse.duration,

      amount: Number(selectedCourse.price ?? 0),

      currency: selectedCourse.currency ?? "NGN",
    };
  }, [selectedCourse]);

  // ==========================================================
  // RESET
  // ==========================================================

  const resetPricing = useCallback(() => {
    console.log("========== RESET ACADEMY PRICING ==========");

    setLearningMode("");

    setSelectedCourse(null);

    setAvailablePaymentPlans([]);

    setSelectedPaymentPlan(null);

    setLoadingPaymentPlans(false);

    console.log("============================================");
  }, []);

  // ==========================================================
  // CURRENCY
  // ==========================================================

  const currency = useMemo(() => {
    return selectedCourse?.currency ?? "NGN";
  }, [selectedCourse]);

  // ==========================================================
  // RETURN
  // ==========================================================

  return {
    // --------------------------------------------------------
    // Learning mode
    // --------------------------------------------------------

    learningMode,

    learningModeFilter,

    setLearningModeFilter,

    updateLearningMode,

    // --------------------------------------------------------
    // Courses
    // --------------------------------------------------------

    visibleCourses,

    selectedCourse,

    // Backward compatibility
    selectedCourses: selectedCourse ? [selectedCourse] : [],

    selectCourse,

    toggleCourse,

    isSelected,

    getSelectedCourse,

    getCourse,

    findPricing,

    getAvailableDurations,

    getCurrentPrice,

    updateDuration,

    // --------------------------------------------------------
    // Pricing
    // --------------------------------------------------------

    totalFee,

    currency,

    // --------------------------------------------------------
    // Payment plans
    // --------------------------------------------------------

    availablePaymentPlans,

    setAvailablePaymentPlans,

    loadingPaymentPlans,

    loadPaymentPlans,

    selectedPaymentPlan,

    setSelectedPaymentPlan,

    selectPaymentPlan,

    // --------------------------------------------------------
    // Payment calculations
    // --------------------------------------------------------

    paymentBreakdown,

    // --------------------------------------------------------
    // Enrollment payload
    // --------------------------------------------------------

    enrollmentCourse,

    // Backward-compatible payload
    enrollmentCourses: enrollmentCourse ? [enrollmentCourse] : [],

    // --------------------------------------------------------
    // Reset
    // --------------------------------------------------------

    resetPricing,
  };
}
