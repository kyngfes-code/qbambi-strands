"use client";

import { useState } from "react";
import { CheckCheckIcon, ChevronDown } from "lucide-react";

export default function AcademyProgramsAccordion({ courses = [] }) {
  const [openCourse, setOpenCourse] = useState(null);

  const toggleCourse = (id) => {
    setOpenCourse((prev) => (prev === id ? null : id));
  };

  return (
    <div className="mt-10">
      <h3 className="mb-5 text-xl font-bold text-neutral-900">
        Available Training Programs
      </h3>

      <div className="space-y-4">
        {courses.map((course) => {
          const open = openCourse === course.id;

          return (
            <div
              key={course.id}
              className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 ${
                open
                  ? "border-[#C6A667] shadow-lg"
                  : "border-[#C6A667]/15 hover:shadow-md"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleCourse(course.id)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
              >
                <div className="flex items-start gap-3">
                  <CheckCheckIcon className="mt-1 h-5 w-5 shrink-0 text-[#C6A667]" />

                  <div>
                    <h4 className="font-semibold text-neutral-900">
                      {course.title}
                    </h4>

                    <p className="mt-1 text-sm text-neutral-500">
                      {course.level}
                    </p>
                  </div>
                </div>

                <ChevronDown
                  className={`h-5 w-5 text-[#C6A667] transition-transform duration-300 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  open
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-[#C6A667]/10 px-5 pb-5 pt-4">
                    <p className="leading-7 text-neutral-600">
                      {course.description}
                    </p>

                    {course.pricing?.length > 0 && (
                      <div className="mt-5">
                        <h5 className="mb-3 font-medium text-neutral-900">
                          Available Learning Modes
                        </h5>

                        <div className="flex flex-wrap gap-2">
                          {[
                            ...new Set(
                              course.pricing.map((p) => p.learning_mode),
                            ),
                          ].map((mode) => (
                            <span
                              key={mode}
                              className="rounded-full bg-[#C6A667]/10 px-3 py-1 text-sm font-medium capitalize text-[#8c6239]"
                            >
                              {mode}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
