import Image from "next/image";
import Link from "next/link";

import icon from "@/public/icon-gold.png";

export default function Logo({ width = 48, height = 48, className = "" }) {
  return (
    <Link
      href="/"
      aria-label="Qbambi Strands Home"
      className={`flex items-center gap-3 transition-opacity hover:opacity-90 ${className}`}
    >
      <Image
        src={icon}
        alt="Qbambi Strands Logo"
        width={width}
        height={height}
        priority
        className="h-10 w-10 flex-shrink-0 object-contain sm:h-12 sm:w-12"
      />

      <div className="hidden md:block">
        <p className="font-playfair text-xl font-semibold tracking-tight text-neutral-900">
          Q-bambi Strands
        </p>

        <p className="text-xs tracking-[0.25em] uppercase text-neutral-500">
          Hair • Beauty • Academy
        </p>
      </div>
    </Link>
  );
}
