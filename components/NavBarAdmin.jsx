"use client";

import Logo from "./Logo";
import icon from "@/public/icon-flat-gold.png";
import SignInDropdownButton from "./SignInDropDownButton";
import Link from "next/link";

function NavBarAdmin({ className = "" }) {
  return (
    <header
      className={`sticky top-0 z-50 flex items-center justify-between mx-2 py-2 border-b bg-transparent backdrop-blur-sm font-bold border-stone-400 ${className} `}
    >
      <Logo
        height="40"
        width="40"
        src={icon}
        className="lg:block text-white text-xs "
      />
      <nav className="z-10 text-white text-sm">
        <ul
          className={` flex gap-2 text-stone-700 items-center sm:gap-4 sm:mx-2 sm:px-2 md:gap-4 lg:gap-8 ${className} `}
        >
          <li>
            <Link
              href="/admin"
              className="hover:text-accent-800 font-playfair transition-colors"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/admin/orders"
              className="hover:text-accent-800 font-playfair transition-colors"
            >
              Orders
            </Link>
          </li>
          <li className="sm:mr-4">
            <Link
              href="/admin/shop"
              className="hover:text-accent-400 font-playfair transition-colors"
            >
              Shop
            </Link>
          </li>
          <li>
            <Link
              href="/admin/make-up-studio"
              className="hover:text-accent-400 font-playfair transition-colors"
            >
              Make-up studio
            </Link>
          </li>
          <li>
            <Link
              href="/admin/academy"
              className="hover:text-accent-400 font-playfair transition-colors"
            >
              Qbambi's Academy
            </Link>
          </li>
          <li className="sm:mr-6">
            <Link
              href="/admin/about"
              className="hover:text-accent-400 font-playfair transition-colors"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="/admin/saloon"
              className="hover:text-accent-400 transition-colors"
            >
              <span className=" font-playfair">Our Saloon</span>
            </Link>
          </li>
          <li></li>
        </ul>
      </nav>

      <div className="px-2">
        <SignInDropdownButton />
      </div>
    </header>
  );
}

export default NavBarAdmin;
