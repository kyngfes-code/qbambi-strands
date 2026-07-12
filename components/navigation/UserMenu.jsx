"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function UserMenu({ user }) {
  const [open, setOpen] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);

    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const avatar = user?.image?.trim() || "/default-avatar.png";

  return (
    <div ref={menuRef} className="relative">
      {/* Avatar */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center rounded-full transition hover:opacity-90"
      >
        <img
          src={avatar}
          alt={user?.name ?? "User"}
          referrerPolicy="no-referrer"
          className="h-10 w-10 rounded-full border border-neutral-300 object-cover"
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="border-b bg-neutral-50 p-4">
            <p className="font-semibold text-neutral-900">
              {user?.name || "Customer"}
            </p>

            <p className="truncate text-sm text-neutral-500">{user?.email}</p>
          </div>

          {/* Quick Actions */}
          <div className="p-2">
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-4 py-3 transition hover:bg-neutral-100"
            >
              My Dashboard
            </Link>

            {user?.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-4 py-3 transition hover:bg-neutral-100"
              >
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-2">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full rounded-lg px-4 py-3 text-left text-red-600 transition hover:bg-red-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
