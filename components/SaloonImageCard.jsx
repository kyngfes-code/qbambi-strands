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
  href = "#",
}) {
  const image = (
    <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
      {!noClick && (
        <span className="absolute left-3 top-3 z-20 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur animate-pulse">
          Click Me
        </span>
      )}

      <Image
        src={src}
        alt={title || "Salon image"}
        fill
        sizes="(max-width:768px) 50vw, 25vw"
        className="object-cover object-center transition duration-500 group-hover:scale-105"
      />
    </div>
  );

  return (
    <div
      className={`flex h-full flex-col rounded-2xl p-2 ${
        noBg ? "" : "border border-white/10 bg-white/10 backdrop-blur-md"
      } ${className}`}
    >
      {noHref ? (
        image
      ) : (
        <Link href={href} className="block">
          {image}
        </Link>
      )}

      {(title || description) && (
        <div className="mt-3 text-center text-white">
          {title && (
            <h3 className="line-clamp-1 text-sm font-semibold sm:text-base">
              {title}
            </h3>
          )}

          {description && (
            <p className="mt-1 line-clamp-2 text-xs text-white/80 sm:text-sm">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
