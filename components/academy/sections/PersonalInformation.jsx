"use client";

import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PersonalInformation() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <section className="rounded-3xl border bg-white p-5 shadow-sm sm:p-6 lg:p-8">
      {/* Header */}

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-neutral-900">
          Personal Information
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
          Please provide your personal information exactly as it appears on your
          official documents.
        </p>
      </div>

      {/* Form */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* First Name */}

        <div className="min-w-0 space-y-2">
          <Label htmlFor="first_name">First Name *</Label>

          <Input
            id="first_name"
            placeholder="First Name"
            className="h-14 text-base"
            {...register("first_name")}
          />

          {errors.first_name && (
            <p className="text-sm text-red-500">{errors.first_name.message}</p>
          )}
        </div>

        {/* Last Name */}

        <div className="min-w-0 space-y-2">
          <Label htmlFor="last_name">Last Name *</Label>

          <Input
            id="last_name"
            placeholder="Last Name"
            className="h-14 text-base"
            {...register("last_name")}
          />

          {errors.last_name && (
            <p className="text-sm text-red-500">{errors.last_name.message}</p>
          )}
        </div>

        {/* Other Name */}

        <div className="min-w-0 space-y-2">
          <Label htmlFor="other_name">Other Name</Label>

          <Input
            id="other_name"
            placeholder="Other Name"
            className="h-14 text-base"
            {...register("other_name")}
          />

          {errors.other_name && (
            <p className="text-sm text-red-500">{errors.other_name.message}</p>
          )}
        </div>

        {/* Gender */}

        <div className="min-w-0 space-y-2">
          <Label htmlFor="gender">Gender *</Label>

          <select
            id="gender"
            {...register("gender")}
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#C6A667] focus:ring-2 focus:ring-[#C6A667]/20"
          >
            <option value="">Select Gender</option>

            <option value="Male">Male</option>

            <option value="Female">Female</option>
          </select>

          {errors.gender && (
            <p className="text-sm text-red-500">{errors.gender.message}</p>
          )}
        </div>

        {/* Date of Birth */}

        <div className="min-w-0 space-y-2">
          <Label htmlFor="date_of_birth">Date of Birth *</Label>

          <Input
            id="date_of_birth"
            type="date"
            max={new Date().toISOString().split("T")[0]}
            className="h-14 text-base"
            {...register("date_of_birth")}
          />

          {errors.date_of_birth && (
            <p className="text-sm text-red-500">
              {errors.date_of_birth.message}
            </p>
          )}
        </div>

        {/* Email */}

        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="email">Email Address *</Label>

          <Input
            id="email"
            type="email"
            placeholder="example@email.com"
            className="h-14 text-base"
            {...register("email")}
          />

          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}

        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="phone">Phone Number *</Label>

          <Input
            id="phone"
            className="h-14 text-base"
            placeholder="+234 XXX XXX XXXX"
            {...register("phone")}
          />

          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>

        {/* WhatsApp */}

        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="whatsapp">WhatsApp Number</Label>

          <Input
            id="whatsapp"
            className="h-14 text-base"
            placeholder="+234 XXX XXX XXXX"
            {...register("whatsapp")}
          />

          {errors.whatsapp && (
            <p className="text-sm text-red-500">{errors.whatsapp.message}</p>
          )}
        </div>
      </div>
    </section>
  );
}
