"use client";

import { signOut } from "next-auth/react";
import NavLink from "./NavLink";

export default function MobileMenu({ open, onClose, session }) {
  if (!open) return null;

  const isAdmin = session?.user?.role === "admin";
  console.log("MobileMenu rendered", open);
  return (
    <div className="fixed inset-0 z-[100] lg:hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 z-[9999] flex h-screen w-80 max-w-[90vw] flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                Q-bambi Strands
              </h2>

              {session?.user ? (
                <>
                  <p className="mt-2 font-medium text-neutral-800">
                    {session.user.name}
                  </p>

                  <p className="text-sm text-neutral-500">
                    {session.user.email}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-neutral-500">Welcome</p>
              )}
            </div>

            <button
              onClick={onClose}
              className="rounded-lg border border-neutral-200 p-2 transition hover:bg-neutral-100"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="relative z-10 flex-1 overflow-y-auto">
          {/* Explore */}
          <section className="border-b px-6 py-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Explore
            </h3>

            <nav className="flex flex-col">
              <NavLink href="/" onClick={onClose} className="py-3">
                Home
              </NavLink>

              <NavLink href="/store" onClick={onClose} className="py-3">
                Store
              </NavLink>

              <NavLink href="/saloon" onClick={onClose} className="py-3">
                Salon
              </NavLink>

              <NavLink href="/makeUpStudio" onClick={onClose} className="py-3">
                Make-up Studio
              </NavLink>

              <NavLink href="/academy" onClick={onClose} className="py-3">
                Academy
              </NavLink>

              <NavLink href="/about" onClick={onClose} className="py-3">
                About
              </NavLink>
            </nav>
          </section>

          {/* Guest */}
          {!session?.user && (
            <section className="border-b px-6 py-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Account
              </h3>

              <nav className="flex flex-col">
                <NavLink
                  href="/api/auth/signin"
                  onClick={onClose}
                  className="py-3"
                >
                  Sign In
                </NavLink>

                <NavLink href="/user" onClick={onClose} className="py-3">
                  Create Account
                </NavLink>
              </nav>
            </section>
          )}

          {/* Customer */}
          {session?.user && (
            <section className="border-b px-6 py-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                My Account
              </h3>

              <nav className="flex flex-col">
                <NavLink href="/account" onClick={onClose} className="py-3">
                  Dashboard
                </NavLink>

                <NavLink
                  href="/account/profile"
                  onClick={onClose}
                  className="py-3"
                >
                  Profile
                </NavLink>

                <NavLink
                  href="/account/orders"
                  onClick={onClose}
                  className="py-3"
                >
                  Orders
                </NavLink>

                <NavLink
                  href="/account/appointments"
                  onClick={onClose}
                  className="py-3"
                >
                  Appointments
                </NavLink>

                <NavLink
                  href="/account/refunds"
                  onClick={onClose}
                  className="py-3"
                >
                  Refunds
                </NavLink>

                <NavLink href="/cart" onClick={onClose} className="py-3">
                  Shopping Cart
                </NavLink>
              </nav>
            </section>
          )}

          {/* Admin */}
          {isAdmin && (
            <section className="border-b px-6 py-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Administration
              </h3>

              <nav className="flex flex-col">
                <NavLink href="/admin" onClick={onClose} className="py-3">
                  Admin Dashboard
                </NavLink>
              </nav>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-5">
          {session?.user && (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="mb-4 w-full rounded-xl border border-red-200 px-4 py-3 text-left font-medium text-red-600 transition hover:bg-red-50"
            >
              Sign Out
            </button>
          )}

          <p className="text-center text-xs text-neutral-400">
            © {new Date().getFullYear()} Q-bambi Strands
          </p>
        </div>
      </aside>
    </div>
  );
}
