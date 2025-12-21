"use client";

import { signIn } from "next-auth/react";

export default function AdminBossLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow w-96 text-center space-y-4">
        <h1 className="text-xl font-bold">Admin Login</h1>

        <button
          onClick={() => signIn("google", { callbackUrl: "/admin" })}
          className="w-full bg-black text-white py-2 rounded"
        >
          Sign in with Google
        </button>

        <p className="text-xs text-gray-500">Authorized administrators only</p>
      </div>
    </div>
  );
}
