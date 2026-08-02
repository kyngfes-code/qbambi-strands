"use client";

import { Mail, Phone, User, CalendarDays, MessageCircle } from "lucide-react";

export default function StudentInformationCard({ enrollment }) {
  if (!enrollment) return null;

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 rounded-xl border p-4">
      <div className="mt-0.5 rounded-lg bg-neutral-100 p-2">
        <Icon className="h-4 w-4 text-[#b48a5a]" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wide text-neutral-500">
          {label}
        </p>

        <p className="mt-1 break-words font-medium text-neutral-900">
          {value || "—"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="rounded-3xl border bg-white p-8 shadow-sm">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Student Information</h2>

        <p className="mt-1 text-sm text-neutral-500">
          Personal information submitted during enrollment.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <InfoRow
          icon={User}
          label="Full Name"
          value={`${enrollment.first_name} ${enrollment.last_name}${
            enrollment.other_name ? ` ${enrollment.other_name}` : ""
          }`}
        />

        <InfoRow icon={User} label="Gender" value={enrollment.gender} />

        <InfoRow
          icon={CalendarDays}
          label="Date of Birth"
          value={
            enrollment.date_of_birth
              ? new Date(enrollment.date_of_birth).toLocaleDateString()
              : null
          }
        />

        <InfoRow icon={Mail} label="Email Address" value={enrollment.email} />

        <InfoRow icon={Phone} label="Phone Number" value={enrollment.phone} />

        <InfoRow
          icon={MessageCircle}
          label="WhatsApp Number"
          value={enrollment.whatsapp}
        />
      </div>
    </div>
  );
}
