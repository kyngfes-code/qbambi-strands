"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Haircard({ item, href }) {
  const {
    id,
    title,
    price,
    description,
    category,
    material,
    wigType,
    style,
    main_image,
    extra_images,
  } = item;

  const images = [main_image, ...extra_images.map((img) => img.image)];
  const [current, setCurrent] = useState(0);
  const [adding, setAdding] = useState(false);

  const { data: session } = useSession();

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

  async function addToCart() {
    console.log("🛒 [ADD_TO_CART] Clicked");

    try {
      setAdding(true);

      if (!session?.user?.id) {
        alert("Please sign in");
        return;
      }

      const storeId = item.id ?? item.store_id;

      if (!storeId) {
        console.error("❌ Missing storeId", item);
        return;
      }

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ storeId }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ [API ERROR]", data);
        throw new Error(data.error || "Failed to add to cart");
      }

      console.log("✅ [API SUCCESS]", data);
      alert("Added to cart 🛒");
    } catch (err) {
      console.error("🔥 [ADD_TO_CART ERROR]", err);
      alert("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  }

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
            <Link href={href || ""} key={index}>
              <Image
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
            </Link>
          ))}

          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white px-2 py-1 rounded-full"
          >
            ‹
          </button>

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
              />
            ))}
          </div>
        </div>

        {/* INFO */}
        <div className="flex justify-between items-center mt-3">
          <h2 className="font-semibold text-[#b33863] text-xs">
            Name: {title}
          </h2>
          <span className="font-semibold px-2 py-1 text-[#b33863] bg-black rounded-lg border text-xs animate-[subtleBlink_2.4s_ease-in-out_infinite]">
            ₦{price}
          </span>
        </div>

        <hr className="border-[#e3b4c7] my-1" />

        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-[#b33863] text-xs">
            Category: {category}
          </h3>
          {style && (
            <h3 className="font-semibold text-[#b33863] text-xs">
              Style: {style}
            </h3>
          )}
        </div>

        <hr className="border-[#e3b4c7] my-1" />

        {wigType && (
          <>
            <h3 className="font-semibold text-[#b33863] text-xs">
              Wig-Type: {wigType}
            </h3>
            <hr className="border-[#e3b4c7] my-1" />
          </>
        )}

        {material && (
          <>
            <span className="text-xs text-[#7a3a4e]">Mat: {material}</span>
            <hr className="border-[#e3b4c7] my-1" />
          </>
        )}

        <p className="text-xs text-[#482d36] line-clamp-2">
          Desc: {description}
        </p>

        <hr className="border-[#e3b4c7] my-2" />

        {/* ADD TO CART */}
        <button
          onClick={addToCart}
          disabled={adding}
          className="w-full py-2 rounded-xl bg-[#b33863] text-white text-sm font-semibold hover:bg-[#9e2f56] transition disabled:opacity-50"
        >
          {adding ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
