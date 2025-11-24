import Image from "next/image";
import Link from "next/link";
import icon from "@/public/icon-gold.png";

function Logo({ height = "60", width = "60", src = icon, className = "" }) {
  return (
    <Link href="/" className="flex items-center gap-4 z-10 sm:px-2">
      <Image
        src={src}
        height={height}
        width={width}
        alt="Qbambi strands logo"
      />
      <span
        className={` hidden font-playfair text-xl font-semibold  ${className}`}
      >
        Qbambi Strands
      </span>
    </Link>
  );
}

export default Logo;
