"use client";

import { useCallback, useMemo, useState } from "react";

export default function useWizard({
  steps = [],
  methods,
  persistKey = "academy-enrollment-step",
}) {
  const {
    trigger,
    getValues,
    formState: { isSubmitting },
  } = methods;

  //--------------------------------------------------
  // Current Step
  //--------------------------------------------------

  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window === "undefined") return 0;

    const saved = localStorage.getItem(persistKey);

    return saved ? Number(saved) : 0;
  });

  //--------------------------------------------------
  // Save progress
  //--------------------------------------------------

  const saveStep = useCallback(
    (step) => {
      setCurrentStep(step);

      if (typeof window !== "undefined") {
        localStorage.setItem(persistKey, String(step));
      }
    },
    [persistKey],
  );

  //--------------------------------------------------
  // Current Step Config
  //--------------------------------------------------

  const activeStep = useMemo(
    () => steps[currentStep] || {},
    [steps, currentStep],
  );

  //--------------------------------------------------
  // Validation
  //--------------------------------------------------

  const validateCurrentStep = useCallback(async () => {
    if (!activeStep.fields?.length) return true;

    return await trigger(activeStep.fields, {
      shouldFocus: true,
    });
  }, [activeStep.fields, trigger]);

  //--------------------------------------------------
  // Navigation
  //--------------------------------------------------

  const next = useCallback(async () => {
    const valid = await validateCurrentStep();

    if (!valid) return false;

    saveStep(Math.min(currentStep + 1, steps.length - 1));

    return true;
  }, [currentStep, saveStep, steps.length, validateCurrentStep]);

  const previous = useCallback(() => {
    saveStep(Math.max(currentStep - 1, 0));
  }, [currentStep, saveStep]);

  const goTo = useCallback(
    async (step) => {
      if (step < currentStep) {
        saveStep(step);
        return;
      }

      const valid = await validateCurrentStep();

      if (!valid) return;

      saveStep(step);
    },
    [currentStep, saveStep, validateCurrentStep],
  );

  //--------------------------------------------------
  // Reset
  //--------------------------------------------------

  const resetWizard = useCallback(() => {
    saveStep(0);

    if (typeof window !== "undefined") {
      localStorage.removeItem(persistKey);
    }
  }, [persistKey, saveStep]);

  //--------------------------------------------------
  // Completion
  //--------------------------------------------------

  const percentComplete = useMemo(() => {
    if (!steps.length) return 0;

    return ((currentStep + 1) / steps.length) * 100;
  }, [currentStep, steps.length]);

  //--------------------------------------------------
  // Helpers
  //--------------------------------------------------

  const isFirstStep = currentStep === 0;

  const isLastStep = currentStep === steps.length - 1;

  const totalSteps = steps.length;

  //--------------------------------------------------

  return {
    currentStep,

    activeStep,

    totalSteps,

    percentComplete,

    isFirstStep,

    isLastStep,

    values: getValues(),

    isSubmitting,

    next,

    previous,

    goTo,

    resetWizard,
  };
}
