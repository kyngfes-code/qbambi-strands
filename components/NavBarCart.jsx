"use client";

import Link from "next/link";
import Logo from "./Logo";
import icon from "@/public/icon-flat-gold.png";

function NavBarCart() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <Logo height="40" width="40" src={icon} />

        <nav>
          <ul className="flex gap-4 text-sm font-medium text-neutral-700">
            <li>
              <Link href="/" className="hover:text-black">
                Home
              </Link>
            </li>
            <li>
              <Link href="/store" className="hover:text-black">
                Store
              </Link>
            </li>
            <li>
              <Link href="/saloon" className="hover:text-black">
                Our Saloon
              </Link>
            </li>
            <li>
              <Link href="/makeUpStudio" className="hover:text-black">
                Make-up Studio
              </Link>
            </li>
            <li>
              <Link href="/academy" className="hover:text-black">
                Academy
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-black">
                About
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default NavBarCart;
