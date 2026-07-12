import { getHomePageImages } from "@/lib/data-service";
import Image from "next/image";
import Link from "next/link";

export default async function HomePageCard() {
  const data = await getHomePageImages();

  if (!data) {
    return (
      <div className="py-16 text-center text-neutral-500">
        Unable to load homepage content.
      </div>
    );
  }

  const makeup = data.find((item) => item.title.startsWith("Makeup"));
  const hair = data.find((item) => item.title.startsWith("Hair"));
  const salon = data.find((item) => item.title.startsWith("Saloon"));
  const academy = data.find((item) => item.title.startsWith("Academy"));

  const cards = [
    {
      title: "Hair Collection",
      subtitle: "Premium Wigs & Extensions",
      description:
        "Discover luxurious wigs, bundles and premium hair collections.",
      href: "/store",
      image: hair?.images,
      badge: "Shop",
    },
    {
      title: "Luxury Salon",
      subtitle: "Beauty Services",
      description:
        "Book professional styling, treatments and luxury salon experiences.",
      href: "/saloon",
      image: salon?.images,
      badge: "Book",
    },
    {
      title: "Make-up Studio",
      subtitle: "Professional Glam",
      description:
        "Bridal, photoshoot and event make-up by experienced artists.",
      href: "/makeUpStudio",
      image: makeup?.images,
      badge: "Explore",
    },
    {
      title: "Beauty Academy",
      subtitle: "Learn From Experts",
      description:
        "Become a certified beauty professional through our academy.",
      href: "/academy",
      image: academy?.images,
      badge: "Enroll",
    },
  ];

  return (
    <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Link
          key={card.title}
          href={card.href}
          className="
          group
          relative
          overflow-hidden
          rounded-3xl
          bg-white
          shadow-lg
          transition-all
          duration-500
          hover:-translate-y-3
          hover:shadow-2xl
        "
        >
          {/* Image */}

          <div className="relative h-80 overflow-hidden">
            <Image
              src={card.image}
              alt={card.title}
              fill
              className="
                object-cover
                transition-transform
                duration-700
                group-hover:scale-110
              "
            />

            {/* Gradient */}

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            {/* Badge */}

            <span
              className="
                absolute
                left-5
                top-5
                rounded-full
                bg-white/90
                px-3
                py-1
                text-xs
                font-semibold
                text-neutral-900
              "
            >
              {card.badge}
            </span>

            {/* Text */}

            <div className="absolute bottom-0 p-6 text-white">
              <p className="text-sm uppercase tracking-[0.3em] text-amber-300">
                {card.subtitle}
              </p>

              <h3 className="mt-2 font-playfair text-3xl font-bold">
                {card.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-white/90">
                {card.description}
              </p>

              <div
                className="
                  mt-6
                  inline-flex
                  items-center
                  gap-2
                  font-semibold
                  text-amber-300
                  transition-all
                  group-hover:gap-4
                "
              >
                Discover
                <span>→</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
