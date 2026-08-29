"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Loader2 } from "lucide-react";

const STATUSES = ["draft", "published", "archived"];

export default function CreateEditModuleDialog({
  open,
  onOpenChange,
  course,
  courseId,
  module = null,
  existingModules = [],
  onSaved,
}) {
  const isEditing = Boolean(module);

  ////////////////////////////////////////////////////////////
  // NEXT SORT ORDER
  ////////////////////////////////////////////////////////////

  const nextSortOrder = useMemo(() => {
    if (!existingModules?.length) {
      return 0;
    }

    const values = existingModules
      .map((item) => Number(item.sort_order))
      .filter((value) => Number.isInteger(value) && value >= 0);

    if (!values.length) {
      return 0;
    }

    return Math.max(...values) + 1;
  }, [existingModules]);

  ////////////////////////////////////////////////////////////
  // FORM
  ////////////////////////////////////////////////////////////

  const [form, setForm] = useState({
    module_code: "",
    title: "",
    description: "",
    sort_order: 0,
    status: "draft",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  ////////////////////////////////////////////////////////////
  // INITIALIZE / RESET FORM
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    if (!open) {
      return;
    }

    setError("");

    if (module) {
      setForm({
        module_code: module.module_code || "",
        title: module.title || "",
        description: module.description || "",
        sort_order: module.sort_order ?? 0,
        status: module.status || "draft",
      });
    } else {
      setForm({
        module_code: "",
        title: "",
        description: "",
        sort_order: nextSortOrder,
        status: "draft",
      });
    }
  }, [open, module, nextSortOrder]);

  ////////////////////////////////////////////////////////////
  // UPDATE FIELD
  ////////////////////////////////////////////////////////////

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  ////////////////////////////////////////////////////////////
  // SUBMIT
  ////////////////////////////////////////////////////////////

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      ////////////////////////////////////////////////////////////
      // VALIDATE TITLE
      ////////////////////////////////////////////////////////////

      if (!form.title.trim()) {
        setError("Module title is required.");
        return;
      }

      ////////////////////////////////////////////////////////////
      // VALIDATE SORT ORDER
      ////////////////////////////////////////////////////////////

      const parsedSortOrder = Number(form.sort_order);

      if (!Number.isInteger(parsedSortOrder) || parsedSortOrder < 0) {
        setError("Sort order must be a non-negative whole number.");
        return;
      }

      ////////////////////////////////////////////////////////////
      // PAYLOAD
      ////////////////////////////////////////////////////////////

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        sort_order: parsedSortOrder,
        status: form.status,
      };

      /*
       * module_code is optional when creating.
       * The API generates one automatically when blank.
       *
       * When editing, preserve the existing module code.
       */

      if (isEditing) {
        payload.module_code = form.module_code.trim();
      } else if (form.module_code.trim()) {
        payload.module_code = form.module_code.trim();
      }

      ////////////////////////////////////////////////////////////
      // URL
      ////////////////////////////////////////////////////////////

      const url = isEditing
        ? `/api/admin/academy/courses/${courseId}/modules/${module.id}`
        : `/api/admin/academy/courses/${courseId}/modules`;

      ////////////////////////////////////////////////////////////
      // REQUEST
      ////////////////////////////////////////////////////////////

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      ////////////////////////////////////////////////////////////
      // SAFE RESPONSE PARSING
      ////////////////////////////////////////////////////////////

      const contentType = response.headers.get("content-type") || "";

      let data = {};

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        data = {
          error: text || `Request failed with HTTP ${response.status}.`,
        };
      }

      ////////////////////////////////////////////////////////////
      // API ERROR
      ////////////////////////////////////////////////////////////

      if (!response.ok) {
        throw new Error(
          data?.error ||
            (isEditing
              ? "Failed to update module."
              : "Failed to create module."),
        );
      }

      ////////////////////////////////////////////////////////////
      // SUCCESS
      ////////////////////////////////////////////////////////////

      if (onSaved) {
        await onSaved(data.module);
      }

      onOpenChange(false);
    } catch (err) {
      console.error("Save module error:", err);

      setError(
        err?.message ||
          (isEditing ? "Failed to update module." : "Failed to create module."),
      );
    } finally {
      setLoading(false);
    }
  }

  ////////////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////////////

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (loading) {
          return;
        }

        onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        className="
          flex
          w-[calc(100%-1rem)]
          max-w-lg
          flex-col
          overflow-hidden
          p-0

          sm:w-[calc(100%-2rem)]
          sm:max-w-lg

          md:max-w-xl

          max-h-[calc(100dvh-1rem)]
          sm:max-h-[calc(100dvh-2rem)]
        "
      >
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          {/* ================================================== */}
          {/* HEADER */}
          {/* ================================================== */}

          <DialogHeader
            className="
              shrink-0
              border-b
              border-neutral-200
              px-4
              py-4
              text-left

              sm:px-6
              sm:py-5
            "
          >
            <DialogTitle
              className="
                pr-8
                text-base
                leading-6
                sm:text-lg
                sm:leading-7
              "
            >
              {isEditing ? "Edit Module" : "Create Module"}
            </DialogTitle>

            <DialogDescription
              className="
                pr-4
                text-xs
                leading-5
                sm:text-sm
              "
            >
              {isEditing
                ? "Update the module information and publishing status."
                : `Add a new module to ${course?.title || "this course"}.`}
            </DialogDescription>
          </DialogHeader>

          {/* ================================================== */}
          {/* BODY */}
          {/* ================================================== */}

          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              overscroll-contain
              px-4
              py-4

              sm:px-6
              sm:py-6
            "
          >
            <div className="space-y-5">
              {/* ================================================== */}
              {/* ERROR */}
              {/* ================================================== */}

              {error && (
                <div
                  role="alert"
                  className="
                    break-words
                    rounded-lg
                    border
                    border-red-200
                    bg-red-50
                    px-3
                    py-3
                    text-sm
                    leading-5
                    text-red-700
                  "
                >
                  {error}
                </div>
              )}

              {/* ================================================== */}
              {/* MODULE CODE */}
              {/* ================================================== */}

              <div className="space-y-1.5">
                <label
                  htmlFor="module_code"
                  className="
                    block
                    text-sm
                    font-medium
                    text-neutral-800
                  "
                >
                  Module Code
                  {!isEditing && (
                    <span className="ml-1 font-normal text-neutral-400">
                      optional
                    </span>
                  )}
                </label>

                <input
                  id="module_code"
                  type="text"
                  value={form.module_code}
                  onChange={(event) =>
                    updateField("module_code", event.target.value)
                  }
                  disabled={loading}
                  autoComplete="off"
                  placeholder={
                    isEditing
                      ? "Module code"
                      : "Leave blank to generate automatically"
                  }
                  className="
                    h-10
                    w-full
                    min-w-0
                    rounded-lg
                    border
                    border-neutral-200
                    bg-white
                    px-3
                    text-sm
                    text-neutral-900
                    outline-none
                    transition

                    placeholder:text-neutral-400

                    focus:border-neutral-400
                    focus:ring-2
                    focus:ring-neutral-100

                    disabled:cursor-not-allowed
                    disabled:bg-neutral-50
                  "
                />

                {!isEditing && (
                  <p className="text-xs leading-5 text-neutral-400">
                    Example: MHH-INTRO-1001
                  </p>
                )}
              </div>

              {/* ================================================== */}
              {/* TITLE */}
              {/* ================================================== */}

              <div className="space-y-1.5">
                <label
                  htmlFor="module_title"
                  className="
                    block
                    text-sm
                    font-medium
                    text-neutral-800
                  "
                >
                  Module Title
                </label>

                <input
                  id="module_title"
                  type="text"
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  disabled={loading}
                  autoComplete="off"
                  placeholder="e.g. Introduction to Hair Installation"
                  required
                  className="
                    h-10
                    w-full
                    min-w-0
                    rounded-lg
                    border
                    border-neutral-200
                    bg-white
                    px-3
                    text-sm
                    text-neutral-900
                    outline-none
                    transition

                    placeholder:text-neutral-400

                    focus:border-neutral-400
                    focus:ring-2
                    focus:ring-neutral-100

                    disabled:cursor-not-allowed
                    disabled:bg-neutral-50
                  "
                />
              </div>

              {/* ================================================== */}
              {/* DESCRIPTION */}
              {/* ================================================== */}

              <div className="space-y-1.5">
                <label
                  htmlFor="module_description"
                  className="
                    block
                    text-sm
                    font-medium
                    text-neutral-800
                  "
                >
                  Description
                  <span className="ml-1 font-normal text-neutral-400">
                    optional
                  </span>
                </label>

                <textarea
                  id="module_description"
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  disabled={loading}
                  rows={4}
                  placeholder="Describe what students will learn in this module..."
                  className="
                    min-h-24
                    w-full
                    min-w-0
                    resize-y
                    rounded-lg
                    border
                    border-neutral-200
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    leading-6
                    text-neutral-900
                    outline-none
                    transition

                    placeholder:text-neutral-400

                    focus:border-neutral-400
                    focus:ring-2
                    focus:ring-neutral-100

                    disabled:cursor-not-allowed
                    disabled:bg-neutral-50
                  "
                />
              </div>

              {/* ================================================== */}
              {/* ORDER + STATUS */}
              {/* ================================================== */}

              <div
                className="
                  grid
                  grid-cols-1
                  gap-5

                  sm:grid-cols-2
                  sm:gap-4
                "
              >
                {/* ORDER */}

                <div className="min-w-0 space-y-1.5">
                  <label
                    htmlFor="module_sort_order"
                    className="
                      block
                      text-sm
                      font-medium
                      text-neutral-800
                    "
                  >
                    Module Order
                  </label>

                  <input
                    id="module_sort_order"
                    type="number"
                    min="0"
                    step="1"
                    value={form.sort_order}
                    onChange={(event) =>
                      updateField("sort_order", event.target.value)
                    }
                    disabled={loading}
                    inputMode="numeric"
                    className="
                      h-10
                      w-full
                      min-w-0
                      rounded-lg
                      border
                      border-neutral-200
                      bg-white
                      px-3
                      text-sm
                      text-neutral-900
                      outline-none
                      transition

                      focus:border-neutral-400
                      focus:ring-2
                      focus:ring-neutral-100

                      disabled:cursor-not-allowed
                      disabled:bg-neutral-50
                    "
                  />

                  <p className="text-xs leading-5 text-neutral-400">
                    Lower numbers appear first.
                  </p>
                </div>

                {/* STATUS */}

                <div className="min-w-0 space-y-1.5">
                  <label
                    htmlFor="module_status"
                    className="
                      block
                      text-sm
                      font-medium
                      text-neutral-800
                    "
                  >
                    Status
                  </label>

                  <select
                    id="module_status"
                    value={form.status}
                    onChange={(event) =>
                      updateField("status", event.target.value)
                    }
                    disabled={loading}
                    className="
                      h-10
                      w-full
                      min-w-0
                      rounded-lg
                      border
                      border-neutral-200
                      bg-white
                      px-3
                      text-sm
                      text-neutral-900
                      outline-none
                      transition

                      focus:border-neutral-400
                      focus:ring-2
                      focus:ring-neutral-100

                      disabled:cursor-not-allowed
                      disabled:bg-neutral-50
                    "
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================== */}
          {/* FOOTER */}
          {/* ================================================== */}

          <DialogFooter
            className="
              shrink-0
              border-t
              border-neutral-200
              bg-white
              px-4
              py-3

              sm:px-6
              sm:py-4
            "
          >
            <div
              className="
                grid
                w-full
                grid-cols-1
                gap-2

                sm:flex
                sm:items-center
                sm:justify-end
                sm:gap-3
              "
            >
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="
                  order-2
                  inline-flex
                  h-10
                  w-full
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-neutral-200
                  bg-white
                  px-4
                  text-sm
                  font-medium
                  text-neutral-700
                  transition

                  hover:bg-neutral-50

                  disabled:cursor-not-allowed
                  disabled:opacity-50

                  sm:order-1
                  sm:w-auto
                "
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="
                  order-1
                  inline-flex
                  h-10
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-neutral-900
                  px-4
                  text-sm
                  font-semibold
                  text-white
                  transition

                  hover:bg-neutral-800

                  disabled:cursor-not-allowed
                  disabled:opacity-50

                  sm:order-2
                  sm:w-auto
                "
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}

                {loading
                  ? "Saving..."
                  : isEditing
                    ? "Save Changes"
                    : "Create Module"}
              </button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
