"use client";

import { Pencil, Trash2, ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import CourseStatusBadge from "./CourseStatusBadge";

export default function CourseTable({
  courses = [],
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  if (!courses.length) {
    return (
      <div className="rounded-2xl border bg-white p-12 text-center">
        <h3 className="text-lg font-semibold text-neutral-800">
          No courses found
        </h3>

        <p className="mt-2 text-sm text-neutral-500">
          Create your first academy course to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-2xl border bg-white shadow-sm lg:block">
        <table className="w-full">
          <thead className="bg-neutral-50">
            <tr className="text-left text-sm font-semibold text-neutral-600">
              <th className="px-6 py-4">Course</th>

              <th className="px-6 py-4">Level</th>

              <th className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Order
                </div>
              </th>

              <th className="px-6 py-4">Status</th>

              <th className="px-6 py-4">Created</th>

              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {courses.map((course) => (
              <tr
                key={course.id}
                className="border-t transition hover:bg-neutral-50"
              >
                <td className="px-6 py-5">
                  <div>
                    <h4 className="font-semibold text-neutral-900">
                      {course.title}
                    </h4>

                    {course.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
                        {course.description}
                      </p>
                    )}
                  </div>
                </td>

                <td className="px-6 py-5">{course.level || "-"}</td>

                <td className="px-6 py-5 font-medium">{course.sort_order}</td>

                <td className="px-6 py-5">
                  <CourseStatusBadge active={course.active} />
                </td>

                <td className="px-6 py-5 text-sm text-neutral-500">
                  {course.created_at
                    ? new Date(course.created_at).toLocaleDateString()
                    : "-"}
                </td>

                <td className="px-6 py-5">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => onEdit(course)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={course.active ? "secondary" : "default"}
                      onClick={() => onToggleStatus(course)}
                    >
                      {course.active ? "Deactivate" : "Activate"}
                    </Button>

                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => onDelete(course)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="space-y-5 lg:hidden">
        {courses.map((course) => (
          <div
            key={course.id}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{course.title}</h3>

                {course.description && (
                  <p className="mt-1 text-sm text-neutral-500">
                    {course.description}
                  </p>
                )}
              </div>

              <div className="px-6 py-5">
                <CourseStatusBadge active={course.active} />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-neutral-400">Level</p>

                <p className="font-medium">{course.level || "-"}</p>
              </div>

              <div>
                <p className="text-neutral-400">Order</p>

                <p className="font-medium">{course.sort_order}</p>
              </div>

              <div>
                <p className="text-neutral-400">Created</p>

                <p className="font-medium">
                  {course.created_at
                    ? new Date(course.created_at).toLocaleDateString()
                    : "-"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(course)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant={course.active ? "secondary" : "default"}
                size="sm"
                onClick={() => onToggleStatus(course)}
              >
                {course.active ? "Deactivate" : "Activate"}
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(course)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
