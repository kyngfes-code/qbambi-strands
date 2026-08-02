"use client";

import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TrainingInformation({ courses = [], pricing }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const {
    learningMode,
    updateLearningMode,
    toggleCourse,
    updateDuration,
    totalFee,
    isSelected,
    getSelectedCourse,
    getAvailableDurations,
  } = pricing;

  return (
    <section className="space-y-8">
      {/* Header */}

      <div>
        <h2 className="text-2xl font-bold text-neutral-900">
          Training Information
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-7 text-neutral-500">
          Select your preferred learning mode and choose one or more courses.
        </p>
      </div>

      {/* Learning Mode */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="preferred_start_date">Preferred Start Date</Label>

          <Input
            id="preferred_start_date"
            type="date"
            className="h-12"
            {...register("preferred_start_date")}
          />

          {errors.preferred_start_date && (
            <p className="text-sm text-red-500">
              {errors.preferred_start_date.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Learning Mode *</Label>

          <select
            {...register("learning_mode")}
            value={learningMode}
            onChange={(e) => updateLearningMode(e.target.value)}
            className="h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none transition focus:border-[#C6A667] focus:ring-2 focus:ring-[#C6A667]/20"
          >
            <option value="">Choose Learning Mode</option>
            <option value="physical">Physical Training</option>
            <option value="online">Online Training</option>
          </select>

          {errors.learning_mode && (
            <p className="text-sm text-red-500">
              {errors.learning_mode.message}
            </p>
          )}
        </div>
      </div>

      {!learningMode && (
        <div className="rounded-2xl border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-700">
          Please choose your preferred learning mode before selecting courses.
        </div>
      )}

      {/* Courses */}

      <div className="space-y-6">
        {courses.map((course) => {
          const selected = isSelected(course.id);

          const selectedCourse = getSelectedCourse(course.id);

          const durations = getAvailableDurations(course.id);

          return (
            <div
              key={course.id}
              className="overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:shadow-lg"
            >
              <div className="p-6 lg:p-8">
                <label className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleCourse(course.id)}
                    className="mt-1 h-5 w-5 shrink-0 accent-[#C6A667]"
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-semibold text-neutral-900">
                      {course.title}
                    </h3>

                    {course.description && (
                      <p className="mt-3 text-sm leading-7 text-neutral-500">
                        {course.description}
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap gap-2">
                      {course.level && (
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
                          {course.level}
                        </span>
                      )}

                      {course.category && (
                        <span className="rounded-full bg-[#C6A667]/10 px-3 py-1 text-xs font-medium text-[#8b6b2f]">
                          {course.category}
                        </span>
                      )}
                    </div>

                    {/* Expanded Section */}

                    {selected && selectedCourse && (
                      <div className="mt-8 border-t border-neutral-200 pt-6">
                        <div className="space-y-6">
                          {/* Duration */}

                          <div className="space-y-2">
                            <Label>Course Duration</Label>

                            <select
                              value={selectedCourse.duration}
                              onChange={(e) =>
                                updateDuration(
                                  course.id,
                                  Number(e.target.value),
                                )
                              }
                              className="h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none transition focus:border-[#C6A667] focus:ring-2 focus:ring-[#C6A667]/20"
                            >
                              {durations.map((duration) => (
                                <option key={duration} value={duration}>
                                  {duration} Month
                                  {duration > 1 ? "s" : ""}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Fee */}

                          <div className="rounded-2xl bg-[#C6A667]/10 p-5">
                            <p className="text-xs uppercase tracking-wide text-neutral-500">
                              Course Fee
                            </p>

                            <h3 className="mt-3 text-3xl font-bold text-[#b48a5a]">
                              ₦
                              {Number(
                                selectedCourse.amount ??
                                  selectedCourse.price ??
                                  0,
                              ).toLocaleString()}
                            </h3>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}

      <div className="rounded-3xl border bg-neutral-100 p-6 sm:p-8">
        <p className="text-sm uppercase tracking-wide text-neutral-500">
          Total Tuition
        </p>

        <h2 className="mt-3 text-4xl font-bold text-[#b48a5a]">
          ₦{totalFee.toLocaleString()}
        </h2>
      </div>
    </section>
  );
}
