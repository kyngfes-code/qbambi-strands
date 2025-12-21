import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative h-[90vh] w-full flex items-center justify-center overflow-hidden">
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/10 pointer-events-none" />
      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight drop-shadow-md">
          Luxury Hair, Make-up & Beauty Services
        </h1>

        <p className="mt-4 text-lg md:text-xl text-white max-w-2xl mx-auto">
          Look elegant, flawless, and confident with our premium beauty
          experience.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/store"
            className="relative pointer-events-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#ffcfd8] to-[#ff7aa2] text-white font-bold shadow-lg animate-[bounce_2s_infinite] hover:animate-none hover:scale-105 active:scale-95 transition-transform duration-300"
          >
            Shop Now
          </Link>

          <button className="px-6 py-3 rounded-xl border border-white text-white font-bold hover:bg-white/20 transition">
            Book Appointment
          </button>
        </div>
      </div>
    </section>
  );
}
