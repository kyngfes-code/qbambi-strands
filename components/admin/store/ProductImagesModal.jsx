"use client";

import Image from "next/image";
import Link from "next/link";
import { X, ImageIcon, Pencil } from "lucide-react";

export default function ProductImagesModal({ product, isOpen, onClose }) {
  if (!isOpen || !product) return null;

  const images = [
    {
      id: product.id,
      src: product.main_image,
      type: "Main Image",
      editHref: `/admin/shop/${product.id}`,
    },
    ...(product.extra_images || []).map((img) => ({
      id: img.id,
      src: img.image,
      type: "Extra Image",
      editHref: `/admin/shop/extraimages/${img.id}`,
    })),
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-[60] w-[95vw] max-w-6xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">
              {product.title}
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Manage product images
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 transition hover:bg-neutral-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[75vh] overflow-y-auto p-6">
          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <ImageIcon className="h-14 w-14 text-neutral-300" />

              <h3 className="mt-5 text-lg font-semibold">
                No images available
              </h3>

              <p className="mt-2 text-neutral-500">
                Upload images to this product.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Image */}
                  <div className="relative aspect-square">
                    <Image
                      src={image.src}
                      alt={`${product.title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />

                    <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                      {image.type}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="space-y-4 p-4">
                    <div>
                      <h4 className="line-clamp-1 font-semibold">
                        {product.title}
                      </h4>

                      <p className="mt-1 text-sm text-neutral-500">
                        {image.type}
                      </p>
                    </div>

                    <Link
                      href={image.editHref}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#B33863] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#98294f]"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit Image
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
