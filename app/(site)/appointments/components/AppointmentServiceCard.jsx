"use client";

import Image from "next/image";
import { CheckCircle2, Clock3, ArrowRight } from "lucide-react";

export default function AppointmentServiceCard({
  service,
  selected = false,
  onSelect,
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(service)}
      className={`
        group
        relative
        flex
        w-full
        flex-col
        overflow-hidden
        rounded-3xl
        border
        bg-white
        text-left
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
        focus:outline-none
        focus:ring-2
        focus:ring-amber-500

        ${
          selected
            ? "border-amber-500 ring-2 ring-amber-200 shadow-xl"
            : "border-neutral-200 hover:border-amber-300"
        }
      `}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={service.image}
          alt={service.name}
          fill
          priority={false}
          className="object-cover transition duration-500 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {selected && (
          <div className="absolute right-4 top-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg">
              <CheckCircle2 size={20} />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="font-playfair text-xl font-semibold text-neutral-900">
            {service.name}
          </h3>

          {service.popular && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
              Popular
            </span>
          )}
        </div>

        <p className="mb-5 flex-1 text-sm leading-6 text-neutral-600">
          {service.description}
        </p>

        {/* Meta */}
        <div className="space-y-3">
          {service.duration && (
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Clock3 size={16} />
              <span>{service.duration}</span>
            </div>
          )}

          {service.price && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-400">
                  Starting From
                </p>

                <p className="text-xl font-bold text-neutral-900">
                  ₦{Number(service.price).toLocaleString()}
                </p>
              </div>

              <div
                className={`
                  flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition

                  ${
                    selected
                      ? "bg-amber-500 text-white"
                      : "bg-neutral-100 text-neutral-700 group-hover:bg-amber-100"
                  }
                `}
              >
                {selected ? "Selected" : "Select"}

                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-1"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
