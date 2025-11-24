"use client";

import { useState, useRef } from "react";
import Image from "next/image";

export default function Haircard({ hair }) {
  const { title, price, description, main_image, extra_images } = hair;

  const images = [main_image, ...extra_images.map((img) => img.image)];
  const [current, setCurrent] = useState(0);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const next = () => setCurrent((c) => (c + 1) % images.length);
  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;
    if (Math.abs(distance) < 50) return;
    distance > 0 ? next() : prev();
  };

  return (
    <div className="w-64">
      <div className="border rounded-xl p-3 shadow-md bg-[#fff6f9]">
        {/* CAROUSEL */}
        <div
          className="relative w-full h-48 overflow-hidden rounded-lg group"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {images.map((src, index) => (
            <Image
              key={index}
              src={src}
              alt={title}
              fill
              draggable={false}
              className={`
                absolute inset-0 object-cover transition-all duration-500
                ${current === index ? "opacity-100" : "opacity-0"}
                group-hover:scale-110
              `}
            />
          ))}

          {/* Left arrow */}
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white px-2 py-1 rounded-full"
          >
            ‹
          </button>

          {/* Right arrow */}
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white px-2 py-1 rounded-full"
          >
            ›
          </button>

          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-2.5 h-2.5 rounded-full ${
                  current === index ? "bg-white" : "bg-white/40"
                }`}
              ></button>
            ))}
          </div>
        </div>

        {/* TITLE / DESCRIPTION */}
        <h2 className="mt-3 font-semibold text-[#b33863] text-md">{title}</h2>
        <p className="text-sm text-[#7a3a4e] line-clamp-2">{description}</p>
        <span className="mt-3 font-light  text-[#7a3a4e] text-sm">{price}</span>
      </div>
    </div>
  );
}
