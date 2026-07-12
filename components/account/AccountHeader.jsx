"use client";

import { useSession } from "next-auth/react";

export default function AccountHeader() {
  const { data: session } = useSession();

  return (
    <div className="rounded-3xl bg-[#4A2F27] p-8 text-white shadow-lg">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <img
          src={session?.user?.image || "/default-avatar.png"}
          alt="Profile"
          className="h-20 w-20 rounded-full border-4 border-white object-cover"
          referrerPolicy="no-referrer"
        />

        <div>
          <h1 className="text-3xl font-bold">
            Welcome back,
            <span className="ml-2">{session?.user?.name ?? "Customer"}</span>
          </h1>

          <p className="mt-1 text-white/80">{session?.user?.email}</p>
        </div>
      </div>
    </div>
  );
}
