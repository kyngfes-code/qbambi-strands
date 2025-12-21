import FloatingClickMe from "@/components/FloatingClickMe";
import NavBar from "@/components/NavBar";
import SaloonImageCard from "@/components/SaloonImageCard";
import SpinnerMini from "@/components/SpinnerMini";
import { getSaloonData } from "@/lib/data-service";
import { CheckCheckIcon } from "lucide-react";

export const metadata = {
  title: "Saloon",
};

export default async function Page() {
  const data = await getSaloonData();
  const images = data.slice(0, 4);
  return (
    <div className="h-screen flex flex-col text-white overflow-x-hidden">
      <NavBar className="border-0" />

      {/* TOP SECTION — HERO */}
      <section className="h-2/3 flex flex-col items-center justify-center pl-4 pr-6 text-center">
        <h1 className="text-[#C6A667] text-3xl sm:text-5xl font-bold leading-tight drop-shadow-lg">
          Luxury Hair • Flawless Glam • Premium Care
        </h1>

        <p className="text-[#f3e8c9] mt-3 text-lg sm:text-xl max-w-2xl drop-shadow">
          We enhance your natural beauty with world-class salon services crafted
          with precision, artistry, and luxury.
        </p>

        <ul className="flex flex-wrap gap-4 justify-center mt-6 max-w-3xl">
          {[
            "Wig Installation",
            "Luxe Braids",
            "Elegant Packing Gel Styles",
            "Professional Wigging",
            "Custom Wig Making",
            "Re-vamping & Restyling",
            "Lash Extension Services",
            "Nail Glam & Manicure Artistry",
          ].map((service, index) => (
            <li
              key={index}
              className="flex items-center gap-2 text-white font-semibold text-base sm:text-lg 
                         drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]"
            >
              <CheckCheckIcon className="w-4 h-4 text-[#C6A667]" />
              {service}
            </li>
          ))}
        </ul>
      </section>

      <section className="h-1/3 flex flex-wrap overflow-hidden">
        <div className="w-2/3 flex p-2 min-w-0 ">
          {images.map((item) => (
            <SaloonImageCard
              noBg
              href="/saloon/images"
              src={item.images}
              key={item.id}
            />
          ))}
        </div>

        <div className="w-1/3 min-w-0 flex flex-col mb-2 items-center justify-center px-2 bg-[#1a1a1a]/60 backdrop-blur-sm rounded-l-2xl">
          <h2 className="text-[#C6A667] text-4xl sm:text-5xl font-bold drop-shadow">
            10+
          </h2>

          <p className="text-lg sm:text-xl text-center mt-2 text-[#f3e8c9]">
            Years of Exceptional Salon Experience
          </p>

          <p className="text-sm sm:text-base  text-gray-200 mt-2 leading-relaxed text-center max-w-xs">
            Delivering premium beauty services trusted by hundreds of clients.
            Our mastery in haircare, wig craftsmanship, and glam styling sets us
            apart.
          </p>
        </div>
      </section>
      <FloatingClickMe className="z-50" />
    </div>
  );
}
