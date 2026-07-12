"use client";

import NavLink from "./NavLink";

const links = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/store",
    label: "Store",
  },
  {
    href: "/saloon",
    label: "Salon",
  },
  {
    href: "/makeUpStudio",
    label: "Make-up",
  },
  {
    href: "/academy",
    label: "Academy",
  },
  {
    href: "/about",
    label: "About",
  },
];

export default function DesktopNavigation() {
  return (
    <nav className="hidden lg:block">
      <ul className="flex items-center gap-8">
        {links.map((link) => (
          <li key={link.href}>
            <NavLink href={link.href} className="font-medium">
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
