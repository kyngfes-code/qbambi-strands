import FloatingClickMe from "@/components/FloatingClickMe";
import SaloonImageCard from "@/components/SaloonImageCard";
import { getSaloonData } from "@/lib/data-service";
import { CheckCheckIcon } from "lucide-react";
import BackButton from "./BackButton";

export const metadata = {
  title: "Saloon",
};

export default async function Page() {
  const data = await getSaloonData();
  const images = data.slice(0, 4);

  const services = [
    "Wig Installation",
    "Luxe Braids",
    "Elegant Packing Gel Styles",
    "Professional Wigging",
    "Custom Wig Making",
    "Re-vamping & Restyling",
    "Lash Extension Services",
    "Nail Glam & Manicure Artistry",
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-br from-black via-[#171717] to-[#3d2a14] text-white">
      <BackButton />
      {/* Hero */}
      <section className="mx-auto flex max-w-7xl flex-col items-center px-6 py-20 text-center lg:py-28">
        <h1 className="max-w-5xl text-4xl font-bold leading-tight text-[#C6A667] sm:text-5xl lg:text-6xl">
          Luxury Hair • Flawless Glam • Premium Care
        </h1>

        <p className="mt-6 max-w-3xl text-base leading-8 text-[#f3e8c9] sm:text-xl">
          We enhance your natural beauty with world-class salon services crafted
          with precision, artistry, and luxury.
        </p>

        <div className="mt-10 grid w-full max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div
              key={service}
              className="flex items-center gap-3 rounded-2xl border border-[#C6A667]/20 bg-white/5 p-4 backdrop-blur"
            >
              <CheckCheckIcon className="h-5 w-5 shrink-0 text-[#C6A667]" />

              <span className="text-left text-sm font-medium sm:text-base">
                {service}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery + Stats */}
      <section className="mx-auto mb-16 grid max-w-7xl gap-8 px-6 lg:grid-cols-[2fr_1fr]">
        {/* Images */}
        <div className="grid grid-cols-2 gap-4">
          {images.map((item) => (
            <SaloonImageCard
              key={item.id}
              noBg
              href="/saloon/images"
              src={item.images}
            />
          ))}
        </div>

        {/* Stats Card */}
        <div className="flex flex-col justify-center rounded-3xl border border-[#C6A667]/20 bg-white/5 p-8 backdrop-blur">
          <h2 className="text-center text-6xl font-bold text-[#C6A667]">10+</h2>

          <p className="mt-4 text-center text-2xl font-semibold text-[#f3e8c9]">
            Years of Experience
          </p>

          <p className="mt-6 text-center leading-8 text-gray-300">
            Delivering premium beauty services trusted by hundreds of clients.
            Our mastery in haircare, wig craftsmanship, and glam styling sets us
            apart.
          </p>
        </div>
      </section>

      <FloatingClickMe className="z-50" />
    </main>
  );
}
