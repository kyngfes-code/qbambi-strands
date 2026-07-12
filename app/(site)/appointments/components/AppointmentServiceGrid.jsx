"use client";

import AppointmentServiceCard from "./AppointmentServiceCard";

export default function AppointmentServiceGrid({
  services = [],
  selectedService = null,
  onSelect,
  title = "Choose Your Service",
  description = "Select the beauty service you'd like to book. You can change this later before submitting your appointment request.",
}) {
  if (!services.length) {
    return (
      <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center">
        <h3 className="text-lg font-semibold text-neutral-900">
          No Services Available
        </h3>

        <p className="mt-2 text-neutral-500">
          Services haven't been added yet. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      {/* Header */}

      <div className="max-w-3xl">
        <span className="inline-flex rounded-full bg-amber-100 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-amber-700">
          Step 1
        </span>

        <h2 className="mt-4 font-playfair text-4xl font-bold text-neutral-900">
          {title}
        </h2>

        <p className="mt-3 text-lg leading-8 text-neutral-600">{description}</p>
      </div>

      {/* Services */}

      <div
        className="
          grid
          gap-6
          sm:grid-cols-2
          xl:grid-cols-3
        "
      >
        {services.map((service) => (
          <AppointmentServiceCard
            key={service.id}
            service={service}
            selected={selectedService?.id === service.id}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* Selected Summary */}

      {selectedService && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
                Selected Service
              </p>

              <h3 className="mt-2 text-2xl font-semibold text-neutral-900">
                {selectedService.name}
              </h3>

              {selectedService.description && (
                <p className="mt-2 text-neutral-600">
                  {selectedService.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-6">
              {selectedService.duration && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-400">
                    Duration
                  </p>

                  <p className="mt-1 font-semibold text-neutral-900">
                    {selectedService.duration}
                  </p>
                </div>
              )}

              {selectedService.price && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-400">
                    Starting From
                  </p>

                  <p className="mt-1 text-2xl font-bold text-amber-700">
                    ₦{Number(selectedService.price).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
