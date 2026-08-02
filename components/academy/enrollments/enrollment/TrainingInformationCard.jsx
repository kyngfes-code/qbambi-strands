"use client";

import { CalendarDays, GraduationCap, Laptop, BookOpen } from "lucide-react";

export default function TrainingInformationCard({ enrollment }) {
  if (!enrollment) return null;

  const learningMode =
    enrollment.learning_mode === "physical"
      ? "Physical Training"
      : enrollment.learning_mode === "online"
        ? "Online Training"
        : "—";

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
        <h2 className="text-xl font-bold">Training Information</h2>

        <p className="mt-1 text-sm text-neutral-500">
          Training preferences selected during enrollment.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Item icon={Laptop} label="Learning Mode" value={learningMode} />

        <Item
          icon={CalendarDays}
          label="Preferred Start Date"
          value={
            enrollment.preferred_start_date
              ? new Date(enrollment.preferred_start_date).toLocaleDateString()
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
            {enrollment.courses.map((course) => (
              <div
                key={course.id}
                className="flex flex-col justify-between gap-4 rounded-xl border p-4 md:flex-row md:items-center"
              >
                <div>
                  <h4 className="font-semibold">{course.course?.title}</h4>

                  <p className="mt-1 text-sm text-neutral-500">
                    {course.duration_months} Month
                    {course.duration_months > 1 ? "s" : ""}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs uppercase text-neutral-500">Tuition</p>

                  <p className="text-lg font-bold text-[#b48a5a]">
                    ₦{Number(course.amount).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
