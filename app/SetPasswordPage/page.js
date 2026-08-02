"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";

export default function SetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("Invitation token is missing.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/set-password", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setSuccess("Password created successfully. Redirecting to sign in...");

      setTimeout(() => {
        router.push("/signin");
      }, 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border p-8">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-black text-white flex items-center justify-center">
            <Lock className="h-8 w-8" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center">Create Password</h1>

        <p className="mt-2 text-center text-neutral-500">
          Set your password to activate your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 mt-8">
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter password"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-black"
                placeholder="Confirm password"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-black text-white py-3 font-medium disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}

            {loading ? "Creating Password..." : "Create Password"}
          </button>
        </form>
      </div>
    </main>
  );
}
