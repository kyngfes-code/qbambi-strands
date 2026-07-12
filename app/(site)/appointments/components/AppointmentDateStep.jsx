"use client";

import { CalendarDays, Clock3, AlertCircle } from "lucide-react";

export default function AppointmentDateStep({
  appointmentDate,
  appointmentTime,
  onDateChange,
  onTimeChange,
}) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <section className="space-y-8">
      {/* Header */}

      <div>
        <span className="inline-flex rounded-full bg-amber-100 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-amber-700">
          Step 2
        </span>

        <h2 className="mt-4 font-playfair text-4xl font-bold text-neutral-900">
          Choose Your Preferred Date & Time
        </h2>

        <p className="mt-3 max-w-2xl text-lg leading-8 text-neutral-600">
          Select your preferred appointment schedule. We'll review your request
          and confirm availability.
        </p>
      </div>

      {/* Inputs */}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Date */}

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-3">
              <CalendarDays className="text-amber-700" size={22} />
            </div>

            <div>
              <h3 className="font-semibold text-neutral-900">
                Appointment Date
              </h3>

              <p className="text-sm text-neutral-500">
                Select your preferred day.
              </p>
            </div>
          </div>

          <input
            type="date"
            min={today}
            value={appointmentDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="
              w-full
              rounded-2xl
              border
              border-neutral-300
              px-4
              py-4
              text-lg
              outline-none
              transition
              focus:border-amber-500
              focus:ring-4
              focus:ring-amber-100
            "
          />
        </div>

        {/* Time */}

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-3">
              <Clock3 className="text-amber-700" size={22} />
            </div>

            <div>
              <h3 className="font-semibold text-neutral-900">
                Appointment Time
              </h3>

              <p className="text-sm text-neutral-500">
                Choose your preferred time.
              </p>
            </div>
          </div>

          <input
            type="time"
            value={appointmentTime}
            onChange={(e) => onTimeChange(e.target.value)}
            className="
              w-full
              rounded-2xl
              border
              border-neutral-300
              px-4
              py-4
              text-lg
              outline-none
              transition
              focus:border-amber-500
              focus:ring-4
              focus:ring-amber-100
            "
          />
        </div>
      </div>

      {/* Information */}

      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-4">
          <AlertCircle size={22} className="mt-1 shrink-0 text-amber-700" />

          <div>
            <h3 className="font-semibold text-amber-900">
              Booking Information
            </h3>

            <ul className="mt-3 space-y-2 text-sm leading-7 text-amber-800">
              <li>• Your appointment is a request, not an instant booking.</li>
              <li>
                • Our team will confirm availability before approving your
                appointment.
              </li>
              <li>
                • If your chosen slot is unavailable, we'll contact you with the
                closest available time.
              </li>
              <li>
                • You'll receive payment instructions after your appointment has
                been approved.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview */}

      {(appointmentDate || appointmentTime) && (
        <div className="rounded-3xl border border-green-200 bg-green-50 p-6">
          <h3 className="font-semibold text-green-900">Appointment Preview</h3>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-green-700">
                Preferred Date
              </p>

              <p className="mt-1 text-lg font-semibold text-green-900">
                {appointmentDate || "--"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-green-700">
                Preferred Time
              </p>

              <p className="mt-1 text-lg font-semibold text-green-900">
                {appointmentTime || "--"}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
