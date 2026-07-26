"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingBag, Eye } from "lucide-react";

export default function Haircard({ item, href = `/store/${item.id}` }) {
  const {
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

  const images = [
    main_image,
    ...(extra_images ?? []).map((img) => img?.image).filter(Boolean),
  ].filter(Boolean);

  //const images = [main_image, ...(extra_images?.map((img) => img.image) ?? [])];

  const [current, setCurrent] = useState(0);
  const [adding, setAdding] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const next = () => setCurrent((c) => (c + 1) % images.length);

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);

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

  async function addToCart() {
    try {
      setAdding(true);

      const storeId = item.id ?? item.store_id;

      const res = await fetch("/api/cart", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ storeId }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          alert("Please sign in to add items to your cart");
          return;
        }

        throw new Error(data.error);
      }

      alert("Added to cart 🛍️");
    } catch (err) {
      console.error(err);
      alert("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  }

  // console.log(item);

  return (
    <Link href={href} className="block h-full">
      <article className="group flex h-full  w-full  flex-col overflow-hidden rounded-3xl border border-[#f1d9e3] bg-[#fffdfc] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(179,56,99,.18)]">
        {/* IMAGE */}

        <div
          className="relative aspect-[3/4] sm:h-[420px] md:h-[440px] lg:h-[440px] w-full overflow-hidden  bg-[#faf6f8]"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={images[current]}
            alt={title}
            fill
            sizes="(max-width:640px) 100vw,
             (max-width:1024px) 50vw,
             (max-width:1280px) 33vw,
             25vw"
            draggable={false}
            priority={false}
            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />

          {/* image overlay */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

          {/* BADGES */}
          <div className="absolute bottom-4 left-4 z-20 flex flex-wrap gap-2">
            {wigType && (
              <span className="rounded-full bg-white/80 backdrop-blur-md border border-white/50 shadow-sm px-3 py-1 text-xs font-medium backdrop-blur">
                {wigType}
              </span>
            )}

            {material && (
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium backdrop-blur">
                {material}
              </span>
            )}
          </div>

          {/* IMAGE COUNT */}
          {images.length > 1 && (
            <div className="absolute right-4 top-4 z-20 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur">
              {current + 1}/{images.length}
            </div>
          )}

          {/* PREVIOUS */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-2 opacity-0 backdrop-blur transition group-hover:opacity-100"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-2 opacity-0 backdrop-blur transition group-hover:opacity-100"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>

        {/* CONTENT */}

        <div className="flex flex-1 flex-col p-5">
          <div>
            {category && (
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#B33863] opacity-70">
                {category}
              </p>
            )}

            <h2 className="line-clamp-2 text-xl leading-snug font-semibold text-neutral-900 transition group-hover:text-[#B33863]">
              {title}
            </h2>
          </div>

          {style && (
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
                {style}
              </span>
            </div>
          )}

          <p className="line-clamp-3 min-h-[72px] text-sm leading-6 text-neutral-600">
            {description}
          </p>

          <div className="flex-1" />
          {/* PRICE */}

          <div>
            <p className="text-3xl font-bold tracking-tight text-[#B33863]">
              ₦{Number(price).toLocaleString()}
            </p>
          </div>

          {/* BUTTONS */}

          <div className="mt-6 space-y-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart();
              }}
              disabled={adding}
              className="..."
            >
              <ShoppingBag size={18} />
              {adding ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
