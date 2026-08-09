"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole, CheckCircle2, AlertCircle } from "lucide-react";

export default function SetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  //--------------------------------------------------
  // Validate token exists
  //--------------------------------------------------

  useEffect(() => {
    if (!token) {
      setError("This account setup link is invalid.");
    }

    setCheckingToken(false);
  }, [token]);

  //--------------------------------------------------
  // Submit
  //--------------------------------------------------

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    //------------------------------------------------
    // Basic validation
    //------------------------------------------------

    if (!token) {
      setError("This account setup link is invalid.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    //------------------------------------------------
    // Submit
    //------------------------------------------------

    try {
      setLoading(true);

      const response = await fetch("/api/set-password", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create your password.");
      }

      //------------------------------------------------
      // Success
      //------------------------------------------------

      setSuccess(true);

      setPassword("");
      setConfirmPassword("");

      //------------------------------------------------
      // Give student time to see success message
      //------------------------------------------------

      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err) {
      console.error("Set Password:", err);

      setError(err.message || "Unable to create your password.");
    } finally {
      setLoading(false);
    }
  }

  //--------------------------------------------------
  // Loading
  //--------------------------------------------------

  if (checkingToken) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f1] px-6">
        <div className="text-sm text-neutral-500">Verifying invitation...</div>
      </main>
    );
  }

  //--------------------------------------------------
  // Invalid token
  //--------------------------------------------------

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f1] px-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-neutral-900">
            Invalid Invitation
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-500">
            This account setup link is invalid or incomplete. Please use the
            invitation link sent to your email.
          </p>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-6 rounded-xl bg-[#b48a5a] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Return Home
          </button>
        </div>
      </main>
    );
  }

  //--------------------------------------------------
  // Success
  //--------------------------------------------------

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f1] px-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="h-7 w-7 text-green-600" />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-neutral-900">
            Password Created
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-500">
            Your Qbambi Academy account is ready. You can now sign in using the
            email address you used during registration.
          </p>

          <p className="mt-4 text-xs text-neutral-400">
            Redirecting you to the login page...
          </p>
        </div>
      </main>
    );
  }

  //--------------------------------------------------
  // Form
  //--------------------------------------------------

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf7f1] px-6 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        {/* Header */}

        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#b48a5a]/10">
            <LockKeyhole className="h-7 w-7 text-[#b48a5a]" />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-neutral-900">
            Set Your Password
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-500">
            Welcome to Qbambi Academy. Create a password for your student
            account to continue.
          </p>
        </div>

        {/* Error */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* Password */}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-800"
            >
              New Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="new-password"
              disabled={loading}
              className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-[#b48a5a] focus:ring-2 focus:ring-[#b48a5a]/20 disabled:bg-neutral-50"
            />

            <p className="mt-2 text-xs text-neutral-400">
              Minimum 8 characters.
            </p>
          </div>

          {/* Confirm Password */}

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-neutral-800"
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm your password"
              autoComplete="new-password"
              disabled={loading}
              className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-[#b48a5a] focus:ring-2 focus:ring-[#b48a5a]/20 disabled:bg-neutral-50"
            />
          </div>

          {/* Submit */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#b48a5a] px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Password..." : "Create Password"}
          </button>
        </form>

        {/* Footer */}

        <p className="mt-6 text-center text-xs leading-5 text-neutral-400">
          Your invitation link is temporary and can only be used once.
        </p>
      </div>
    </main>
  );
}
