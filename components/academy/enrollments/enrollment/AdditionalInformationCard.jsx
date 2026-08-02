"use client";

import { Briefcase, GraduationCap, Sparkles, FileText } from "lucide-react";

export default function AdditionalInformationCard({ enrollment }) {
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
        <h2 className="text-xl font-bold">Additional Information</h2>

        <p className="mt-1 text-sm text-neutral-500">
          Extra information provided by the student.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Item
          icon={Briefcase}
          label="Occupation"
          value={enrollment.occupation}
        />

        <Item
          icon={GraduationCap}
          label="Education Level"
          value={enrollment.education_level}
        />

        <Item
          icon={Sparkles}
          label="Referral Source"
          value={enrollment.referral_source}
        />
      </div>

      <div className="mt-6 rounded-2xl border p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-neutral-100 p-2">
            <FileText className="h-4 w-4 text-[#b48a5a]" />
          </div>

          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Notes
            </p>

            <p className="mt-2 whitespace-pre-wrap leading-7 text-neutral-700">
              {enrollment.notes || "No additional notes provided."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
