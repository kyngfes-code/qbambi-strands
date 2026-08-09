"use client";

import { CalendarDays, GraduationCap, Laptop, BookOpen } from "lucide-react";

//////////////////////////////////////////////////////////////

function formatCurrency(amount = 0, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

//////////////////////////////////////////////////////////////

export default function TrainingInformationCard({ enrollment }) {
  if (!enrollment) return null;

  ////////////////////////////////////////////////////////////
  // Learning Mode
  ////////////////////////////////////////////////////////////

  const learningMode =
    enrollment.learning_mode === "physical"
      ? "Physical Training"
      : enrollment.learning_mode === "online"
        ? "Online Training"
        : "—";

  ////////////////////////////////////////////////////////////
  // Item
  ////////////////////////////////////////////////////////////

  const Item = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-neutral-100 p-3">
        <Icon className="h-5 w-5 text-neutral-600" />
      </div>

      <div className="flex-1">
        <p className="text-xs uppercase tracking-wide text-neutral-500">
          {label}
        </p>

        <p className="mt-1 font-medium text-neutral-900">{value || "—"}</p>
      </div>
    </div>
  );

  ////////////////////////////////////////////////////////////
  // Render
  ////////////////////////////////////////////////////////////

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900">
          Training Information
        </h2>

        <p className="mt-1 text-sm text-neutral-500">
          Training preferences selected during enrollment.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <Item icon={Laptop} label="Learning Mode" value={learningMode} />

        <Item
          icon={CalendarDays}
          label="Preferred Start Date"
          value={
            enrollment.preferred_start_date
              ? new Date(enrollment.preferred_start_date).toLocaleDateString(
                  "en-NG",
                )
              : null
          }
        />

        <Item
          icon={GraduationCap}
          label="Enrollment Status"
          value={enrollment.status}
        />
      </div>

      <div className="mt-6 rounded-2xl border p-6">
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#b48a5a]" />

          <h3 className="font-semibold">Selected Courses</h3>
        </div>

        {!enrollment.courses?.length ? (
          <p className="text-sm text-neutral-500">No courses attached.</p>
        ) : (
          <div className="space-y-4">
            {enrollment.courses.map((course) => {
              const pricing = course.pricing;

              const tuition = course.amount ?? pricing?.price ?? 0;

              const currency = pricing?.currency || "NGN";

              const duration =
                course.duration_months ?? pricing?.duration_months;

              return (
                <div
                  key={course.id}
                  className="flex flex-col justify-between gap-4 rounded-xl border p-4 md:flex-row md:items-center"
                >
                  <div>
                    <h4 className="font-semibold">
                      {course.course?.title || "—"}
                    </h4>

                    <p className="mt-1 text-sm text-neutral-500">
                      {duration
                        ? `${duration} Month${Number(duration) > 1 ? "s" : ""}`
                        : "—"}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-xs uppercase text-neutral-500">
                      Tuition
                    </p>

                    <p className="text-lg font-bold text-[#b48a5a]">
                      {formatCurrency(tuition, currency)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
