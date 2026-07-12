"use client";

import Image from "next/image";
import {
  Calendar,
  Clock3,
  Sparkles,
  FileText,
  BadgeCheck,
  Wallet,
} from "lucide-react";

export default function AppointmentSummary({
  service = null,
  appointmentDate = "",
  appointmentTime = "",
  notes = "",
}) {
  const hasService = Boolean(service);

  return (
    <aside
      className="
        sticky
        top-24
        rounded-3xl
        border
        border-neutral-200
        bg-white
        shadow-sm
        overflow-hidden
      "
    >
      {/* Header */}

      <div className="border-b bg-gradient-to-r from-amber-50 to-white px-6 py-5">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-amber-600" />

          <h2 className="font-playfair text-2xl font-semibold text-neutral-900">
            Appointment Summary
          </h2>
        </div>

        <p className="mt-2 text-sm text-neutral-500">
          Your selections update automatically as you complete each step.
        </p>
      </div>

      {/* Service */}

      <div className="p-6">
        {hasService ? (
          <>
            {service.image && (
              <div className="relative mb-5 aspect-[16/10] overflow-hidden rounded-2xl">
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Service
                </p>

                <h3 className="mt-1 text-xl font-semibold text-neutral-900">
                  {service.name}
                </h3>

                {service.description && (
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    {service.description}
                  </p>
                )}
              </div>

              <div className="space-y-4 border-t pt-5">
                {service.duration && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock3 size={18} className="text-amber-600" />

                      <span className="text-neutral-600">Duration</span>
                    </div>

                    <span className="font-semibold">{service.duration}</span>
                  </div>
                )}

                {service.price && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wallet size={18} className="text-amber-600" />

                      <span className="text-neutral-600">Starting Price</span>
                    </div>

                    <span className="font-bold text-lg text-amber-700">
                      ₦{Number(service.price).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
            <BadgeCheck className="mx-auto text-neutral-400" size={34} />

            <h3 className="mt-4 font-semibold text-neutral-700">
              No service selected
            </h3>

            <p className="mt-2 text-sm text-neutral-500">
              Choose a service to begin your booking.
            </p>
          </div>
        )}

        {/* Divider */}

        <div className="my-8 border-t" />

        {/* Appointment */}

        <div className="space-y-5">
          <h3 className="font-semibold text-neutral-900">Appointment</h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-amber-600" />

              <span className="text-neutral-600">Date</span>
            </div>

            <span className="font-medium">{appointmentDate || "--"}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock3 size={18} className="text-amber-600" />

              <span className="text-neutral-600">Time</span>
            </div>

            <span className="font-medium">{appointmentTime || "--"}</span>
          </div>
        </div>

        {/* Notes */}

        <div className="mt-8 rounded-2xl bg-neutral-50 p-5">
          <div className="mb-3 flex items-center gap-2">
            <FileText size={18} className="text-amber-600" />

            <h3 className="font-semibold text-neutral-900">Special Notes</h3>
          </div>

          {notes ? (
            <p className="text-sm leading-6 text-neutral-600 whitespace-pre-wrap">
              {notes}
            </p>
          ) : (
            <p className="text-sm italic text-neutral-400">
              No additional notes provided.
            </p>
          )}
        </div>

        {/* Footer */}

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm leading-6 text-amber-800">
            Your appointment request will be reviewed by our team before it is
            confirmed. Payment instructions will be provided once your booking
            has been approved.
          </p>
        </div>
      </div>
    </aside>
  );
}
