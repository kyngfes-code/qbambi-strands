"use client";

import { FileText, Lightbulb, CheckCircle2 } from "lucide-react";

const MAX_LENGTH = 500;

export default function AppointmentNotesStep({ notes, onNotesChange }) {
  const remaining = MAX_LENGTH - notes.length;

  return (
    <section className="space-y-8">
      {/* Header */}

      <div>
        <span className="inline-flex rounded-full bg-amber-100 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-amber-700">
          Step 3
        </span>

        <h2 className="mt-4 font-playfair text-4xl font-bold text-neutral-900">
          Tell Us More
        </h2>

        <p className="mt-3 max-w-2xl text-lg leading-8 text-neutral-600">
          Help us prepare for your appointment. This step is completely
          optional, but additional information allows our team to serve you
          better.
        </p>
      </div>

      {/* Textarea */}

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-amber-100 p-3">
            <FileText size={22} className="text-amber-700" />
          </div>

          <div>
            <h3 className="font-semibold text-neutral-900">Additional Notes</h3>

            <p className="text-sm text-neutral-500">
              Allergies, preferred stylist, inspiration, special requests, or
              anything else you'd like us to know.
            </p>
          </div>
        </div>

        <textarea
          rows={8}
          maxLength={MAX_LENGTH}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Example: I'd like a natural bridal look, I have sensitive skin, or I'd prefer morning appointments..."
          className="
            w-full
            resize-none
            rounded-2xl
            border
            border-neutral-300
            px-5
            py-4
            text-base
            leading-7
            outline-none
            transition
            focus:border-amber-500
            focus:ring-4
            focus:ring-amber-100
          "
        />

        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-neutral-500">Optional</p>

          <p
            className={`text-sm font-medium ${
              remaining < 50 ? "text-red-500" : "text-neutral-500"
            }`}
          >
            {remaining} characters remaining
          </p>
        </div>
      </div>

      {/* Tips */}

      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-4">
          <Lightbulb size={22} className="mt-1 shrink-0 text-amber-700" />

          <div>
            <h3 className="font-semibold text-amber-900">
              Helpful Information to Include
            </h3>

            <ul className="mt-4 space-y-3 text-sm leading-7 text-amber-800">
              <li>• Your preferred stylist (if you have one)</li>

              <li>• Hair length or current hairstyle</li>

              <li>• Makeup inspiration or desired look</li>

              <li>• Allergies or sensitive skin concerns</li>

              <li>
                • Whether this appointment is for a wedding, birthday,
                graduation or another event
              </li>

              <li>• Any accessibility or special accommodation requests</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview */}

      {notes.trim() && (
        <div className="rounded-3xl border border-green-200 bg-green-50 p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={22} className="text-green-700" />

            <h3 className="font-semibold text-green-900">Notes Preview</h3>
          </div>

          <p className="mt-4 whitespace-pre-wrap leading-7 text-green-900">
            {notes}
          </p>
        </div>
      )}
    </section>
  );
}
