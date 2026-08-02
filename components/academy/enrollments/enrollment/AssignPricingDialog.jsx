"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function AssignPricingDialog({
  open,
  onOpenChange,

  enrollment,

  pricingOptions = [],

  loading = false,

  onSubmit,
}) {
  //------------------------------------------------------
  // State
  //------------------------------------------------------

  const [selectedPricingId, setSelectedPricingId] = useState("");

  //------------------------------------------------------
  // Reset
  //------------------------------------------------------

  useEffect(() => {
    if (!open) return;

    setSelectedPricingId("");
  }, [open]);

  //------------------------------------------------------
  // Current Pricing
  //------------------------------------------------------

  const selectedPricing = useMemo(() => {
    return (
      pricingOptions.find((pricing) => pricing.id === selectedPricingId) || null
    );
  }, [pricingOptions, selectedPricingId]);

  //------------------------------------------------------
  // Submit
  //------------------------------------------------------

  async function handleSubmit(e) {
    e.preventDefault();

    if (!selectedPricing) return;

    await onSubmit({
      pricing_id: selectedPricing.id,

      course_id: selectedPricing.course_id,

      learning_mode: selectedPricing.learning_mode,

      duration_months: selectedPricing.duration_months,

      amount: Number(selectedPricing.price),

      currency: selectedPricing.currency,
    });
  }

  //------------------------------------------------------

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!loading) {
          onOpenChange(value);
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Course Pricing</DialogTitle>

          <DialogDescription>
            Select the pricing plan that should be attached to this enrollment.
          </DialogDescription>
        </DialogHeader>

        {/* Student */}

        <div className="rounded-2xl border bg-neutral-50 p-5">
          <p className="text-sm text-neutral-500">Student</p>

          <h3 className="mt-1 font-semibold">
            {enrollment?.first_name} {enrollment?.last_name}
          </h3>

          <p className="text-sm text-neutral-500">{enrollment?.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Pricing Plan *</Label>

            <select
              required
              value={selectedPricingId}
              onChange={(e) => setSelectedPricingId(e.target.value)}
              className="w-full rounded-xl border px-4 py-3"
            >
              <option value="">Select Pricing</option>

              {pricingOptions.map((pricing) => (
                <option key={pricing.id} value={pricing.id}>
                  {pricing.course?.title} • {pricing.learning_mode} •{" "}
                  {pricing.duration_months} Month
                  {pricing.duration_months > 1 ? "s" : ""}
                  {" • "}₦{Number(pricing.price).toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {selectedPricing && (
            <div className="rounded-2xl border bg-neutral-50 p-6">
              <h3 className="font-semibold">Pricing Summary</h3>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-neutral-500">Course</p>

                  <p className="mt-1 font-medium">
                    {selectedPricing.course?.title}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-neutral-500">
                    Learning Mode
                  </p>

                  <p className="mt-1 font-medium capitalize">
                    {selectedPricing.learning_mode}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-neutral-500">Duration</p>

                  <p className="mt-1 font-medium">
                    {selectedPricing.duration_months} Month
                    {selectedPricing.duration_months > 1 ? "s" : ""}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-neutral-500">
                    Tuition Fee
                  </p>

                  <p className="mt-1 text-xl font-bold text-[#C6A667]">
                    ₦{Number(selectedPricing.price).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading || !selectedPricing}>
              {loading ? "Assigning..." : "Assign Pricing"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
