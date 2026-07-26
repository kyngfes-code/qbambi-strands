"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import UserMenu from "./UserMenu";
import MobileMenu from "./MobileMenu";

export default function MobileNavigation({ session }) {
  const [menuOpen, setMenuOpen] = useState(false);
  console.log("MobileNavigation rendered", menuOpen);
  const router = useRouter();

  const user = useMemo(() => {
    if (!session?.user) return null;

    return {
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      image: session.user.image ?? null,
      role: session.user.role ?? "user",
    };
  }, [session]);

  return (
    <>
      <div className="flex items-center gap-2 lg:hidden">
        {session?.user ? (
          <>
            {/* Cart */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/account/cart"
                    aria-label="Shopping Cart"
                    className="rounded-xl p-2 transition hover:bg-neutral-100"
                  >
                    <span className="text-2xl">🛒</span>
                  </Link>
                </TooltipTrigger>

                <TooltipContent>
                  <p>Cart</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Avatar */}
            <UserMenu user={user} />
          </>
        ) : (
          <button
            type="button"
            onClick={() => router.push("/api/auth/signin")}
            className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-neutral-100"
          >
            Sign In
          </button>
        )}

        {/* Hamburger */}
        <button
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
          className="rounded-xl border border-neutral-200 bg-white p-2 shadow-sm transition hover:bg-neutral-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        session={session}
      />
    </>
  );
}
