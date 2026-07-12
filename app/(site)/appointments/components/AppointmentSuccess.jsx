"use client";

import Link from "next/link";
import {
  CheckCircle2,
  CalendarDays,
  Clock3,
  Mail,
  ArrowRight,
  Home,
} from "lucide-react";

export default function AppointmentSuccess({
  service,
  appointmentDate,
  appointmentTime,
}) {
  return (
    <section className="mx-auto flex max-w-4xl flex-col items-center text-center">
      {/* Success Icon */}

      <div className="flex h-28 w-28 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 size={64} className="text-green-600" />
      </div>

      {/* Heading */}

      <h1 className="mt-8 font-playfair text-5xl font-bold text-neutral-900">
        Appointment Request Submitted
      </h1>

      <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
        Thank you for choosing <strong>Qbambi Strands</strong>. Your appointment
        request has been received successfully and is now awaiting review by our
        team.
      </p>

      {/* Booking Summary */}

      <div className="mt-12 w-full rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h2 className="text-left text-xl font-semibold text-neutral-900">
          Booking Summary
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {/* Service */}

          <div className="rounded-2xl bg-neutral-50 p-5 text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Service
            </p>

            <p className="mt-2 text-lg font-semibold text-neutral-900">
              {service?.name || "--"}
            </p>
          </div>

          {/* Date */}

          <div className="rounded-2xl bg-neutral-50 p-5 text-left">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-amber-600" />

              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                Date
              </p>
            </div>

            <p className="mt-2 text-lg font-semibold text-neutral-900">
              {appointmentDate || "--"}
            </p>
          </div>

          {/* Time */}

          <div className="rounded-2xl bg-neutral-50 p-5 text-left">
            <div className="flex items-center gap-2">
              <Clock3 size={18} className="text-amber-600" />

              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                Time
              </p>
            </div>

            <p className="mt-2 text-lg font-semibold text-neutral-900">
              {appointmentTime || "--"}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}

      <div className="mt-12 w-full rounded-3xl border border-amber-200 bg-amber-50 p-8 text-left">
        <h2 className="text-xl font-semibold text-amber-900">
          What Happens Next?
        </h2>

        <div className="mt-8 space-y-6">
          <div className="flex gap-4">
            <div className="mt-1 h-4 w-4 rounded-full bg-green-500" />

            <div>
              <h3 className="font-semibold text-neutral-900">
                Appointment Request Received
              </h3>

              <p className="mt-1 text-sm leading-6 text-neutral-600">
                Your booking has been successfully submitted.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="mt-1 h-4 w-4 rounded-full bg-amber-500" />

            <div>
              <h3 className="font-semibold text-neutral-900">Team Review</h3>

              <p className="mt-1 text-sm leading-6 text-neutral-600">
                Our staff will verify availability and review your booking
                request.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="mt-1 h-4 w-4 rounded-full bg-neutral-300" />

            <div>
              <h3 className="font-semibold text-neutral-900">
                Confirmation & Payment
              </h3>

              <p className="mt-1 text-sm leading-6 text-neutral-600">
                Once approved, you'll receive your appointment confirmation and
                payment instructions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reminder */}

      <div className="mt-10 flex w-full items-start gap-4 rounded-3xl border border-blue-200 bg-blue-50 p-6 text-left">
        <Mail size={24} className="mt-1 shrink-0 text-blue-600" />

        <div>
          <h3 className="font-semibold text-blue-900">Stay Updated</h3>

          <p className="mt-2 leading-7 text-blue-800">
            Please keep an eye on your account dashboard and email. We'll notify
            you once your appointment has been reviewed.
          </p>
        </div>
      </div>

      {/* Actions */}

      <div className="mt-12 flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
        <Link
          href="/account/appointments"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-8 py-4 font-semibold text-white transition hover:bg-neutral-800"
        >
          View My Appointments
          <ArrowRight size={18} />
        </Link>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-300 bg-white px-8 py-4 font-semibold transition hover:bg-neutral-100"
        >
          <Home size={18} />
          Return Home
        </Link>
      </div>

      {/* Footer */}

      <p className="mt-10 text-sm text-neutral-500">
        Thank you for choosing Qbambi Strands. We look forward to serving you.
      </p>
    </section>
  );
}
