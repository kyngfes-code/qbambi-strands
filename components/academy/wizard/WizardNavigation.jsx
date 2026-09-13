"use client";

import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function WizardNavigation({ wizard, loading = false }) {
  async function handleNext() {
    await wizard.next();
  }

  return (
    <div className="rounded-3xl border bg-white p-5 shadow-lg">
      <div className="flex flex-col gap-5">
        {/* ================================================= */}
        {/* ACTION BUTTONS */}
        {/* ================================================= */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {/* PREVIOUS */}

          <Button
            type="button"
            variant="outline"
            disabled={wizard.isFirstStep || loading}
            onClick={wizard.previous}
            className="h-12 min-w-[140px]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {/* NEXT */}

          {!wizard.isLastStep ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="h-12 min-w-[170px]"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            /* SUBMIT */

            <Button
              type="submit"
              disabled={loading}
              className="h-12 min-w-[190px]"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />

              {loading ? "Submitting..." : "Submit Enrollment"}
            </Button>
          )}
        </div>

        {/* ================================================= */}
        {/* STEP INFORMATION */}
        {/* ================================================= */}

        <div className="border-t border-neutral-100 pt-4 text-center sm:text-left">
          <p className="text-sm text-neutral-500">
            Step <span className="font-semibold">{wizard.currentStep + 1}</span>{" "}
            of <span className="font-semibold">{wizard.totalSteps}</span>
          </p>

          <p className="mt-1 text-sm text-neutral-400">
            Complete each section before continuing.
          </p>
        </div>
      </div>
    </div>
  );
}
