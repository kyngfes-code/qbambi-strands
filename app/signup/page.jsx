"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import NavBarCart from "@/components/NavBarCart";
import SignUpForm from "@/components/auth/SignUpForm";

import { signupSchema } from "@/lib/validations/signupSchema";

export default function SignUpPage() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",

      street: "",
      city: "",
      state: "",
      country: "",
      landmark: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  async function handleSubmit(values) {
    try {
      setLoading(true);
      setServerError("");

      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Unable to create your account.");
        return;
      }

      setRegisteredEmail(values.email);
      setSignupSuccess(true);
    } catch (error) {
      console.error(error);

      setServerError(
        "Something went wrong while creating your account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <NavBarCart />

      <main className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-neutral-50 via-white to-neutral-100">
        <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          {signupSuccess ? (
            <div className="w-full max-w-xl rounded-3xl border bg-white p-8 shadow-xl text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-10 w-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h1 className="mt-6 text-3xl font-bold">
                Account Created Successfully
              </h1>

              <p className="mt-4 text-muted-foreground">
                We've sent a verification email to
              </p>

              <p className="mt-2 text-lg font-semibold break-all">
                {registeredEmail}
              </p>

              <p className="mt-6 text-sm text-muted-foreground leading-7">
                Please click the verification link in your email before signing
                in.
              </p>

              <button
                onClick={() => router.push("/signin")}
                className="mt-8 w-full rounded-xl bg-black px-6 py-3 text-white font-medium transition hover:bg-neutral-800"
              >
                Continue to Login
              </button>
            </div>
          ) : (
            <div className="grid w-full max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
              {/* LEFT SIDE */}

              <div className="hidden lg:block">
                <div className="max-w-lg">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-amber-600">
                    Welcome to Qbambi
                  </p>

                  <h1 className="text-5xl font-bold leading-tight">
                    Shop.
                    <br />
                    Book.
                    <br />
                    Learn.
                  </h1>

                  <p className="mt-6 text-lg leading-8 text-muted-foreground">
                    Create one account to shop premium beauty products, schedule
                    salon appointments and enrol in academy courses from
                    anywhere in the world.
                  </p>

                  <div className="mt-10 space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <span className="text-base">Secure online shopping</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <span className="text-base">Book salon appointments</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <span className="text-base">
                        Enrol in academy courses
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <span className="text-base">
                        Worldwide customer accounts
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE */}

              <div className="flex justify-center">
                <div className="w-full max-w-2xl">
                  {serverError && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                      {serverError}
                    </div>
                  )}

                  <SignUpForm
                    form={form}
                    loading={loading}
                    onSubmit={form.handleSubmit(handleSubmit)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
