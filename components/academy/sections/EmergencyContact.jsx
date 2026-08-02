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
    <section className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">
          Emergency Contact
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
          Please provide someone we can contact in case of an emergency during
          your training.
        </p>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="emergency_contact_name">
            Full Name <span className="text-red-500">*</span>
          </Label>

          <Input
            id="emergency_contact_name"
            placeholder="John Doe"
            {...register("emergency_contact_name")}
          />

          {errors.emergency_contact_name && (
            <p className="text-sm text-red-500">
              {errors.emergency_contact_name.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="emergency_contact_phone">
            Phone Number <span className="text-red-500">*</span>
          </Label>

          <Input
            id="emergency_contact_phone"
            placeholder="+234..."
            {...register("emergency_contact_phone")}
          />

          {errors.emergency_contact_phone && (
            <p className="text-sm text-red-500">
              {errors.emergency_contact_phone.message}
            </p>
          )}
        </div>

        {/* Relationship */}
        <div className="space-y-2 md:col-span-2 xl:col-span-1">
          <Label htmlFor="emergency_contact_relationship">
            Relationship <span className="text-red-500">*</span>
          </Label>

          <select
            id="emergency_contact_relationship"
            {...register("emergency_contact_relationship")}
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#C6A667] focus:ring-2 focus:ring-[#C6A667]/20"
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
