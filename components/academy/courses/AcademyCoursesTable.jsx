"use client";

import Link from "next/link";
import {
  Archive,
  ArrowDown,
  ArrowUp,
  BookOpen,
  Edit,
  ExternalLink,
  Globe,
  MoreHorizontal,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AcademyCoursesTable({
  courses = [],
  loading = false,
  onEdit,
  onToggleStatus,
  onSortOrderChange,
}) {
  ////////////////////////////////////////////////////////////
  // LOADING
  ////////////////////////////////////////////////////////////

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <div
              key={index}
              className="h-14 animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      </div>
    );
  }

  ////////////////////////////////////////////////////////////
  // EMPTY
  ////////////////////////////////////////////////////////////

  if (!courses.length) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <BookOpen className="h-6 w-6 text-muted-foreground" />
        </div>

        <h3 className="mt-4 text-lg font-semibold">No courses found</h3>

        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          There are no academy courses matching the current search or filter.
        </p>
      </div>
    );
  }

  ////////////////////////////////////////////////////////////
  // STATUS
  ////////////////////////////////////////////////////////////

  function getStatusClasses(status) {
    switch (status) {
      case "published":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";

      case "archived":
        return "bg-neutral-100 text-neutral-600 border-neutral-200";

      case "draft":
      default:
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
  }

  ////////////////////////////////////////////////////////////
  // FORMAT DURATION
  ////////////////////////////////////////////////////////////

  function formatDuration(minutes) {
    if (
      minutes === null ||
      minutes === undefined ||
      Number.isNaN(Number(minutes))
    ) {
      return "—";
    }

    const value = Number(minutes);

    if (value < 60) {
      return `${value} min`;
    }

    const hours = Math.floor(value / 60);

    const remaining = value % 60;

    if (!remaining) {
      return `${hours} hr`;
    }

    return `${hours} hr ${remaining} min`;
  }

  ////////////////////////////////////////////////////////////
  // SORT ORDER
  ////////////////////////////////////////////////////////////

  async function changeOrder(course, direction) {
    const current = Number(course.sort_order) || 0;

    const next = direction === "up" ? Math.max(0, current - 1) : current + 1;

    if (next === current) {
      return;
    }

    await onSortOrderChange(course, next);
  }

  ////////////////////////////////////////////////////////////
  // DESKTOP TABLE
  ////////////////////////////////////////////////////////////

  return (
    <div className="w-full">
      {/* ================================================== */}
      {/* MOBILE */}
      {/* ================================================== */}

      <div className="divide-y md:hidden">
        {courses.map((course) => (
          <div key={course.id} className="space-y-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-semibold">{course.title}</h3>

                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusClasses(
                      course.status,
                    )}`}
                  >
                    {course.status}
                  </span>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {course.course_code}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(course)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Course
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href={`/admin/academy/courses/${course.id}/content`}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Manage Course
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {course.status !== "published" && (
                    <DropdownMenuItem onClick={() => onToggleStatus(course)}>
                      <Globe className="mr-2 h-4 w-4" />
                      Publish Course
                    </DropdownMenuItem>
                  )}

                  {course.status === "published" && (
                    <DropdownMenuItem onClick={() => onToggleStatus(course)}>
                      <Archive className="mr-2 h-4 w-4" />
                      Archive Course
                    </DropdownMenuItem>
                  )}

                  {course.status === "archived" && (
                    <DropdownMenuItem onClick={() => onToggleStatus(course)}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Restore Course
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>

                <p className="font-medium">
                  {formatDuration(course.duration_minutes)}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Order</p>

                <p className="font-medium">{course.sort_order ?? 0}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" className="flex-1">
                <Link href={`/admin/academy/courses/${course.id}/content`}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Manage Course
                </Link>
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onEdit(course)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ================================================== */}
      {/* DESKTOP */}
      {/* ================================================== */}

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="w-24 px-4 py-3 text-left font-medium">Order</th>

              <th className="px-4 py-3 text-left font-medium">Course</th>

              <th className="px-4 py-3 text-left font-medium">Code</th>

              <th className="px-4 py-3 text-left font-medium">Duration</th>

              <th className="px-4 py-3 text-left font-medium">Status</th>

              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {courses.map((course) => (
              <tr
                key={course.id}
                className="transition-colors hover:bg-muted/20"
              >
                {/* ORDER */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    <span className="w-8 text-center font-medium">
                      {course.sort_order ?? 0}
                    </span>

                    <div className="flex flex-col">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => changeOrder(course, "up")}
                        disabled={Number(course.sort_order) <= 0}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => changeOrder(course, "down")}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </td>

                {/* COURSE */}
                <td className="px-4 py-4">
                  <div className="min-w-[220px]">
                    <Link
                      href={`/admin/academy/courses/${course.id}/content`}
                      className="font-semibold hover:underline"
                    >
                      {course.title}
                    </Link>

                    {course.description && (
                      <p className="mt-1 line-clamp-2 max-w-md text-xs text-muted-foreground">
                        {course.description}
                      </p>
                    )}
                  </div>
                </td>

                {/* CODE */}
                <td className="px-4 py-4">
                  <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs">
                    {course.course_code}
                  </span>
                </td>

                {/* DURATION */}
                <td className="px-4 py-4">
                  {formatDuration(course.duration_minutes)}
                </td>

                {/* STATUS */}
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getStatusClasses(
                      course.status,
                    )}`}
                  >
                    {course.status}
                  </span>
                </td>

                {/* ACTIONS */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button asChild size="sm">
                      <Link
                        href={`/admin/academy/courses/${course.id}/content`}
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        Manage
                      </Link>
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(course)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        {course.status !== "published" && (
                          <DropdownMenuItem
                            onClick={() => onToggleStatus(course)}
                          >
                            <Globe className="mr-2 h-4 w-4" />
                            Publish
                          </DropdownMenuItem>
                        )}

                        {course.status === "published" && (
                          <DropdownMenuItem
                            onClick={() => onToggleStatus(course)}
                          >
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                        )}

                        {course.status === "archived" && (
                          <DropdownMenuItem
                            onClick={() => onToggleStatus(course)}
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Restore
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
