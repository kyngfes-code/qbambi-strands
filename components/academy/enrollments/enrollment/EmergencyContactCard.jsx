"use client";

import { HeartHandshake, Phone, Users } from "lucide-react";

export default function EmergencyContactCard({ enrollment }) {
  if (!enrollment) return null;

  const Item = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 rounded-xl border p-4">
      <div className="rounded-lg bg-neutral-100 p-2">
        <Icon className="h-4 w-4 text-[#b48a5a]" />
      </div>

      <div className="flex-1">
        <p className="text-xs uppercase tracking-wide text-neutral-500">
          {label}
        </p>

        <p className="mt-1 font-medium">{value || "—"}</p>
      </div>
    </div>
  );

  return (
    <div className="rounded-3xl border bg-white p-8 shadow-sm">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Emergency Contact</h2>

        <p className="mt-1 text-sm text-neutral-500">
          Person to contact during emergencies.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Item
          icon={HeartHandshake}
          label="Contact Name"
          value={enrollment.emergency_contact_name}
        />

        <Item
          icon={Phone}
          label="Phone Number"
          value={enrollment.emergency_contact_phone}
        />

        <Item
          icon={Users}
          label="Relationship"
          value={enrollment.emergency_contact_relationship}
        />
      </div>
    </div>
  );
}
