"use client";

import { AnimatePresence, motion } from "framer-motion";
import WizardProgress from "./WizardProgress";
import WizardNavigation from "./WizardNavigation";

export default function AcademyEnrollmentWizard({
  wizard,
  steps,
  courses,
  pricing,
  loading,
  onSubmit,
}) {
  const CurrentStep = wizard.activeStep?.component;

  if (!CurrentStep) return null;

  return (
    <div className="space-y-8">
      {/* Progress */}

      <WizardProgress
        currentStep={wizard.currentStep}
        percentComplete={wizard.percentComplete}
        steps={steps}
      />

      {/* Active Step */}

      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={wizard.activeStep.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="p-6 sm:p-8 lg:p-10"
          >
            {/* Header */}

            <div className="mb-8  min-w-0 border-b border-neutral-200 pb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C6A667]">
                Step {wizard.currentStep + 1} of {steps.length}
              </p>

              <h2 className="mt-3 break-words text-2xl font-bold leading-tight text-neutral-900 sm:text-3xl">
                {wizard.activeStep.title}
              </h2>

              {wizard.activeStep.description && (
                <p className="mt-3 max-w-full break-words text-sm leading-7 text-neutral-500 sm:text-base">
                  {wizard.activeStep.description}
                </p>
              )}
            </div>

            {/* Current Section */}

            <CurrentStep
              courses={courses}
              pricing={pricing}
              totalFee={pricing.totalFee}
              selectedCourses={pricing.selectedCourses}
              wizard={wizard}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}

      <WizardNavigation wizard={wizard} loading={loading} onSubmit={onSubmit} />
    </div>
  );
}
