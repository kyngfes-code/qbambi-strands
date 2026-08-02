"use client";

import { FileText } from "lucide-react";

export default function EnrollmentNotesCard({ notes, adminNotes }) {
  return (
    <div className="rounded-3xl border bg-white p-8 shadow-sm">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-[#C6A667]/10 p-3">
          <FileText className="h-5 w-5 text-[#b48a5a]" />
        </div>

        <div>
          <h2 className="text-xl font-bold">Notes</h2>

          <p className="text-sm text-neutral-500">
            Student and internal administrator notes.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border p-5">
          <h3 className="mb-3 font-semibold">Student Notes</h3>

          <p className="whitespace-pre-wrap leading-7 text-neutral-600">
            {notes || "No notes provided."}
          </p>
        </div>

        <div className="rounded-2xl border bg-neutral-50 p-5">
          <h3 className="mb-3 font-semibold">Internal Admin Notes</h3>

          <p className="whitespace-pre-wrap leading-7 text-neutral-600">
            {adminNotes || "No internal notes."}
          </p>
        </div>
      </div>
    </div>
  );
}
