"use client";

import Image from "next/image";
import Link from "next/link";
import { Pencil, Images, Trash2, Eye } from "lucide-react";

export default function StoreProductRow({
  product,
  mobile = false,
  onOpenImages,
  onDelete,
}) {
  const {
    id,
    title,
    category,
    wigType,
    quantity,
    price,
    status,
    main_image,
    extra_images = [],
  } = product;

  // ---------------- MOBILE CARD ----------------
  if (mobile) {
    return (
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex gap-4">
          <Link href={`/admin/shop/${id}`}>
            <div className="relative h-24 w-24 overflow-hidden rounded-xl border">
              <Image
                src={main_image}
                alt={title}
                fill
                className="object-cover"
              />
            </div>
          </Link>

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold">{title}</h3>

            <p className="text-sm text-neutral-500">
              {wigType || "No wig type"}
            </p>

            <p className="mt-1 text-sm">{category || "-"}</p>

            <p className="mt-2 font-semibold">
              ₦{Number(price).toLocaleString()}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs">
                Qty {quantity}
              </span>

              <span
                className={`rounded-full px-2 py-1 text-xs ${
                  status
                    ? "bg-green-100 text-green-700"
                    : "bg-neutral-200 text-neutral-700"
                }`}
              >
                {status ? "Live" : "Hidden"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => onOpenImages(product)}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
          >
            <Images className="h-4 w-4" />
            {extra_images.length + 1} Images
          </button>

          <Link
            href={`/admin/shop/${id}`}
            className="rounded-lg border p-2 hover:bg-neutral-100"
          >
            <Pencil className="h-4 w-4" />
          </Link>

          <button
            onClick={() => onOpenImages(product)}
            className="rounded-lg border p-2 hover:bg-neutral-100"
          >
            <Eye className="h-4 w-4" />
          </button>

          <button
            onClick={() => onDelete?.(product)}
            className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // ---------------- DESKTOP TABLE ROW ----------------
  return (
    <tr className="border-b transition hover:bg-neutral-50">
      <td className="p-4">
        <Link href={`/admin/shop/${id}`}>
          <div className="relative h-16 w-16 overflow-hidden rounded-xl border">
            <Image src={main_image} alt={title} fill className="object-cover" />
          </div>
        </Link>
      </td>

      <td className="p-4">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-neutral-500">{wigType || "No wig type"}</p>
      </td>

      <td className="p-4">{category || "-"}</td>

      <td className="p-4 text-center">{quantity}</td>

      <td className="p-4 font-medium">₦{Number(price).toLocaleString()}</td>

      <td className="p-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            status
              ? "bg-green-100 text-green-700"
              : "bg-neutral-200 text-neutral-700"
          }`}
        >
          {status ? "Live" : "Hidden"}
        </span>
      </td>

      <td className="p-4">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onOpenImages(product)}
            className="rounded-lg p-2 hover:bg-neutral-100"
          >
            <Images className="h-4 w-4" />
          </button>

          <Link
            href={`/admin/shop/${id}`}
            className="rounded-lg p-2 hover:bg-neutral-100"
          >
            <Pencil className="h-4 w-4" />
          </Link>

          <button
            onClick={() => onOpenImages(product)}
            className="rounded-lg p-2 hover:bg-neutral-100"
          >
            <Eye className="h-4 w-4" />
          </button>

          <button
            onClick={() => onDelete?.(product)}
            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
