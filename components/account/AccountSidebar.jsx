"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    href: "/account",
    label: "Dashboard",
  },
  {
    href: "/account/orders",
    label: "Orders",
  },
  {
    href: "/account/appointments",
    label: "Appointments",
  },
  {
    href: "/account/payments",
    label: "Payments",
  },
  {
    href: "/account/refunds",
    label: "Refunds",
  },
  {
    href: "/account/addresses",
    label: "Addresses",
  },
  {
    href: "/account/settings",
    label: "Settings",
  },
];

export default function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="rounded-3xl border bg-white p-5 shadow-sm">
      <nav className="space-y-2">
        {links.map((link) => {
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-xl px-4 py-3 transition ${
                active ? "bg-[#4A2F27] text-white" : "hover:bg-neutral-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
