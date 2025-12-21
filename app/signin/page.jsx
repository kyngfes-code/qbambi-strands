"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }

    window.location.href = "/user";
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow w-96 space-y-6">
        <h1 className="text-xl font-bold text-center">Sign in</h1>

        {/* 🔐 USER LOGIN */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target;

            await signIn("credentials", {
              email: form.email.value,
              password: form.password.value,
              callbackUrl: "/user",
            });
          }}
          className="space-y-3"
        >
          <h2 className="font-semibold">User Login</h2>

          <input
            name="email"
            type="email"
            placeholder="Email"
            className="border p-2 w-full rounded"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="border p-2 w-full rounded"
          />

          <button className="w-full bg-pink-600 text-white py-2 rounded">
            Sign in
          </button>
        </form>

        <hr />
      </div>
    </div>
  );
}
