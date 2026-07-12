"use client";

import {
  CalendarDays,
  Clock3,
  Sparkles,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function AppointmentReviewStep({
  service,
  appointmentDate,
  appointmentTime,
  notes,
}) {
  return (
    <section className="space-y-8">
      {/* Header */}

      <div>
        <span className="inline-flex rounded-full bg-amber-100 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-amber-700">
          Final Step
        </span>

        <h2 className="mt-4 font-playfair text-4xl font-bold text-neutral-900">
          Review Your Appointment
        </h2>

        <p className="mt-3 max-w-3xl text-lg leading-8 text-neutral-600">
          Please review everything carefully before submitting your booking
          request. Once submitted, our team will review your request and contact
          you to confirm availability.
        </p>
      </div>

      {/* Summary */}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Service */}

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-3">
              <Sparkles size={22} className="text-amber-700" />
            </div>

            <h3 className="text-xl font-semibold">Selected Service</h3>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Service
              </p>

              <p className="mt-1 text-xl font-semibold text-neutral-900">
                {service?.name || "Not selected"}
              </p>
            </div>

            {service?.description && (
              <p className="leading-7 text-neutral-600">
                {service.description}
              </p>
            )}

            {service?.duration && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Duration</span>

                <span className="font-medium">{service.duration}</span>
              </div>
            )}

            {service?.price && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Starting Price</span>

                <span className="font-bold text-lg text-amber-700">
                  ₦{Number(service.price).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Schedule */}

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-3">
              <CalendarDays size={22} className="text-amber-700" />
            </div>

            <h3 className="text-xl font-semibold">Appointment Schedule</h3>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarDays size={18} className="text-amber-700" />

                <span>Date</span>
              </div>

              <span className="font-medium">{appointmentDate}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock3 size={18} className="text-amber-700" />

                <span>Time</span>
              </div>

              <span className="font-medium">{appointmentTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-amber-100 p-3">
            <FileText size={22} className="text-amber-700" />
          </div>

          <h3 className="text-xl font-semibold">Additional Notes</h3>
        </div>

        {notes ? (
          <p className="whitespace-pre-wrap leading-7 text-neutral-700">
            {notes}
          </p>
        ) : (
          <p className="italic text-neutral-500">
            No additional notes were provided.
          </p>
        )}
      </div>

      {/* What happens next */}

      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-4">
          <AlertCircle size={24} className="mt-1 shrink-0 text-amber-700" />

          <div>
            <h3 className="font-semibold text-amber-900">What Happens Next?</h3>

            <ul className="mt-4 space-y-3 text-sm leading-7 text-amber-800">
              <li>• Your booking request will be submitted.</li>

              <li>• Our team will review your preferred schedule.</li>

              <li>• You'll receive confirmation if your slot is available.</li>

              <li>• Payment instructions will be provided after approval.</li>

              <li>
                • If your selected time isn't available, we'll contact you with
                alternatives.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Confirmation */}

      <div className="rounded-3xl border border-green-200 bg-green-50 p-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={24} className="text-green-700" />

          <div>
            <h3 className="font-semibold text-green-900">Ready to Submit</h3>

            <p className="mt-1 text-green-800">
              Everything looks good. Click <strong>Submit Appointment</strong>{" "}
              to send your booking request.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
