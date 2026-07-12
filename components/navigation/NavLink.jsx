"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({ href, children, className = "", onClick }) {
  const pathname = usePathname();

  const active =
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`transition-colors duration-200 ${
        active
          ? "text-amber-700 font-semibold"
          : "text-neutral-700 hover:text-amber-700"
      } ${className}`}
    >
      {children}
    </Link>
  );
}
