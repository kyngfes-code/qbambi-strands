import Image from "next/image";
import { Suspense } from "react";

import bg1 from "@/public/bg1.jpg";

import HeroSection from "@/components/HeroSection";
import HomePageCard from "@/components/HomePageCard";
import SpinnerMini from "@/components/PageSpinner";

export default function Home() {
  return (
    <main className="bg-neutral-50">
      {/* ================= HERO ================= */}
      <section className="relative isolate overflow-hidden">
        {/* Background */}
        <Image
          src={bg1}
          alt="Qbambi Strands"
          fill
          priority
          placeholder="blur"
          className="object-cover object-center"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/25" />

        {/* Decorative fade */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-neutral-50 to-transparent" />

        {/* Hero */}
        <div className="relative z-10">
          <HeroSection />
        </div>
      </section>

      {/* ================= EXPLORE ================= */}
      <section className="relative -mt-20 z-20 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] bg-white/70 p-6 shadow-2xl backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="mb-10 text-center">
              <span className="inline-flex rounded-full bg-amber-100 px-4 py-1 text-sm font-semibold text-amber-700">
                Explore Qbambi
              </span>

              <h2 className="mt-5 font-playfair text-3xl font-bold text-neutral-900 sm:text-4xl">
                Everything Beauty in One Place
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-neutral-600">
                Shop premium hair products, book luxury salon appointments,
                experience professional make-up artistry, or begin your beauty
                career at the Qbambi Academy.
              </p>
            </div>

            <Suspense fallback={<SpinnerMini />}>
              <HomePageCard />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <h2 className="font-playfair text-3xl font-bold text-neutral-900 sm:text-4xl">
              Why Choose Qbambi Strands?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-neutral-600">
              We combine luxury products, experienced professionals and
              exceptional customer service to deliver an unforgettable beauty
              experience.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border bg-white p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
              <div className="mb-4 text-4xl">✨</div>

              <h3 className="mb-2 text-xl font-semibold">Premium Products</h3>

              <p className="text-neutral-600">
                Carefully selected luxury hair and beauty products.
              </p>
            </div>

            <div className="rounded-3xl border bg-white p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
              <div className="mb-4 text-4xl">💇🏽‍♀️</div>

              <h3 className="mb-2 text-xl font-semibold">Expert Stylists</h3>

              <p className="text-neutral-600">
                Professional stylists dedicated to helping you look your best.
              </p>
            </div>

            <div className="rounded-3xl border bg-white p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
              <div className="mb-4 text-4xl">🎓</div>

              <h3 className="mb-2 text-xl font-semibold">Beauty Academy</h3>

              <p className="text-neutral-600">
                Learn from experienced professionals and build your career.
              </p>
            </div>

            <div className="rounded-3xl border bg-white p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
              <div className="mb-4 text-4xl">❤️</div>

              <h3 className="mb-2 text-xl font-semibold">Customer First</h3>

              <p className="text-neutral-600">
                Every service is designed to give you confidence and elegance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="pb-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-amber-700 via-amber-600 to-orange-500 p-10 text-center text-white shadow-2xl lg:p-16">
            <h2 className="font-playfair text-3xl font-bold sm:text-5xl">
              Ready For Your Transformation?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/90">
              Whether you're shopping, booking a salon appointment, or joining
              our academy, your beauty journey begins here.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="/appointments"
                className="rounded-full bg-white px-8 py-4 font-semibold text-amber-700 transition hover:scale-105"
              >
                Book Appointment
              </a>

              <a
                href="/store"
                className="rounded-full border border-white px-8 py-4 font-semibold transition hover:bg-white/10"
              >
                Shop Collection
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
