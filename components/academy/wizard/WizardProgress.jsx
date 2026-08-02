"use client";

import { Check } from "lucide-react";

export default function WizardProgress({
  currentStep,
  steps,
  percentComplete,
}) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      {/* Header */}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-[#C6A667]">
            Academy Enrollment
          </p>

          <h3 className="mt-1 text-xl font-bold">
            Step {currentStep + 1} of {steps.length}
          </h3>
        </div>

        <div className="text-right">
          <p className="text-sm text-neutral-500">
            {Math.round(percentComplete)}% Complete
          </p>
        </div>
      </div>

      {/* Progress Bar */}

      <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full bg-[#C6A667] transition-all duration-500"
          style={{
            width: `${percentComplete}%`,
          }}
        />
      </div>

      {/* Desktop Steps */}

      <div className="mt-8 hidden lg:flex">
        {steps.map((step, index) => {
          const completed = index < currentStep;
          const active = index === currentStep;

          return (
            <div
              key={step.id}
              className="relative flex flex-1 flex-col items-center"
            >
              {/* Connector */}

              {index !== steps.length - 1 && (
                <div
                  className={`absolute top-5 left-1/2 h-[2px] w-full ${
                    completed ? "bg-[#C6A667]" : "bg-neutral-200"
                  }`}
                />
              )}

              {/* Circle */}

              <div
                className={`
                    relative
                    z-10
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    transition-all
                    duration-300

                    ${
                      completed
                        ? "border-[#C6A667] bg-[#C6A667] text-white"
                        : active
                          ? "border-[#C6A667] bg-white text-[#C6A667]"
                          : "border-neutral-300 bg-white text-neutral-400"
                    }
                `}
              >
                {completed ? <Check className="h-5 w-5" /> : index + 1}
              </div>

              {/* Label */}

              <div className="mt-3 text-center">
                <p
                  className={`text-sm font-semibold ${
                    active
                      ? "text-[#C6A667]"
                      : completed
                        ? "text-neutral-800"
                        : "text-neutral-400"
                  }`}
                >
                  {step.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile */}

      <div className="mt-6 lg:hidden">
        <div className="flex items-center justify-center gap-2">
          {steps.map((_, index) => (
            <span
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "w-8 bg-[#C6A667]"
                  : index < currentStep
                    ? "w-2 bg-[#C6A667]"
                    : "w-2 bg-neutral-300"
              }`}
            />
          ))}
        </div>

        <p className="mt-4 text-center text-lg font-semibold">
          {steps[currentStep]?.title}
        </p>

        <p className="mt-1 text-center text-sm text-neutral-500">
          {steps[currentStep]?.description}
        </p>
      </div>
    </div>
  );
}
