import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[78vh] items-center lg:min-h-[88vh]">
      <div className="mx-auto flex w-full max-w-7xl items-center px-6 py-20 sm:px-8 lg:px-12">
        <div className="max-w-3xl">
          {/* Badge */}
          <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium tracking-wide text-white backdrop-blur-md">
            ✨ Premium Hair • Salon • Make-up • Academy
          </span>

          {/* Heading */}
          <h1 className="mt-8 font-playfair text-5xl font-bold leading-tight text-white drop-shadow-lg sm:text-6xl lg:text-7xl">
            Elevate Your
            <span className="block bg-gradient-to-r from-amber-200 via-yellow-100 to-white bg-clip-text text-transparent">
              Beauty Experience
            </span>
          </h1>

          {/* Description */}
          <p className="mt-8 max-w-2xl text-lg leading-8 text-white/90 sm:text-xl">
            Discover luxury hair collections, professional make-up artistry,
            premium salon services, and world-class beauty training—all in one
            destination.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/store"
              className="
                inline-flex items-center justify-center
                rounded-full
                bg-gradient-to-r
                from-amber-500
                to-orange-500
                px-8
                py-4
                text-base
                font-semibold
                text-white
                shadow-xl
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-2xl
              "
            >
              Shop Collection →
            </Link>

            <Link
              href="/appointments"
              className="
                inline-flex items-center justify-center
                rounded-full
                border
                border-white/40
                bg-white/10
                px-8
                py-4
                text-base
                font-semibold
                text-white
                backdrop-blur-md
                transition-all
                duration-300
                hover:bg-white/20
              "
            >
              Book Appointment
            </Link>
          </div>

          {/* Statistics */}
          <div className="mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/20 pt-8">
            <div>
              <h3 className="text-3xl font-bold text-white">1000+</h3>
              <p className="mt-2 text-sm text-white/70">Happy Clients</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-white">4</h3>
              <p className="mt-2 text-sm text-white/70">Beauty Services</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-white">★ 5.0</h3>
              <p className="mt-2 text-sm text-white/70">Customer Experience</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 animate-bounce lg:block">
        <div className="flex h-12 w-7 justify-center rounded-full border border-white/50">
          <div className="mt-2 h-3 w-1 rounded-full bg-white" />
        </div>
      </div>
    </section>
  );
}
