import Image from "next/image";
import bgImage from "@/public/bg-make-up1.png";
import { CheckCheckIcon } from "lucide-react";

import BookButton from "@/components/BookButton";
import MakeUpImagesCard from "@/components/MakeUpImagesCard";
import { getMakeUpImages } from "@/lib/data-service";

export const metadata = {
  title: "Make-up Studio",
};

export default async function Page() {
  const images = await getMakeUpImages();

  const services = [
    "Bridal Make-up",
    "Birthday & Event Make-up",
    "Movie Set Make-up",
    "Home Service",
    "Photoshoot Glam",
    "Luxury Soft Glam",
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-br from-black via-[#2c1022] to-[#5c2245]">
      <BookButton />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <div className="text-white">
            <span className="inline-flex rounded-full border border-pink-300/30 bg-pink-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-pink-200 sm:text-sm">
              Luxury Makeup Studio
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Beauty That
              <span className="block bg-gradient-to-r from-pink-300 to-[#C6A667] bg-clip-text text-transparent">
                Speaks Elegance
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-200 sm:text-lg">
              Whether it's your wedding, birthday, photoshoot or any special
              occasion, our professional artists create timeless makeup looks
              tailored perfectly to your personality and style.
            </p>

            <div className="mt-10">
              <h2 className="mb-5 text-2xl font-semibold">
                Signature Services
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                {services.map((service) => (
                  <div
                    key={service}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all duration-300 hover:border-pink-300/30 hover:bg-white/10"
                  >
                    <CheckCheckIcon className="h-5 w-5 flex-shrink-0 text-pink-300" />

                    <span>{service}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Hero Image Only */}
          <div className="hidden justify-center lg:flex">
            <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
              <Image
                src={bgImage}
                alt="Luxury Makeup Studio"
                fill
                priority
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Recent Transformations
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-neutral-300">
            Every face is a masterpiece. Browse a collection of our recent
            luxury makeovers crafted with precision, elegance, and artistry.
          </p>
        </div>

        <MakeUpImagesCard images={images} />
      </section>
    </main>
  );
}
