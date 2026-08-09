"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";

export default function EmergencyContact() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <section className="space-y-8">
      {/* ================================================= */}
      {/* Header */}
      {/* ================================================= */}

      <div>
        <h2 className="text-2xl font-bold text-neutral-900">
          Emergency Contact
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-7 text-neutral-500">
          Please provide someone we can contact in case of an emergency during
          your training.
        </p>
      </div>

      {/* ================================================= */}
      {/* Form */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ================================================= */}
        {/* Full Name */}
        {/* ================================================= */}

        <div className="space-y-2">
          <Label
            htmlFor="emergency_contact_name"
            className="text-sm font-medium text-neutral-700"
          >
            Full Name <span className="text-red-500">*</span>
          </Label>

          <Input
            id="emergency_contact_name"
            type="text"
            placeholder="John Doe"
            {...register("emergency_contact_name")}
            className="h-14 w-full rounded-xl border-neutral-300 px-4 text-base shadow-sm transition focus:border-[#C6A667] focus:ring-2 focus:ring-[#C6A667]/20"
          />

          {errors.emergency_contact_name && (
            <p className="text-sm text-red-500">
              {errors.emergency_contact_name.message}
            </p>
          )}
        </div>

        {/* ================================================= */}
        {/* Phone */}
        {/* ================================================= */}

        <div className="space-y-2">
          <Label
            htmlFor="emergency_contact_phone"
            className="text-sm font-medium text-neutral-700"
          >
            Phone Number <span className="text-red-500">*</span>
          </Label>

          <Input
            id="emergency_contact_phone"
            type="tel"
            placeholder="+234..."
            {...register("emergency_contact_phone")}
            className="h-14 w-full rounded-xl border-neutral-300 px-4 text-base shadow-sm transition focus:border-[#C6A667] focus:ring-2 focus:ring-[#C6A667]/20"
          />

          {errors.emergency_contact_phone && (
            <p className="text-sm text-red-500">
              {errors.emergency_contact_phone.message}
            </p>
          )}
        </div>

        {/* ================================================= */}
        {/* Relationship */}
        {/* ================================================= */}

        <div className="space-y-2">
          <Label
            htmlFor="emergency_contact_relationship"
            className="text-sm font-medium text-neutral-700"
          >
            Relationship <span className="text-red-500">*</span>
          </Label>

          <select
            id="emergency_contact_relationship"
            {...register("emergency_contact_relationship")}
            className="h-14 w-full rounded-xl border border-neutral-300 bg-white px-4 text-base shadow-sm outline-none transition focus:border-[#C6A667] focus:ring-2 focus:ring-[#C6A667]/20"
          >
            <option value="">Select Relationship</option>
            <option value="Parent">Parent</option>
            <option value="Guardian">Guardian</option>
            <option value="Sibling">Sibling</option>
            <option value="Spouse">Spouse</option>
            <option value="Friend">Friend</option>
            <option value="Relative">Relative</option>
            <option value="Other">Other</option>
          </select>

          {errors.emergency_contact_relationship && (
            <p className="text-sm text-red-500">
              {errors.emergency_contact_relationship.message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
