"use client";

import Image from "next/image";
import Link from "next/link";

export default function HaircardAdmin({ hair }) {
  const { title, price, description, main_image, extra_images } = hair;

  const images = [
    { src: main_image, link: `/admin/shop/${hair.id}` },
    ...extra_images.map((img) => ({
      src: img.image,
      link: `/admin/shop/extraimages/${img.id}`,
    })),
  ];

  return (
    <div className="w-64">
      <div className="border rounded-xl p-3 shadow-md bg-[#fff6f9]">
        {/* 2-COLUMN IMAGE GRID */}
        <div className="grid grid-cols-2 gap-2 w-full overflow-hidden rounded-lg">
          {images.map((img, index) => (
            <Link href={img.link} key={index}>
              <div className="relative w-full h-28 rounded-lg overflow-hidden">
                <Image
                  src={img.src}
                  alt={title}
                  fill
                  draggable={false}
                  className="object-cover"
                />
              </div>
            </Link>
          ))}
        </div>

        <h2 className="mt-3 font-semibold text-[#b33863] text-md">{title}</h2>
        <p className="text-sm text-[#7a3a4e] line-clamp-2">{description}</p>
        <span className="mt-3 font-light text-[#7a3a4e] text-sm">{price}</span>
      </div>
    </div>
  );
}
