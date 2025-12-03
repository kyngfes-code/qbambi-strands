"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

function MakeUpImagesCard({ images }) {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <div className="relative w-full mt-4 animate-slideIn">
      {/* Left Button */}
      <button
        onClick={scrollLeft}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full shadow-md backdrop-blur-md z-20"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Right Button */}
      <button
        onClick={scrollRight}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full shadow-md backdrop-blur-md z-20"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Scrollable Container (NO overflow-x visible) */}
      <div
        ref={scrollRef}
        className="
          overflow-x-hidden overflow-y-hidden whitespace-nowrap scroll-smooth px-4 "
      >
        <div className="flex gap-6 w-max">
          {images.map((item, index) => (
            <div
              key={index}
              className="min-w-[250px] sm:w-64 shrink-0 border rounded-3xl p-3 
                          shadow-md transition hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="relative w-full h-64 rounded-xl overflow-hidden">
                <Image
                  src={item.images}
                  alt="make-up image"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MakeUpImagesCard;
