"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function createSlug(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function CourseFormDialog({
  open,
  onOpenChange,
  initialData = null,
  loading = false,
  onSubmit,
}) {
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      course_code: "",
      title: "",
      slug: "",
      description: "",
      thumbnail_path: "",
      duration_minutes: "",
      status: "draft",
      sort_order: 0,
    },
  });

  ////////////////////////////////////////////////////////////
  // RESET FORM
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    if (!open) {
      return;
    }

    if (initialData) {
      reset({
        course_code: initialData.course_code ?? "",
        title: initialData.title ?? "",
        slug: initialData.slug ?? "",
        description: initialData.description ?? "",
        thumbnail_path: initialData.thumbnail_path ?? "",
        duration_minutes: initialData.duration_minutes ?? "",
        status: initialData.status ?? "draft",
        sort_order: initialData.sort_order ?? 0,
      });

      return;
    }

    reset({
      course_code: "",
      title: "",
      slug: "",
      description: "",
      thumbnail_path: "",
      duration_minutes: "",
      status: "draft",
      sort_order: 0,
    });
  }, [open, initialData, reset]);

  ////////////////////////////////////////////////////////////
  // WATCH
  ////////////////////////////////////////////////////////////

  const currentStatus = watch("status");

  ////////////////////////////////////////////////////////////
  // SUBMIT
  ////////////////////////////////////////////////////////////

  async function submit(values) {
    const title = values.title?.trim() || "";

    const payload = {
      course_code: values.course_code?.trim() || "",

      title,

      slug: values.slug?.trim() || createSlug(title),

      description: values.description?.trim() || null,

      thumbnail_path: values.thumbnail_path?.trim() || null,

      duration_minutes:
        values.duration_minutes === "" ||
        values.duration_minutes === null ||
        values.duration_minutes === undefined
          ? null
          : Number(values.duration_minutes),

      status: values.status || "draft",

      sort_order:
        values.sort_order === "" ||
        values.sort_order === null ||
        values.sort_order === undefined
          ? 0
          : Number(values.sort_order),
    };

    await onSubmit(payload);
  }

  ////////////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////////////

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!loading) {
          onOpenChange(value);
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Academy Course" : "Create Academy Course"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Update the course information and publishing status."
              : "Create a course that can later contain modules, videos and downloadable materials."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-5">
          {/* ================================================== */}
          {/* COURSE CODE */}
          {/* ================================================== */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Course Code</label>

            <Input
              placeholder="QB-HAIR-001"
              {...register("course_code", {
                required: "Course code is required.",
                maxLength: {
                  value: 100,
                  message: "Course code is too long.",
                },
              })}
            />

            {errors.course_code && (
              <p className="text-sm text-destructive">
                {errors.course_code.message}
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              This should be unique and can be used to identify the course
              across academy content.
            </p>
          </div>

          {/* ================================================== */}
          {/* TITLE */}
          {/* ================================================== */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Course Title</label>

            <Input
              placeholder="Professional Hair Styling"
              {...register("title", {
                required: "Course title is required.",
                minLength: {
                  value: 2,
                  message: "Course title must contain at least 2 characters.",
                },
              })}
              onBlur={(event) => {
                const title = event.target.value;

                const currentSlug = watch("slug");

                // Only automatically generate the slug when
                // the admin has not already entered one.
                if (!currentSlug?.trim()) {
                  setValue("slug", createSlug(title), {
                    shouldDirty: true,
                  });
                }
              }}
            />

            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* ================================================== */}
          {/* SLUG */}
          {/* ================================================== */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Course Slug</label>

            <Input
              placeholder="professional-hair-styling"
              {...register("slug", {
                required: "Course slug is required.",
                minLength: {
                  value: 2,
                  message: "Course slug is too short.",
                },
                pattern: {
                  value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                  message:
                    "Slug can only contain lowercase letters, numbers and hyphens.",
                },
              })}
              onBlur={(event) => {
                const slug = createSlug(event.target.value);

                setValue("slug", slug, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            />

            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}

            <p className="text-xs text-muted-foreground">
              Used in course URLs. Example:
              <span className="ml-1 font-medium">
                /academy/courses/professional-hair-styling
              </span>
            </p>
          </div>

          {/* ================================================== */}
          {/* DESCRIPTION */}
          {/* ================================================== */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>

            <Textarea
              rows={5}
              placeholder="Describe what students will learn in this course..."
              {...register("description")}
            />
          </div>

          {/* ================================================== */}
          {/* THUMBNAIL */}
          {/* ================================================== */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Thumbnail Path</label>

            <Input
              placeholder="academy/courses/hair-styling.jpg"
              {...register("thumbnail_path")}
            />

            <p className="text-xs text-muted-foreground">
              For now this stores the Supabase Storage path. We can add a proper
              image uploader later.
            </p>
          </div>

          {/* ================================================== */}
          {/* DURATION + SORT ORDER */}
          {/* ================================================== */}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (minutes)</label>

              <Input
                type="number"
                min="0"
                placeholder="360"
                {...register("duration_minutes", {
                  min: {
                    value: 0,
                    message: "Duration cannot be negative.",
                  },
                })}
              />

              {errors.duration_minutes && (
                <p className="text-sm text-destructive">
                  {errors.duration_minutes.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort Order</label>

              <Input
                type="number"
                min="0"
                {...register("sort_order", {
                  valueAsNumber: true,
                  min: {
                    value: 0,
                    message: "Sort order cannot be negative.",
                  },
                })}
              />

              {errors.sort_order && (
                <p className="text-sm text-destructive">
                  {errors.sort_order.message}
                </p>
              )}
            </div>
          </div>

          {/* ================================================== */}
          {/* STATUS */}
          {/* ================================================== */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>

            <Select
              value={currentStatus}
              onValueChange={(value) =>
                setValue("status", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>

                <SelectItem value="published">Published</SelectItem>

                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <p className="text-xs text-muted-foreground">
              Published courses can be made available to eligible students.
            </p>
          </div>

          {/* ================================================== */}
          {/* FOOTER */}
          {/* ================================================== */}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

              {loading
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
