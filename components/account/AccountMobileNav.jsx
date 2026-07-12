"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    label: "Home",
    href: "/account",
    icon: "🏠",
  },
  {
    label: "Appointments",
    href: "/account/appointments",
    icon: "📅",
  },
  {
    label: "Orders",
    href: "/account/orders",
    icon: "🛍️",
  },
  {
    label: "Refunds",
    href: "/account/refunds",
    icon: "💳",
  },
  {
    label: "Profile",
    href: "/account/profile",
    icon: "👤",
  },
];

export default function AccountMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.08)] lg:hidden">
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/account" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-3 transition-colors ${
                active
                  ? "text-amber-700"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <span className="text-xl">{item.icon}</span>

              <span className="text-[11px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
