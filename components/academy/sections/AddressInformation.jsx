"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";

export default function AddressInformation() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">
          Address Information
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
          Tell us where you currently reside. This information will be used for
          your enrollment records and future correspondence.
        </p>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {/* Country */}
        <div className="space-y-2">
          <Label htmlFor="country">
            Country <span className="text-red-500">*</span>
          </Label>

          <Input id="country" placeholder="Country" {...register("country")} />

          {errors.country && (
            <p className="text-sm text-red-500">{errors.country.message}</p>
          )}
        </div>

        {/* State */}
        <div className="space-y-2">
          <Label htmlFor="state">
            State <span className="text-red-500">*</span>
          </Label>

          <Input id="state" placeholder="State" {...register("state")} />

          {errors.state && (
            <p className="text-sm text-red-500">{errors.state.message}</p>
          )}
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>

          <Input id="city" placeholder="City" {...register("city")} />

          {errors.city && (
            <p className="text-sm text-red-500">{errors.city.message}</p>
          )}
        </div>

        {/* Postal Code */}
        <div className="space-y-2 sm:col-span-2 xl:col-span-1">
          <Label htmlFor="postal_code">Postal Code</Label>

          <Input
            id="postal_code"
            placeholder="Postal Code"
            {...register("postal_code")}
          />

          {errors.postal_code && (
            <p className="text-sm text-red-500">{errors.postal_code.message}</p>
          )}
        </div>

        {/* Street Address */}
        <div className="space-y-2 sm:col-span-2 xl:col-span-2">
          <Label htmlFor="street_address">
            Street Address <span className="text-red-500">*</span>
          </Label>

          <Input
            id="street_address"
            placeholder="House number, street, area..."
            {...register("street_address")}
          />

          {errors.street_address && (
            <p className="text-sm text-red-500">
              {errors.street_address.message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
