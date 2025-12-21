"use client";

import Image from "next/image";
import Link from "next/link";

export default function HaircardAdmin({ items }) {
  const {
    title,
    price,
    description,
    category,
    wigType,
    material,
    style,
    quantity,
    main_image,
    extra_images,
  } = items;

  const images = [
    { src: main_image, link: `/admin/shop/${items.id}` },
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
        <h2 className="mt-3 font-semibold text-[#b33863] text-md">
          name: <span className="text-gray-600">{title}</span>
        </h2>
        <h3 className=" font-semibold text-[#b33863] text-md">
          category: <span className="text-gray-600">{category}</span>
        </h3>
        <h3 className="font-semibold text-[#b33863] text-md">
          style:<span className="text-gray-600">{style}</span>
        </h3>
        <h3 className="font-semibold text-[#b33863] text-md">
          wig-type: <span className="text-gray-600">{wigType}</span>
        </h3>
        <h3 className="font-semibold text-[#b33863] text-md">
          mat: <span className="text-gray-600">{material}</span>
        </h3>
        <p className="text-sm font-semibold text-[#b33863]  line-clamp-2">
          des: <span className="text-gray-600">{description}</span>
        </p>
        <span className="mt-3 font-semibold text-[#b33863] text-sm">
          price: <span className="text-gray-600">{price}</span>
        </span>
        <br />
        <span className="mt-3 font-semibold text-[#b33863] text-sm">
          qty: <span className="text-gray-600">{quantity}</span>
        </span>
      </div>
    </div>
  );
}
