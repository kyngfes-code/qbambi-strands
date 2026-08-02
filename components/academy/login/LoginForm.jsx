"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);

    setError("");

    const result = await signIn("academy", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    router.push("/academy/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border bg-white p-8 shadow-xl">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold">Student Login</h2>

        <p className="mt-2 text-neutral-500">
          Sign in to continue your learning journey.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Email Address
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-xl border px-4 outline-none transition focus:border-[#C6A667]"
            placeholder="student@email.com"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Password</label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 w-full rounded-xl border px-4 pr-12 outline-none transition focus:border-[#C6A667]"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-neutral-500" />
              ) : (
                <Eye className="h-5 w-5 text-neutral-500" />
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm text-[#8b6b2f] hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-xl bg-[#C6A667] font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Signing In..." : "Login"}
        </button>
      </form>

      <div className="mt-8 border-t pt-6 text-center text-sm text-neutral-500">
        Student accounts are created after your enrollment has been approved.
      </div>
    </div>
  );
}
