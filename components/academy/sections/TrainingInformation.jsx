"use client";

import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TrainingInformation({ courses = [], pricing }) {
  const {
    setValue,
    register,
    formState: { errors },
  } = useFormContext();

  const {
    learningMode = "",
    learningModeFilter = "all",
    setLearningModeFilter,
    visibleCourses = [],
    updateLearningMode,
    toggleCourse,
    updateDuration,
    isSelected,
    getSelectedCourse,
    getAvailableDurations,
  } = pricing;

  // ======================================================
  // CURRENCY
  // ======================================================

  const currencySymbols = {
    NGN: "₦",
    USD: "$",
    GBP: "£",
    EUR: "€",
  };

  const currency = pricing?.currency ?? "NGN";
  const symbol = currencySymbols[currency] ?? currency;

  // ======================================================
  // ACTUAL ENROLLMENT MODE
  // ======================================================

  function handleLearningModeChange(event) {
    const mode = event.target.value;

    updateLearningMode(mode);

    setValue("learning_mode", mode, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  // ======================================================
  // UI-ONLY COURSE FILTER
  // ======================================================

  function handleFilterChange(event) {
    setLearningModeFilter(event.target.value);
  }

  return (
    <section className="space-y-8">
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div>
        <h2 className="text-2xl font-bold text-neutral-900">
          Training Information
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-7 text-neutral-500">
          Select your actual training mode and choose one or more courses.
        </p>
      </div>

      {/* ================================================== */}
      {/* DATE + ACTUAL LEARNING MODE */}
      {/* ================================================== */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Preferred Start Date */}

        <div className="space-y-2">
          <Label htmlFor="preferred_start_date">Preferred Start Date</Label>

          <Input
            id="preferred_start_date"
            type="date"
            min={new Date().toISOString().split("T")[0]}
            className="h-12"
            {...register("preferred_start_date")}
          />

          {errors.preferred_start_date && (
            <p className="text-sm text-red-500">
              {errors.preferred_start_date.message}
            </p>
          )}
        </div>

        {/* Actual Enrollment Mode */}

        <div className="space-y-2">
          <Label htmlFor="learning_mode">Learning Mode *</Label>

          <select
            id="learning_mode"
            value={learningMode ?? ""}
            onChange={handleLearningModeChange}
            className="h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none transition focus:border-[#C6A667] focus:ring-2 focus:ring-[#C6A667]/20"
          >
            <option value="">Choose Learning Mode</option>

            <option value="physical">Physical Training</option>

            <option value="online">Online Training</option>

            <option value="hybrid">Hybrid Training</option>
          </select>

          <input type="hidden" {...register("learning_mode")} />

          {errors.learning_mode && (
            <p className="text-sm text-red-500">
              {errors.learning_mode.message}
            </p>
          )}
        </div>
      </div>

      {/* ================================================== */}
      {/* COURSE FILTER */}
      {/* ================================================== */}

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
        <div className="space-y-2">
          <Label htmlFor="learning_mode_filter">Browse Courses By Mode</Label>

          <select
            id="learning_mode_filter"
            value={learningModeFilter ?? "all"}
            onChange={handleFilterChange}
            className="h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none transition focus:border-[#C6A667] focus:ring-2 focus:ring-[#C6A667]/20"
          >
            <option value="all">All Training Modes</option>

            <option value="physical">Physical Training</option>

            <option value="online">Online Training</option>

            <option value="hybrid">Hybrid Training</option>
          </select>

          <p className="text-xs leading-5 text-neutral-500">
            This filter only controls which courses are displayed. Your
            enrollment mode is selected above.
          </p>
        </div>
      </div>

      {/* ================================================== */}
      {/* MODE REQUIRED */}
      {/* ================================================== */}

      {!learningMode && (
        <div className="rounded-2xl border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-700">
          Please choose your actual learning mode before selecting courses.
        </div>
      )}

      {/* ================================================== */}
      {/* COURSES */}
      {/* ================================================== */}

      <div className="space-y-6">
        {visibleCourses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
            <p className="font-medium text-neutral-700">No courses available</p>

            <p className="mt-2 text-sm text-neutral-500">
              There are no courses available for the selected training mode.
            </p>
          </div>
        ) : (
          visibleCourses.map((course) => {
            // IMPORTANT:
            // Always convert this to a real boolean.
            const selected = Boolean(isSelected(course.id));

            const selectedCourse = selected
              ? getSelectedCourse(course.id)
              : null;

            const durations = learningMode
              ? getAvailableDurations(course.id, learningMode)
              : [];

            return (
              <div
                key={course.id}
                className="overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:shadow-lg"
              >
                <div className="p-6 lg:p-8">
                  <label className="flex items-start gap-4">
                    {/* ================================================= */}
                    {/* COURSE CHECKBOX */}
                    {/* ================================================= */}

                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={!learningMode}
                      onChange={() => toggleCourse(course.id)}
                      className="mt-1 h-5 w-5 shrink-0 accent-[#C6A667] disabled:cursor-not-allowed disabled:opacity-40"
                    />

                    <div className="min-w-0 flex-1">
                      {/* ================================================= */}
                      {/* COURSE TITLE */}
                      {/* ================================================= */}

                      <h3 className="text-xl font-semibold text-neutral-900">
                        {course.title}
                      </h3>

                      {course.description && (
                        <p className="mt-3 text-sm leading-7 text-neutral-500">
                          {course.description}
                        </p>
                      )}

                      {/* ================================================= */}
                      {/* COURSE MODE BADGES */}
                      {/* ================================================= */}

                      <div className="mt-5 flex flex-wrap gap-2">
                        {course.level && (
                          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
                            {course.level}
                          </span>
                        )}

                        {course.pricing?.some(
                          (p) =>
                            p.active !== false &&
                            p.learning_mode === "physical",
                        ) && (
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                            Physical
                          </span>
                        )}

                        {course.pricing?.some(
                          (p) =>
                            p.active !== false && p.learning_mode === "online",
                        ) && (
                          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                            Online
                          </span>
                        )}

                        {course.pricing?.some(
                          (p) =>
                            p.active !== false && p.learning_mode === "hybrid",
                        ) && (
                          <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                            Hybrid
                          </span>
                        )}
                      </div>

                      {/* ================================================= */}
                      {/* SELECTED COURSE */}
                      {/* ================================================= */}

                      {selected && (
                        <div className="mt-8 border-t border-neutral-200 pt-6">
                          <div className="space-y-6">
                            {/* ========================================= */}
                            {/* DURATION */}
                            {/* ========================================= */}

                            <div className="space-y-2">
                              <Label htmlFor={`course-duration-${course.id}`}>
                                Course Duration
                              </Label>

                              <select
                                id={`course-duration-${course.id}`}
                                value={selectedCourse?.duration ?? ""}
                                disabled={!durations.length}
                                onChange={(event) => {
                                  const value = event.target.value;

                                  if (!value) return;

                                  updateDuration(course.id, Number(value));
                                }}
                                className="h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none transition focus:border-[#C6A667] focus:ring-2 focus:ring-[#C6A667]/20 disabled:cursor-not-allowed disabled:bg-neutral-100"
                              >
                                <option value="">
                                  {durations.length
                                    ? "Choose Duration"
                                    : "No duration available"}
                                </option>

                                {durations.map((duration) => (
                                  <option key={duration} value={duration}>
                                    {duration} Month
                                    {duration > 1 ? "s" : ""}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* ========================================= */}
                            {/* FEE */}
                            {/* ========================================= */}

                            <div className="rounded-2xl bg-[#C6A667]/10 p-5">
                              <p className="text-xs uppercase tracking-wide text-neutral-500">
                                Course Fee
                              </p>

                              <h3 className="mt-3 text-3xl font-bold text-[#b48a5a]">
                                {symbol}
                                {Number(
                                  selectedCourse?.price ?? 0,
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
          })
        )}
      </div>
    </section>
  );
}
