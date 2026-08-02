"use client";

import { Globe, MapPin, Building2, Home, Mailbox } from "lucide-react";

export default function AddressCard({ enrollment }) {
  if (!enrollment) return null;

  const Item = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 rounded-xl border p-4">
      <div className="mt-0.5 rounded-lg bg-neutral-100 p-2">
        <Icon className="h-4 w-4 text-[#b48a5a]" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wide text-neutral-500">
          {label}
        </p>

        <p className="mt-1 break-words font-medium">{value || "—"}</p>
      </div>
    </div>
  );

  return (
    <div className="rounded-3xl border bg-white p-8 shadow-sm">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Address Information</h2>

        <p className="mt-1 text-sm text-neutral-500">
          Residential address supplied by the applicant.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Item icon={Globe} label="Country" value={enrollment.country} />

        <Item icon={Building2} label="State" value={enrollment.state} />

        <Item icon={MapPin} label="City" value={enrollment.city} />

        <Item
          icon={Mailbox}
          label="Postal Code"
          value={enrollment.postal_code}
        />
      </div>

      <div className="mt-5 rounded-2xl border p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-neutral-100 p-2">
            <Home className="h-4 w-4 text-[#b48a5a]" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Street Address
            </p>

            <p className="mt-2 leading-7 font-medium">
              {enrollment.street_address || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
