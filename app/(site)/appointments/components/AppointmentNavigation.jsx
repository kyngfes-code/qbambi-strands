"use client";

import { ArrowLeft, ArrowRight, Loader2, Check } from "lucide-react";

export default function AppointmentNavigation({
  currentStep = 1,
  totalSteps = 4,

  canProceed = true,

  loading = false,

  showSkip = false,

  onBack,
  onNext,
  onSubmit,
  onSkip,
}) {
  const firstStep = currentStep === 1;
  const lastStep = currentStep === totalSteps;

  return (
    <div className="sticky bottom-0 z-30 mt-10 border-t border-neutral-200 bg-white/90 backdrop-blur">
      <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Left */}

        <div className="flex gap-3">
          {!firstStep && (
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-neutral-300
                bg-white
                px-5
                py-3
                font-medium
                transition
                hover:bg-neutral-100
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <ArrowLeft size={18} />
              Back
            </button>
          )}

          {showSkip && !lastStep && (
            <button
              type="button"
              onClick={onSkip}
              disabled={loading}
              className="
                rounded-xl
                px-5
                py-3
                font-medium
                text-neutral-500
                transition
                hover:text-neutral-900
                disabled:opacity-40
              "
            >
              Skip
            </button>
          )}
        </div>

        {/* Step Counter */}

        <div className="hidden text-sm font-medium text-neutral-500 md:block">
          Step{" "}
          <span className="font-semibold text-neutral-900">{currentStep}</span>{" "}
          of{" "}
          <span className="font-semibold text-neutral-900">{totalSteps}</span>
        </div>

        {/* Right */}

        {!lastStep ? (
          <button
            type="button"
            onClick={onNext}
            disabled={!canProceed || loading}
            className={`
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              px-7
              py-3
              font-semibold
              transition-all

              ${
                canProceed && !loading
                  ? "bg-amber-500 text-white hover:bg-amber-600"
                  : "cursor-not-allowed bg-neutral-300 text-neutral-500"
              }
            `}
          >
            Continue
            <ArrowRight size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canProceed || loading}
            className={`
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              px-7
              py-3
              font-semibold
              transition-all

              ${
                canProceed && !loading
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "cursor-not-allowed bg-neutral-300 text-neutral-500"
              }
            `}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Booking...
              </>
            ) : (
              <>
                <Check size={18} />
                Submit Appointment
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
