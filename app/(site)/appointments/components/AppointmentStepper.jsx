"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import AppointmentProgress from "./AppointmentProgress";
import AppointmentSummary from "./AppointmentSummary";
import AppointmentServiceGrid from "./AppointmentServiceGrid";
import AppointmentDateStep from "./AppointmentDateStep";
import AppointmentNotesStep from "./AppointmentNotesStep";
import AppointmentReviewStep from "./AppointmentReviewStep";
import AppointmentNavigation from "./AppointmentNavigation";
import AppointmentSuccess from "./AppointmentSuccess";

const STEPS = [
  {
    id: 1,
    title: "Service",
    description: "Choose your service",
  },
  {
    id: 2,
    title: "Schedule",
    description: "Select date & time",
  },
  {
    id: 3,
    title: "Notes",
    description: "Tell us more",
  },
  {
    id: 4,
    title: "Review",
    description: "Confirm booking",
  },
];

export default function AppointmentStepper({ services = [] }) {
  const router = useRouter();

  /* -------------------------------- */
  /* State                            */
  /* -------------------------------- */

  const [step, setStep] = useState(1);

  const [selectedService, setSelectedService] = useState(null);

  const [appointmentDate, setAppointmentDate] = useState("");

  const [appointmentTime, setAppointmentTime] = useState("");

  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  /* -------------------------------- */
  /* Progress                         */
  /* -------------------------------- */

  const progress = useMemo(() => {
    return Math.round((step / STEPS.length) * 100);
  }, [step]);

  /* -------------------------------- */
  /* Validation                       */
  /* -------------------------------- */

  function validateCurrentStep() {
    switch (step) {
      case 1:
        if (!selectedService) {
          toast.error("Please select a service.");
          return false;
        }
        return true;

      case 2:
        if (!appointmentDate) {
          toast.error("Please choose an appointment date.");
          return false;
        }

        if (!appointmentTime) {
          toast.error("Please choose an appointment time.");
          return false;
        }

        return true;

      case 3:
        return true;

      case 4:
        return true;

      default:
        return true;
    }
  }

  /* -------------------------------- */
  /* Navigation                       */
  /* -------------------------------- */

  function handleNext() {
    if (!validateCurrentStep()) return;

    if (step < STEPS.length) {
      setStep((prev) => prev + 1);
    }
  }

  function handlePrevious() {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  }

  function jumpToStep(targetStep) {
    if (targetStep < step) {
      setStep(targetStep);
      return;
    }

    if (validateCurrentStep()) {
      setStep(targetStep);
    }
  }

  /* -------------------------------- */
  /* Submit                           */
  /* -------------------------------- */

  async function handleSubmit() {
    if (!validateCurrentStep()) return;

    try {
      setLoading(true);

      const response = await fetch("/api/appointments", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          service_name:
            selectedService.name ??
            selectedService.title ??
            selectedService.service_name,

          appointment_date: appointmentDate,

          appointment_time: appointmentTime,

          notes,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        toast.error("Please sign in to continue.");

        router.push("/api/auth/signin");

        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Unable to submit appointment.");
      }

      toast.success("Appointment request submitted successfully.");

      setSubmitted(true);
    } catch (error) {
      console.error(error);

      toast.error(error.message || "Something went wrong while booking.");
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------------- */
  /* Success Screen                   */
  /* -------------------------------- */

  if (submitted) {
    return (
      <AppointmentSuccess
        service={selectedService}
        appointmentDate={appointmentDate}
        appointmentTime={appointmentTime}
      />
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Progress */}

      <AppointmentProgress
        steps={STEPS}
        currentStep={step}
        progress={progress}
        onStepClick={jumpToStep}
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Main Content */}

        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
          {/* Header */}

          <div className="border-b border-neutral-100 px-6 py-6 sm:px-8">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
              Step {step} of {STEPS.length}
            </span>

            <h2 className="mt-2 text-3xl font-bold text-neutral-900">
              {STEPS[step - 1].title}
            </h2>

            <p className="mt-2 text-neutral-500">
              {STEPS[step - 1].description}
            </p>
          </div>

          {/* Step Content */}

          <div className="p-6 sm:p-8">
            {step === 1 && (
              <AppointmentServiceGrid
                services={services}
                selectedService={selectedService}
                onSelect={setSelectedService}
              />
            )}

            {step === 2 && (
              <AppointmentDateStep
                appointmentDate={appointmentDate}
                appointmentTime={appointmentTime}
                setAppointmentDate={setAppointmentDate}
                setAppointmentTime={setAppointmentTime}
              />
            )}

            {step === 3 && (
              <AppointmentNotesStep notes={notes} setNotes={setNotes} />
            )}

            {step === 4 && (
              <AppointmentReviewStep
                service={selectedService}
                appointmentDate={appointmentDate}
                appointmentTime={appointmentTime}
                notes={notes}
              />
            )}
          </div>

          {/* Navigation */}

          <div className="border-t border-neutral-100 bg-neutral-50 px-6 py-6 sm:px-8">
            <AppointmentNavigation
              currentStep={step}
              totalSteps={STEPS.length}
              loading={loading}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSubmit={handleSubmit}
            />
          </div>
        </div>

        {/* Desktop Summary */}

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <AppointmentSummary
            service={selectedService}
            appointmentDate={appointmentDate}
            appointmentTime={appointmentTime}
            notes={notes}
          />
        </aside>
      </div>

      {/* Mobile Summary */}

      <div className="mt-8 lg:hidden">
        <AppointmentSummary
          service={selectedService}
          appointmentDate={appointmentDate}
          appointmentTime={appointmentTime}
          notes={notes}
        />
      </div>
    </section>
  );
}
