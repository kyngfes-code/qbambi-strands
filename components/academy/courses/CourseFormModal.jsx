"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  title: z.string().min(2, "Course title is required"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().optional(),
  level: z.string().min(1, "Level is required"),
  sort_order: z.coerce.number().min(0),
  active: z.boolean(),
});

export default function CourseFormModal({
  open,
  onOpenChange,
  initialData = null,
  onSubmit,
  loading = false,
}) {
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      slug: "",
      category: "",
      level: "",
      sort_order: 0,
      active: true,
    },
  });

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      reset({
        title: initialData.title,
        slug: initialData.slug,
        description: initialData.description ?? "",
        level: initialData.level,
        sort_order: initialData.sort_order ?? 0,
        active: initialData.active ?? true,
      });
    } else {
      reset({
        title: "",
        slug: "",
        description: "",
        level: "",
        sort_order: 0,
        active: true,
      });
    }
  }, [open, initialData, reset]);

  async function submit(values) {
    await onSubmit(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-[95vw]
          sm:max-w-xl
          lg:max-w-3xl
          max-h-[90vh]
          p-0
          overflow-hidden
        "
      >
        {/* Header */}
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle>
            {isEditing ? "Edit Course" : "Create Course"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Update the academy course details."
              : "Create a new academy course."}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Body */}
        <form
          onSubmit={handleSubmit(submit)}
          className="flex max-h-[calc(90vh-80px)] flex-col"
        >
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="grid gap-5 md:grid-cols-2">
              {/* Title */}
              <div className="space-y-2">
                <Label>Course Title *</Label>

                <Input
                  placeholder="Professional Wig Installation"
                  {...register("title")}
                />

                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label>Slug *</Label>

                <Input
                  placeholder="professional-wig-installation"
                  {...register("slug")}
                />

                {errors.slug && (
                  <p className="text-sm text-red-500">{errors.slug.message}</p>
                )}
              </div>

              {/* Level */}
              <div className="space-y-2">
                <Label>Level *</Label>

                <select
                  {...register("level")}
                  className="h-11 w-full rounded-lg border bg-background px-3 text-sm"
                >
                  <option value="">Select Level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Professional">Professional</option>
                </select>

                {errors.level && (
                  <p className="text-sm text-red-500">{errors.level.message}</p>
                )}
              </div>

              {/* Display Order */}
              <div className="space-y-2">
                <Label>Display Order</Label>

                <Input type="number" {...register("sort_order")} />
              </div>

              {/* Active */}
              <div className="flex items-center gap-3 md:pt-8">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  {...register("active")}
                />

                <Label className="cursor-pointer">Course Active</Label>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6 space-y-2">
              <Label>Description</Label>

              <textarea
                rows={6}
                className="
                  min-h-[140px]
                  w-full
                  rounded-lg
                  border
                  p-3
                  text-sm
                  resize-y
                "
                placeholder="Course description..."
                {...register("description")}
              />

              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="flex flex-col-reverse gap-3 border-t bg-background px-6 py-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading
                ? "Saving..."
                : isEditing
                  ? "Update Course"
                  : "Create Course"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
