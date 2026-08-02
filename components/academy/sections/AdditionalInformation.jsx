"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";

export default function AdditionalInformation() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <section className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">
          Additional Information
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
          Tell us a little more about yourself so we can better prepare for your
          training experience.
        </p>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {/* Occupation */}
        <div className="space-y-2">
          <Label htmlFor="occupation">Occupation</Label>

          <Input
            id="occupation"
            placeholder="Occupation"
            {...register("occupation")}
          />

          {errors.occupation && (
            <p className="text-sm text-red-500">{errors.occupation.message}</p>
          )}
        </div>

        {/* Education */}
        <div className="space-y-2">
          <Label htmlFor="education_level">Highest Education Level</Label>

          <select
            id="education_level"
            {...register("education_level")}
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#C6A667] focus:ring-2 focus:ring-[#C6A667]/20"
          >
            <option value="">Select Level</option>
            <option value="Primary">Primary School</option>
            <option value="Secondary">Secondary School</option>
            <option value="OND">OND</option>
            <option value="HND">HND</option>
            <option value="BSc">Bachelor's Degree</option>
            <option value="MSc">Master's Degree</option>
            <option value="PhD">PhD</option>
            <option value="Other">Other</option>
          </select>

          {errors.education_level && (
            <p className="text-sm text-red-500">
              {errors.education_level.message}
            </p>
          )}
        </div>

        {/* Referral */}
        <div className="space-y-2">
          <Label htmlFor="referral_source">How did you hear about us?</Label>

          <select
            id="referral_source"
            {...register("referral_source")}
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#C6A667] focus:ring-2 focus:ring-[#C6A667]/20"
          >
            <option value="">Select One</option>
            <option value="Instagram">Instagram</option>
            <option value="Facebook">Facebook</option>
            <option value="TikTok">TikTok</option>
            <option value="Google Search">Google Search</option>
            <option value="Friend">Friend / Family</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Returning Student">Returning Student</option>
            <option value="Other">Other</option>
          </select>

          {errors.referral_source && (
            <p className="text-sm text-red-500">
              {errors.referral_source.message}
            </p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>

        <textarea
          id="notes"
          rows={6}
          placeholder="Tell us anything that may help us prepare for your training..."
          {...register("notes")}
          className="min-h-[160px] w-full resize-y rounded-2xl border border-neutral-300 p-4 text-sm outline-none transition focus:border-[#C6A667] focus:ring-2 focus:ring-[#C6A667]/20"
        />

        {errors.notes && (
          <p className="text-sm text-red-500">{errors.notes.message}</p>
        )}
      </div>

      {/* Agreement */}
      <div className="rounded-2xl border border-[#C6A667]/20 bg-[#C6A667]/10 p-5 sm:p-6">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            {...register("terms")}
            className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300 text-[#C6A667] focus:ring-[#C6A667]"
          />

          <span className="text-sm leading-7 text-neutral-700">
            I confirm that the information provided is accurate. I understand
            that submitting this form is an application for admission and does
            not automatically guarantee enrollment until reviewed and approved
            by Qbambi Academy.
          </span>
        </label>

        {errors.terms && (
          <p className="mt-3 text-sm text-red-500">{errors.terms.message}</p>
        )}
      </div>
    </section>
  );
}
