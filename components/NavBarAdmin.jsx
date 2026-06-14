"use client";

import { useState } from "react";
import Logo from "./Logo";
import icon from "@/public/icon-flat-gold.png";
import SignInDropdownButton from "./SignInDropDownButton";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function NavBarAdmin({ className = "" }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/admin", label: "Home" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/appointments", label: "Appointments" },
    { href: "/admin/refunds", label: "Refunds" },
    { href: "/admin/shop", label: "Shop" },
    { href: "/admin/make-up-studio", label: "Make-up Studio" },
    { href: "/admin/academy", label: "Qbambi's Academy" },
    { href: "/admin/about", label: "About" },
    { href: "/admin/saloon", label: "Our Saloon" },
  ];

  return (
    <header
      className={`
        sticky top-0 z-50
        bg-white/90 backdrop-blur-md
        border-b border-stone-300
        shadow-sm
        ${className}
      `}
    >
      <div
        className="
          max-w-7xl mx-auto
          px-3 sm:px-5 lg:px-8
          h-16
          flex items-center justify-between
        "
      >
        {/* Logo */}
        <Logo height="40" width="40" src={icon} className="shrink-0" />

        {/* Desktop Navigation */}
        <nav className="hidden lg:block">
          <ul className="flex items-center gap-6 xl:gap-8 text-sm font-medium text-stone-700">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="
                    hover:text-accent-500
                    transition-colors
                    whitespace-nowrap
                  "
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop User Menu */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className=" px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
        >
          Logout
        </button>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="
            lg:hidden
            p-2 rounded-lg
            border border-stone-300
            text-stone-700
            hover:bg-stone-100
          "
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile / Tablet Menu */}
      {mobileOpen && (
        <div
          className="
            lg:hidden
            border-t border-stone-200
            bg-white
            shadow-md
          "
        >
          <nav className="px-4 py-4">
            <ul className="flex flex-col divide-y divide-stone-100">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="
                      block py-4
                      text-stone-700
                      hover:text-accent-500
                      transition-colors
                    "
                  >
                    {link.label}
                  </Link>
                </li>
              ))}

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Logout
              </button>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
