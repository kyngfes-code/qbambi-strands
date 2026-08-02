import FetchImage from "@/components/FetchImge";
import SaloonImageCard from "@/components/SaloonImageCard";
import { Sparkles } from "lucide-react";
import BackButton from "../BackButton";

export const metadata = {
  title: "Saloon Gallery",
};

export default async function Page() {
  const { saloonWorkImageData } = await FetchImage();

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f0f0f] via-[#171717] to-black">
      <BackButton />
      {/* Hero */}
      <section className="mx-auto flex max-w-7xl flex-col items-center px-6 py-14 text-center lg:py-20">
        <div className="mb-5 flex items-center gap-2 rounded-full border border-[#C6A667]/30 bg-[#C6A667]/10 px-5 py-2 text-[#C6A667]">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium uppercase tracking-[0.25em]">
            Salon Portfolio
          </span>
        </div>

        <h1 className="max-w-4xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
          Every Style Tells
          <span className="block text-[#C6A667]">A Beautiful Story</span>
        </h1>

        <p className="mt-6 max-w-3xl text-base leading-8 text-neutral-300 sm:text-lg">
          Browse a curated collection of our finest salon transformations. From
          luxury wig installations to flawless glam, every look reflects our
          commitment to elegance, craftsmanship, and beauty.
        </p>
      </section>

      {/* Gallery */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-6 lg:px-8">
        <div
          className="
            grid
            grid-cols-2
            gap-5
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-5
          "
        >
          {saloonWorkImageData.map((item) => (
            <SaloonImageCard
              key={item.id}
              src={item.images}
              title={item.title}
              description={item.description}
              noBg
              noClick
              noHref
              className="transition duration-300 hover:-translate-y-2"
            />
          ))}
        </div>
      </section>
    </main>
  );
}
