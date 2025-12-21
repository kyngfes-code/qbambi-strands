"use client";

import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/lib/validations/signupSchema";

export default function SignUpPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(values) {
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        setError("root", { message: data.error || "Signup failed" });
        return;
      }

      await signIn("credentials", {
        email: values.email,
        password: values.password,
        callbackUrl: "/user",
      });
    } catch {
      setError("root", { message: "Something went wrong" });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-xl shadow w-96 space-y-4"
      >
        <h1 className="text-xl font-bold">Create Account</h1>

        {errors.root && (
          <p className="text-red-500 text-sm">{errors.root.message}</p>
        )}

        {/* First & Last Name */}
        <div className="flex gap-2">
          <div className="w-full">
            <input
              {...register("firstName")}
              placeholder="First name"
              className="border p-2 w-full rounded"
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs">{errors.firstName.message}</p>
            )}
          </div>

          <div className="w-full">
            <input
              {...register("lastName")}
              placeholder="Last name"
              className="border p-2 w-full rounded"
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Phone */}
        <div>
          <input
            type="tel"
            {...register("phone")}
            placeholder="Phone number"
            className="border p-2 w-full rounded"
          />
          {errors.phone && (
            <p className="text-red-500 text-xs">{errors.phone.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <input
            type="email"
            {...register("email")}
            placeholder="Email"
            className="border p-2 w-full rounded"
          />
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <input
            type="password"
            {...register("password")}
            placeholder="Password"
            className="border p-2 w-full rounded"
          />
          {errors.password && (
            <p className="text-red-500 text-xs">{errors.password.message}</p>
          )}
        </div>

        <button
          disabled={isSubmitting}
          className="w-full bg-pink-600 text-white py-2 rounded disabled:opacity-50"
        >
          {isSubmitting ? "Creating account..." : "Sign up"}
        </button>
      </form>
    </div>
  );
}
