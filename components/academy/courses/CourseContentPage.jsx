"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Edit,
  ExternalLink,
  Loader2,
  MoreHorizontal,
  PlayCircle,
  Plus,
  Trash2,
  Video,
  BookOpen,
  GripVertical,
  Eye,
  EyeOff,
} from "lucide-react";

import CreateEditModuleDialog from "./CreateEditModuleDialog";
import CreateEditVideoDialog from "./CreateEditVideoDialog";

//////////////////////////////////////////////////////////////
// HELPERS
//////////////////////////////////////////////////////////////

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined || seconds === "") {
    return "Duration unavailable";
  }

  const value = Number(seconds);

  if (!Number.isFinite(value) || value < 0) {
    return "Duration unavailable";
  }

  const totalSeconds = Math.floor(value);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      secs,
    ).padStart(2, "0")}`;
  }

  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function statusClasses(status) {
  switch (status) {
    case "published":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "archived":
      return "bg-neutral-100 text-neutral-600 border-neutral-200";

    case "draft":
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

function StatusBadge({ status }) {
  const normalizedStatus = status || "draft";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusClasses(
        normalizedStatus,
      )}`}
    >
      {normalizedStatus}
    </span>
  );
}

//////////////////////////////////////////////////////////////
// MAIN
//////////////////////////////////////////////////////////////

export default function CourseContentPage({ courseId }) {
  ////////////////////////////////////////////////////////////
  // COURSE / MODULE STATE
  ////////////////////////////////////////////////////////////

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);

  ////////////////////////////////////////////////////////////
  // UI STATE
  ////////////////////////////////////////////////////////////

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [expandedModules, setExpandedModules] = useState({});

  ////////////////////////////////////////////////////////////
  // MODULE DIALOG STATE
  ////////////////////////////////////////////////////////////

  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  ////////////////////////////////////////////////////////////
  // VIDEO DIALOG STATE
  ////////////////////////////////////////////////////////////

  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  /*
   * IMPORTANT:
   *
   * selectedVideoModule is the COMPLETE module object.
   *
   * The video dialog receives:
   *
   * moduleId={selectedVideoModule?.id}
   *
   * NOT:
   *
   * moduleId={selectedVideoModule}
   */
  const [selectedVideoModule, setSelectedVideoModule] = useState(null);

  ////////////////////////////////////////////////////////////
  // ACTION STATE
  ////////////////////////////////////////////////////////////

  const [deletingModuleId, setDeletingModuleId] = useState(null);
  const [deletingVideoId, setDeletingVideoId] = useState(null);

  const [updatingModuleId, setUpdatingModuleId] = useState(null);
  const [updatingVideoId, setUpdatingVideoId] = useState(null);

  ////////////////////////////////////////////////////////////
  // MESSAGES
  ////////////////////////////////////////////////////////////

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  ////////////////////////////////////////////////////////////
  // FETCH COURSE CONTENT
  ////////////////////////////////////////////////////////////

  const fetchModules = useCallback(async () => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/academy/courses/${courseId}/modules`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load course content.");
      }

      setCourse(data?.course || null);
      setModules(Array.isArray(data?.modules) ? data.modules : []);
    } catch (err) {
      console.error("Course content fetch error:", err);

      setError(err?.message || "Failed to load course content.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  ////////////////////////////////////////////////////////////
  // SORT MODULES
  ////////////////////////////////////////////////////////////

  const sortedModules = useMemo(() => {
    return [...modules].sort((a, b) => {
      const aOrder = Number(a?.sort_order ?? 0);
      const bOrder = Number(b?.sort_order ?? 0);

      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      return (
        new Date(a?.created_at || 0).getTime() -
        new Date(b?.created_at || 0).getTime()
      );
    });
  }, [modules]);

  ////////////////////////////////////////////////////////////
  // TOGGLE MODULE
  ////////////////////////////////////////////////////////////

  function toggleModule(moduleId) {
    if (!moduleId) return;

    setExpandedModules((current) => ({
      ...current,
      [moduleId]: !current[moduleId],
    }));
  }

  ////////////////////////////////////////////////////////////
  // CREATE MODULE
  ////////////////////////////////////////////////////////////

  function openCreateModule() {
    clearMessages();

    setSelectedModule(null);
    setModuleDialogOpen(true);
  }

  ////////////////////////////////////////////////////////////
  // EDIT MODULE
  ////////////////////////////////////////////////////////////

  function openEditModule(module) {
    if (!module?.id) return;

    clearMessages();

    setSelectedModule(module);
    setModuleDialogOpen(true);
  }

  ////////////////////////////////////////////////////////////
  // CREATE VIDEO
  ////////////////////////////////////////////////////////////

  function openCreateVideo(module) {
    if (!module?.id) {
      console.error("openCreateVideo: module is missing or has no id.", module);

      setError("Unable to determine the selected module.");
      return;
    }

    clearMessages();

    setSelectedVideo(null);
    setSelectedVideoModule(module);
    setVideoDialogOpen(true);
  }

  ////////////////////////////////////////////////////////////
  // EDIT VIDEO
  ////////////////////////////////////////////////////////////

  function openEditVideo(module, video) {
    if (!module?.id) {
      console.error("openEditVideo: module is missing or has no id.", module);

      setError("Unable to determine the selected module.");
      return;
    }

    if (!video?.id) {
      console.error("openEditVideo: video is missing or has no id.", video);

      setError("Unable to determine the selected video.");
      return;
    }

    clearMessages();

    setSelectedVideo(video);
    setSelectedVideoModule(module);
    setVideoDialogOpen(true);
  }

  ////////////////////////////////////////////////////////////
  // MODULE SAVED
  ////////////////////////////////////////////////////////////

  async function handleModuleSaved() {
    /*
     * Capture whether this was edit/create BEFORE clearing state.
     */
    const wasEditing = Boolean(selectedModule?.id);

    setModuleDialogOpen(false);
    setSelectedModule(null);

    await fetchModules();

    setSuccess(
      wasEditing
        ? "Module updated successfully."
        : "Module created successfully.",
    );
  }

  ////////////////////////////////////////////////////////////
  // VIDEO SAVED
  ////////////////////////////////////////////////////////////

  async function handleVideoSaved(savedModuleId, savedVideo) {
    const wasEditing = Boolean(selectedVideo?.id);

    const moduleId = savedModuleId || selectedVideoModule?.id || "";

    setVideoDialogOpen(false);
    setSelectedVideo(null);
    setSelectedVideoModule(null);

    ////////////////////////////////////////////////////////////
    // IMPORTANT:
    // Re-fetch the complete module/video tree from the API.
    ////////////////////////////////////////////////////////////

    await fetchModules();

    ////////////////////////////////////////////////////////////
    // Keep the affected module expanded
    ////////////////////////////////////////////////////////////

    if (moduleId) {
      setExpandedModules((current) => ({
        ...current,
        [moduleId]: true,
      }));
    }

    setSuccess(
      wasEditing
        ? "Video updated successfully."
        : "Video created successfully.",
    );
  }

  ////////////////////////////////////////////////////////////
  // DELETE MODULE
  ////////////////////////////////////////////////////////////

  async function deleteModule(module) {
    if (!module?.id) return;

    const confirmed = window.confirm(
      `Delete "${module.title}"?\n\nThis will also remove the videos belonging to this module.`,
    );

    if (!confirmed) return;

    try {
      clearMessages();

      setDeletingModuleId(module.id);

      const response = await fetch(
        `/api/admin/academy/courses/${courseId}/modules/${module.id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete module.");
      }

      setModules((current) => current.filter((item) => item.id !== module.id));

      setExpandedModules((current) => {
        const next = { ...current };
        delete next[module.id];
        return next;
      });

      setSuccess("Module deleted successfully.");
    } catch (err) {
      console.error("Delete module error:", err);

      setError(err?.message || "Failed to delete module.");
    } finally {
      setDeletingModuleId(null);
    }
  }

  ////////////////////////////////////////////////////////////
  // DELETE VIDEO
  ////////////////////////////////////////////////////////////

  async function deleteVideo(module, video) {
    if (!module?.id || !video?.id) return;

    const confirmed = window.confirm(
      `Delete "${video.title}"?\n\nThis will permanently delete the video from Bunny Stream and remove its academy record.`,
    );

    if (!confirmed) return;

    try {
      clearMessages();

      setDeletingVideoId(video.id);

      const response = await fetch(
        `/api/admin/academy/courses/${courseId}/modules/${module.id}/videos/${video.id}/delete-video`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete video.");
      }

      // Remove it immediately from the UI
      setModules((current) =>
        current.map((item) => {
          if (item.id !== module.id) {
            return item;
          }

          return {
            ...item,
            videos: (item.videos || []).filter(
              (itemVideo) => itemVideo.id !== video.id,
            ),
          };
        }),
      );

      setSuccess(
        "Video deleted successfully from Bunny Stream and the academy.",
      );
    } catch (err) {
      console.error("Delete video error:", err);

      setError(err?.message || "Failed to delete video.");
    } finally {
      setDeletingVideoId(null);
    }
  }

  ////////////////////////////////////////////////////////////
  // UPDATE MODULE STATUS
  ////////////////////////////////////////////////////////////

  async function updateModuleStatus(module, status) {
    if (!module?.id || !status) return;

    if (module.status === status) {
      return;
    }

    try {
      clearMessages();

      setUpdatingModuleId(module.id);

      const response = await fetch(
        `/api/admin/academy/courses/${courseId}/modules/${module.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to update module status.");
      }

      setModules((current) =>
        current.map((item) =>
          item.id === module.id
            ? {
                ...item,
                ...(data?.module || {}),
              }
            : item,
        ),
      );

      setSuccess(`Module marked as ${status}.`);
    } catch (err) {
      console.error("Update module status error:", err);

      setError(err?.message || "Failed to update module status.");
    } finally {
      setUpdatingModuleId(null);
    }
  }

  ////////////////////////////////////////////////////////////
  // UPDATE VIDEO
  ////////////////////////////////////////////////////////////

  async function updateVideo(module, video, updates) {
    if (!module?.id || !video?.id) return;

    try {
      clearMessages();

      setUpdatingVideoId(video.id);

      const response = await fetch(
        `/api/admin/academy/courses/${courseId}/modules/${module.id}/videos/${video.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to update video.");
      }

      setModules((current) =>
        current.map((item) => {
          if (item.id !== module.id) {
            return item;
          }

          return {
            ...item,
            videos: (item.videos || []).map((itemVideo) =>
              itemVideo.id === video.id
                ? {
                    ...itemVideo,
                    ...(data?.video || {}),
                  }
                : itemVideo,
            ),
          };
        }),
      );

      setSuccess("Video updated successfully.");
    } catch (err) {
      console.error("Update video error:", err);

      setError(err?.message || "Failed to update video.");
    } finally {
      setUpdatingVideoId(null);
    }
  }

  ////////////////////////////////////////////////////////////
  // MOVE MODULE
  ////////////////////////////////////////////////////////////

  async function moveModule(module, direction) {
    if (!module?.id) return;

    const index = sortedModules.findIndex((item) => item.id === module.id);

    if (index === -1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= sortedModules.length) {
      return;
    }

    const target = sortedModules[targetIndex];

    if (!target?.id) return;

    try {
      clearMessages();

      setUpdatingModuleId(module.id);

      /*
       * Because course_id + sort_order is unique,
       * temporarily move the current module away.
       */
      const temporarySortOrder = -999999;

      ////////////////////////////////////////////////////////
      // STEP 1
      ////////////////////////////////////////////////////////

      let response = await fetch(
        `/api/admin/academy/courses/${courseId}/modules/${module.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sort_order: temporarySortOrder,
          }),
        },
      );

      let data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to reorder module.");
      }

      ////////////////////////////////////////////////////////
      // STEP 2
      ////////////////////////////////////////////////////////

      response = await fetch(
        `/api/admin/academy/courses/${courseId}/modules/${target.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sort_order: module.sort_order,
          }),
        },
      );

      data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to reorder module.");
      }

      ////////////////////////////////////////////////////////
      // STEP 3
      ////////////////////////////////////////////////////////

      response = await fetch(
        `/api/admin/academy/courses/${courseId}/modules/${module.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sort_order: target.sort_order,
          }),
        },
      );

      data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to reorder module.");
      }

      ////////////////////////////////////////////////////////
      // REFRESH
      ////////////////////////////////////////////////////////

      await fetchModules();

      setSuccess("Module order updated.");
    } catch (err) {
      console.error("Move module error:", err);

      setError(err?.message || "Failed to reorder module.");

      await fetchModules();
    } finally {
      setUpdatingModuleId(null);
    }
  }

  ////////////////////////////////////////////////////////////
  // MOVE VIDEO
  ////////////////////////////////////////////////////////////

  async function moveVideo(module, video, direction) {
    if (!module?.id || !video?.id) return;

    const videos = [...(module.videos || [])].sort(
      (a, b) =>
        Number(a?.sequence_number ?? 0) - Number(b?.sequence_number ?? 0),
    );

    const index = videos.findIndex((item) => item.id === video.id);

    if (index === -1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= videos.length) {
      return;
    }

    const target = videos[targetIndex];

    if (!target?.id) return;

    try {
      clearMessages();

      setUpdatingVideoId(video.id);

      /*
       * Same idea as modules:
       *
       * sequence_number is usually unique per module.
       *
       * Temporarily move the selected video away before
       * swapping sequence numbers.
       */
      const temporarySequence = -999999;

      ////////////////////////////////////////////////////////
      // STEP 1
      ////////////////////////////////////////////////////////

      let response = await fetch(
        `/api/admin/academy/courses/${courseId}/modules/${module.id}/videos/${video.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sequence_number: temporarySequence,
          }),
        },
      );

      let data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to reorder video.");
      }

      ////////////////////////////////////////////////////////
      // STEP 2
      ////////////////////////////////////////////////////////

      response = await fetch(
        `/api/admin/academy/courses/${courseId}/modules/${module.id}/videos/${target.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sequence_number: video.sequence_number,
          }),
        },
      );

      data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to reorder video.");
      }

      ////////////////////////////////////////////////////////
      // STEP 3
      ////////////////////////////////////////////////////////

      response = await fetch(
        `/api/admin/academy/courses/${courseId}/modules/${module.id}/videos/${video.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sequence_number: target.sequence_number,
          }),
        },
      );

      data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to reorder video.");
      }

      ////////////////////////////////////////////////////////
      // REFRESH
      ////////////////////////////////////////////////////////

      await fetchModules();

      setExpandedModules((current) => ({
        ...current,
        [module.id]: true,
      }));

      setSuccess("Video order updated.");
    } catch (err) {
      console.error("Move video error:", err);

      setError(err?.message || "Failed to reorder video.");

      await fetchModules();
    } finally {
      setUpdatingVideoId(null);
    }
  }

  ////////////////////////////////////////////////////////////
  // LOADING
  ////////////////////////////////////////////////////////////

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-neutral-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading course content...</span>
        </div>
      </div>
    );
  }

  ////////////////////////////////////////////////////////////
  // COURSE LOAD ERROR
  ////////////////////////////////////////////////////////////

  if (!course && error) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <h2 className="font-semibold">Unable to load course</h2>

          <p className="mt-1 text-sm">{error}</p>

          <button
            type="button"
            onClick={fetchModules}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  ////////////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////////////

  return (
    <>
      <div className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/admin/academy/courses"
              className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to courses
            </Link>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                    {course?.title || "Course Content"}
                  </h1>

                  {course?.status && <StatusBadge status={course.status} />}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                  {course?.course_code && (
                    <span className="font-mono">{course.course_code}</span>
                  )}

                  <span>•</span>

                  <span>
                    {sortedModules.length}{" "}
                    {sortedModules.length === 1 ? "module" : "modules"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/academy/courses/${courseId}`}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  <ExternalLink className="h-4 w-4" />
                  Course Details
                </Link>

                <button
                  type="button"
                  onClick={openCreateModule}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-neutral-900 px-4 text-sm font-semibold text-white hover:bg-neutral-800"
                >
                  <Plus className="h-4 w-4" />
                  Add Module
                </button>
              </div>
            </div>
          </div>
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}
          {!sortedModules.length ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
                <BookOpen className="h-7 w-7 text-neutral-500" />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-neutral-900">
                No modules yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
                Start building this course by creating the first module. Videos
                can then be added inside the module.
              </p>

              <button
                type="button"
                onClick={openCreateModule}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
              >
                <Plus className="h-4 w-4" />
                Create First Module
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedModules.map((module, moduleIndex) => {
                const isExpanded = Boolean(expandedModules[module.id]);

                const videos = [...(module.videos || [])].sort(
                  (a, b) =>
                    Number(a?.sequence_number ?? 0) -
                    Number(b?.sequence_number ?? 0),
                );

                return (
                  <section
                    key={module.id}
                    className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
                  >
                    <div className="flex flex-col gap-4 p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleModule(module.id)}
                          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                        </button>
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <div className="hidden shrink-0 pt-1 text-neutral-300 sm:block">
                            <GripVertical className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                Module {moduleIndex + 1}
                              </span>

                              <StatusBadge status={module.status} />
                            </div>

                            <h2 className="mt-1 truncate text-lg font-semibold text-neutral-900">
                              {module.title}
                            </h2>

                            {module.description && (
                              <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
                                {module.description}
                              </p>
                            )}

                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                              <span className="font-mono">
                                {module.module_code}
                              </span>

                              <span>•</span>

                              <span>
                                {videos.length}{" "}
                                {videos.length === 1 ? "video" : "videos"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            title="Move module up"
                            disabled={
                              moduleIndex === 0 ||
                              updatingModuleId === module.id
                            }
                            onClick={() => moveModule(module, "up")}
                            className="hidden h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 sm:flex"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            title="Move module down"
                            disabled={
                              moduleIndex === sortedModules.length - 1 ||
                              updatingModuleId === module.id
                            }
                            onClick={() => moveModule(module, "down")}
                            className="hidden h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 sm:flex"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            title="Edit module"
                            onClick={() => openEditModule(module)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            title="Delete module"
                            disabled={deletingModuleId === module.id}
                            onClick={() => deleteModule(module)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-40"
                          >
                            {deletingModuleId === module.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>

                          <button
                            type="button"
                            title={
                              isExpanded ? "Collapse module" : "Expand module"
                            }
                            onClick={() => toggleModule(module.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pl-12 sm:pl-14">
                        <span className="mr-1 text-xs font-medium text-neutral-400">
                          Status:
                        </span>

                        {["draft", "published", "archived"].map((status) => (
                          <button
                            key={status}
                            type="button"
                            disabled={updatingModuleId === module.id}
                            onClick={() => updateModuleStatus(module, status)}
                            className={[
                              "rounded-full border px-3 py-1 text-xs font-medium capitalize transition",
                              module.status === status
                                ? statusClasses(status)
                                : "border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50",
                            ].join(" ")}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-neutral-100 bg-neutral-50/60 p-4 sm:p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-neutral-900">
                              Module Videos
                            </h3>

                            <p className="mt-1 text-xs text-neutral-500">
                              Add and arrange the lessons inside this module.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => openCreateVideo(module)}
                            className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
                          >
                            <Plus className="h-4 w-4" />
                            Add Video
                          </button>
                        </div>

                        {!videos.length ? (
                          <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center">
                            <Video className="mx-auto h-8 w-8 text-neutral-300" />

                            <p className="mt-3 text-sm font-medium text-neutral-700">
                              No videos in this module
                            </p>

                            <p className="mt-1 text-xs text-neutral-400">
                              Add the first video lesson.
                            </p>

                            <button
                              type="button"
                              onClick={() => openCreateVideo(module)}
                              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                            >
                              <Plus className="h-4 w-4" />
                              Add Video
                            </button>
                          </div>
                        ) : (
                          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                            <div className="divide-y divide-neutral-100">
                              {videos.map((video, videoIndex) => (
                                <div
                                  key={video.id}
                                  className="group flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
                                >
                                  <div className="flex shrink-0 items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-sm font-semibold text-neutral-600">
                                      {video.sequence_number}
                                    </div>

                                    <div className="hidden text-neutral-300 sm:block">
                                      <GripVertical className="h-4 w-4" />
                                    </div>
                                  </div>

                                  <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 sm:flex">
                                    <PlayCircle className="h-5 w-5 text-neutral-500" />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h4 className="font-medium text-neutral-900">
                                        {video.title}
                                      </h4>

                                      <StatusBadge status={video.status} />

                                      {video.is_preview && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                          <Eye className="h-3 w-3" />
                                          Preview
                                        </span>
                                      )}
                                    </div>

                                    {video.description && (
                                      <p className="mt-1 line-clamp-1 text-sm text-neutral-500">
                                        {video.description}
                                      </p>
                                    )}

                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                                      <span>
                                        {formatDuration(video.duration_seconds)}
                                      </span>

                                      <span>•</span>

                                      <span className="font-mono">
                                        {video.video_code}
                                      </span>

                                      {video.bunny_video_id && (
                                        <>
                                          <span>•</span>

                                          <span className="font-mono">
                                            Bunny: {video.bunny_video_id}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-1 sm:justify-end">
                                    <button
                                      type="button"
                                      title="Move video up"
                                      disabled={
                                        videoIndex === 0 ||
                                        updatingVideoId === video.id
                                      }
                                      onClick={() =>
                                        moveVideo(module, video, "up")
                                      }
                                      className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                                    >
                                      <ArrowUp className="h-4 w-4" />
                                    </button>

                                    <button
                                      type="button"
                                      title="Move video down"
                                      disabled={
                                        videoIndex === videos.length - 1 ||
                                        updatingVideoId === video.id
                                      }
                                      onClick={() =>
                                        moveVideo(module, video, "down")
                                      }
                                      className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                                    >
                                      <ArrowDown className="h-4 w-4" />
                                    </button>

                                    <button
                                      type="button"
                                      title="Edit video"
                                      onClick={() =>
                                        openEditVideo(module, video)
                                      }
                                      className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>

                                    <button
                                      type="button"
                                      title="Toggle preview"
                                      disabled={updatingVideoId === video.id}
                                      onClick={() =>
                                        updateVideo(module, video, {
                                          is_preview: !video.is_preview,
                                        })
                                      }
                                      className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 disabled:opacity-40"
                                    >
                                      {video.is_preview ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </button>

                                    <button
                                      type="button"
                                      title="Delete video"
                                      disabled={deletingVideoId === video.id}
                                      onClick={() => deleteVideo(module, video)}
                                      className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-40"
                                    >
                                      {deletingVideoId === video.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="border-t border-neutral-100 bg-neutral-50 px-4 py-3">
                              <button
                                type="button"
                                onClick={() => openCreateVideo(module)}
                                className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900"
                              >
                                <Plus className="h-4 w-4" />
                                Add another video
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <CreateEditModuleDialog
        open={moduleDialogOpen}
        onOpenChange={setModuleDialogOpen}
        course={course}
        courseId={courseId}
        module={selectedModule}
        existingModules={modules}
        onSaved={handleModuleSaved}
      />
      <CreateEditVideoDialog
        open={videoDialogOpen}
        onClose={() => {
          setVideoDialogOpen(false);
          setSelectedVideo(null);
          setSelectedVideoModule(null);
        }}
        courseId={courseId}
        moduleId={selectedVideoModule?.id || ""}
        module={selectedVideoModule}
        video={selectedVideo}
        existingVideos={selectedVideoModule?.videos || []}
        onSaved={(savedVideo) =>
          handleVideoSaved(selectedVideoModule?.id, savedVideo)
        }
      />
    </>
  );
}
