"use client";

import { Check } from "lucide-react";

const DEFAULT_STEPS = [
  {
    id: 1,
    title: "Service",
    description: "Choose Service",
  },
  {
    id: 2,
    title: "Schedule",
    description: "Date & Time",
  },
  {
    id: 3,
    title: "Details",
    description: "Additional Notes",
  },
  {
    id: 4,
    title: "Review",
    description: "Confirm Booking",
  },
];

export default function AppointmentProgress({
  currentStep = 1,
  steps = DEFAULT_STEPS,
}) {
  return (
    <div className="w-full rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      {/* Desktop */}

      <div className="hidden lg:flex lg:items-center lg:justify-between">
        {steps.map((step, index) => {
          const completed = currentStep > step.id;
          const active = currentStep === step.id;

          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex items-center">
                {/* Circle */}

                <div
                  className={`
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    text-sm
                    font-bold
                    transition-all
                    duration-300

                    ${
                      completed
                        ? "border-green-600 bg-green-600 text-white"
                        : active
                          ? "border-amber-500 bg-amber-500 text-white shadow-lg"
                          : "border-neutral-300 bg-white text-neutral-500"
                    }
                  `}
                >
                  {completed ? <Check size={20} /> : step.id}
                </div>

                {/* Text */}

                <div className="ml-4">
                  <p
                    className={`text-sm font-semibold ${
                      active
                        ? "text-amber-700"
                        : completed
                          ? "text-green-700"
                          : "text-neutral-500"
                    }`}
                  >
                    Step {step.id}
                  </p>

                  <h3 className="font-semibold text-neutral-900">
                    {step.title}
                  </h3>

                  <p className="text-sm text-neutral-500">{step.description}</p>
                </div>
              </div>

              {/* Connector */}

              {index !== steps.length - 1 && (
                <div className="mx-6 h-[2px] flex-1 overflow-hidden rounded-full bg-neutral-200">
                  <div
                    className={`h-full transition-all duration-500 ${
                      completed ? "w-full bg-green-600" : "w-0 bg-green-600"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tablet */}

      <div className="hidden items-center justify-center gap-6 sm:flex lg:hidden">
        {steps.map((step) => {
          const completed = currentStep > step.id;
          const active = currentStep === step.id;

          return (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={`
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  border-2
                  font-semibold

                  ${
                    completed
                      ? "border-green-600 bg-green-600 text-white"
                      : active
                        ? "border-amber-500 bg-amber-500 text-white"
                        : "border-neutral-300 bg-white"
                  }
                `}
              >
                {completed ? <Check size={18} /> : step.id}
              </div>

              <p
                className={`mt-2 text-xs font-medium ${
                  active ? "text-amber-700" : "text-neutral-500"
                }`}
              >
                {step.title}
              </p>
            </div>
          );
        })}
      </div>

      {/* Mobile */}

      <div className="sm:hidden">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-neutral-900">
            Step {currentStep} of {steps.length}
          </h3>

          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            {steps[currentStep - 1]?.title}
          </span>
        </div>

        {/* Progress */}

        <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full rounded-full bg-amber-500 transition-all duration-500"
            style={{
              width: `${(currentStep / steps.length) * 100}%`,
            }}
          />
        </div>

        <p className="mt-3 text-sm text-neutral-500">
          {steps[currentStep - 1]?.description}
        </p>
      </div>
    </div>
  );
}
