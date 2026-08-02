"use client";

import Link from "next/link";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import PasswordInput from "./PasswordInput";

const COUNTRIES = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "United Kingdom",
  "United States",
  "Canada",
  "United Arab Emirates",
  "France",
  "Germany",
  "Italy",
  "Spain",
  "Ireland",
  "Australia",
  "New Zealand",
  "India",
  "China",
  "Japan",
  "Brazil",
  "Other",
];

export default function SignUpForm({ form, onSubmit, loading = false }) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <Card className="w-full rounded-3xl border-0 shadow-2xl">
      <CardHeader className="space-y-3 text-center">
        <CardTitle className="text-3xl font-bold">
          Create your account
        </CardTitle>

        <CardDescription className="text-base">
          Join Qbambi to shop products, book salon appointments and enrol in
          academy courses.
        </CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit}>
        <CardContent className="space-y-10">
          {/* ------------------------------------ */}
          {/* PERSONAL INFORMATION */}
          {/* ------------------------------------ */}

          <section className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Personal Information</h3>

              <p className="text-sm text-muted-foreground">
                Tell us a little about yourself.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>

                <Input
                  id="firstName"
                  placeholder="John"
                  {...register("firstName")}
                />

                {errors.firstName && (
                  <p className="text-sm text-red-500">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="middleName">Middle / Other Name</Label>

                <Input
                  id="middleName"
                  placeholder="Michael (Optional)"
                  {...register("middleName")}
                />

                {errors.middleName && (
                  <p className="text-sm text-red-500">
                    {errors.middleName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-red-500">*</span>
              </Label>

              <Input
                id="lastName"
                placeholder="Doe"
                {...register("lastName")}
              />

              {errors.lastName && (
                <p className="text-sm text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>

                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  autoComplete="email"
                  {...register("email")}
                />

                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-red-500">*</span>
                </Label>

                <Input
                  id="phone"
                  placeholder="+234 801 234 5678"
                  autoComplete="tel"
                  {...register("phone")}
                />

                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>
          </section>

          {/* ------------------------------------ */}
          {/* PASSWORD */}
          {/* ------------------------------------ */}

          <section className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Account Security</h3>

              <p className="text-sm text-muted-foreground">
                Create a secure password for your account.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>

                <PasswordInput
                  id="password"
                  placeholder="Create password"
                  {...register("password")}
                />

                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirm Password <span className="text-red-500">*</span>
                </Label>

                <PasswordInput
                  id="confirmPassword"
                  placeholder="Confirm password"
                  {...register("confirmPassword")}
                />

                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* ------------------------------------ */}
          {/* SHIPPING ADDRESS */}
          {/* ------------------------------------ */}

          <section className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">
                Default Shipping Address
              </h3>

              <p className="text-sm text-muted-foreground">
                This will be used as your default delivery address. You can
                change it later from your account.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">
                Street Address <span className="text-red-500">*</span>
              </Label>

              <Textarea
                id="street"
                rows={3}
                placeholder="House number, street name..."
                {...register("street")}
              />

              {errors.street && (
                <p className="text-sm text-red-500">{errors.street.message}</p>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-red-500">*</span>
                </Label>

                <Input id="city" placeholder="City" {...register("city")} />

                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">
                  State / Province / Region{" "}
                  <span className="text-red-500">*</span>
                </Label>

                <Input
                  id="state"
                  placeholder="State / Province"
                  {...register("state")}
                />

                {errors.state && (
                  <p className="text-sm text-red-500">{errors.state.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">
                Country <span className="text-red-500">*</span>
              </Label>

              <select
                id="country"
                {...register("country")}
                className="h-11 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Select Country</option>

                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>

              {errors.country && (
                <p className="text-sm text-red-500">{errors.country.message}</p>
              )}
            </div>
          </section>
        </CardContent>

        <CardFooter className="flex flex-col gap-6">
          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
              Sign In
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
