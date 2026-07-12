"use client";

import { useState } from "react";
import AccountSidebar from "./AccountSidebar";
import AccountMobileNav from "./AccountMobileNav";

export default function AccountLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Mobile Header */}
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">My Account</h1>

            <p className="text-sm text-neutral-500">
              Manage your profile, appointments and orders.
            </p>
          </div>

          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg border bg-white px-4 py-2 shadow-sm"
          >
            Menu
          </button>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden w-72 shrink-0 lg:block">
            <AccountSidebar />
          </aside>

          {/* Main Content */}
          <main className="min-w-0 flex-1 pb-24 lg:pb-0">{children}</main>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AccountMobileNav />

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold">My Account</h2>

              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-md border px-3 py-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4">
              <AccountSidebar mobile onNavigate={() => setSidebarOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
