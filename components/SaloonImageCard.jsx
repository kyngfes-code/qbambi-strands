import Image from "next/image";
import Link from "next/link";

export default function SaloonImageCard({
  src,
  title,
  description,
  className = "",
  noBg = false,
  noClick = false,
  noHref = false,
  href,
}) {
  return (
    <div
      className={`h-40 w-full flex flex-col gap-2 px-2 ${
        noBg ? "" : "backdrop-blur-sm bg-white/10"
      } rounded-xl overflow-hidden ${className}`}
    >
      <div className="relative h-50 rounded-lg overflow-hidden">
        <Link href={`${noHref ? "" : href}`} className="block w-full h-full">
          <span
            className={`${
              noClick
                ? "hidden"
                : "absolute top-2 left-2 z-20 text-white text-sm font-semibold bg-black/50 px-2 py-1 rounded animate-pulse"
            }`}
          >
            click me
          </span>

          <Image
            src={src}
            alt={`${title} ?? "salon image"`}
            fill
            className="object-cover opacity-90 hover:opacity-100 transition-all duration-300"
          />
        </Link>
      </div>

      <div className="flex flex-col justify-center text-white w-40 overflow-hidden">
        <h2 className="font-semibold text-sm">{title}</h2>
        <p className="text-xs opacity-80">{description}</p>
      </div>
    </div>
  );
}
