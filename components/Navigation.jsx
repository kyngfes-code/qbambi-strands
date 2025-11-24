import { Phone, PhoneIcon } from "lucide-react";
import Link from "next/link";

export default function Navigation({ className = "" }) {
  return (
    <nav className="z-10 text-xl">
      <ul
        className={` flex gap-2 text-stone-700 items-center sm:gap-4 sm:mx-2 sm:px-2 md:gap-4 lg:gap-8 ${className} `}
      >
        <li>
          <Link
            href="/"
            className="hover:text-accent-800 font-playfair transition-colors"
          >
            Home
          </Link>
        </li>
        <li className="sm:mr-4">
          <Link
            href="/shop"
            className="hover:text-accent-400 font-playfair transition-colors"
          >
            Shop
          </Link>
        </li>
        <li>
          <Link
            href="/makeUpStudio"
            className="hover:text-accent-400 font-playfair transition-colors"
          >
            Make-up studio
          </Link>
        </li>
        <li>
          <Link
            href="/academy"
            className="hover:text-accent-400 font-playfair transition-colors"
          >
            Qbambi's Academy
          </Link>
        </li>
        <li className="sm:mr-6">
          <Link
            href="/about"
            className="hover:text-accent-400 font-playfair transition-colors"
          >
            About
          </Link>
        </li>
        <li>
          <Link
            href="/saloon"
            className="hover:text-accent-400 transition-colors"
          >
            <span className=" font-playfair">Our Saloon</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
