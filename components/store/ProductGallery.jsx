"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductGallery({
  main_image,
  extra_images = [],
  title,
}) {
  console.log({
    main_image,
    extra_images,
  });
  const images = [
    main_image,
    ...extra_images.map((img) => img.image).filter(Boolean),
  ].filter(Boolean);

  const [current, setCurrent] = useState(0);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const next = () => setCurrent((prev) => (prev + 1) % images.length);

  const prev = () =>
    setCurrent((prev) => (prev - 1 + images.length) % images.length);

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchMove(e) {
    touchEndX.current = e.touches[0].clientX;
  }

  function handleTouchEnd() {
    const distance = touchStartX.current - touchEndX.current;

    if (Math.abs(distance) < 50) return;

    distance > 0 ? next() : prev();
  }

  return (
    <div className="space-y-5">
      {/* HERO IMAGE */}

      <div
        className="group relative overflow-hidden rounded-3xl border border-[#f1d9e3] bg-[#faf6f8]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative aspect-[4/5] w-full">
          <Image
            src={images[current]}
            alt={title}
            fill
            priority
            sizes="(max-width:768px) 100vw,
                   (max-width:1200px) 50vw,
                   700px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        {/* Counter */}

        {images.length > 1 && (
          <div className="absolute right-5 top-5 rounded-full bg-black/60 px-3 py-1 text-sm font-medium text-white backdrop-blur">
            {current + 1} / {images.length}
          </div>
        )}

        {/* Prev */}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur transition hover:scale-110"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={next}
              className="absolute right-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur transition hover:scale-110"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {/* THUMBNAILS */}

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-3 sm:grid-cols-6">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`
                relative aspect-square overflow-hidden rounded-2xl
                border transition-all duration-300
                ${
                  current === index
                    ? "border-[#B33863] ring-2 ring-[#B33863]/20"
                    : "border-neutral-200 hover:border-[#B33863]/50"
                }
              `}
            >
              <Image
                src={img}
                alt={`${title} ${index + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
