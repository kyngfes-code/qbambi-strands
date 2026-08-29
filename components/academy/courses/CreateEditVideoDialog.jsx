"use client";

import { useEffect, useMemo, useState } from "react";
import * as tus from "tus-js-client";

//////////////////////////////////////////////////////////////
// COMPONENT
//////////////////////////////////////////////////////////////

export default function CreateEditVideoDialog({
  open,
  onClose,
  courseId,
  moduleId,
  module,
  video,
  existingVideos = [],
  onSaved,
}) {
  ////////////////////////////////////////////////////////////
  // MODE
  ////////////////////////////////////////////////////////////

  const isEditMode = Boolean(video?.id);

  ////////////////////////////////////////////////////////////
  // FORM STATE
  ////////////////////////////////////////////////////////////

  const [file, setFile] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [status, setStatus] = useState("draft");

  ////////////////////////////////////////////////////////////
  // UPLOAD STATE
  ////////////////////////////////////////////////////////////

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState("");

  ////////////////////////////////////////////////////////////
  // MESSAGES
  ////////////////////////////////////////////////////////////

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  ////////////////////////////////////////////////////////////
  // USED SORT ORDERS
  ////////////////////////////////////////////////////////////

  const usedSortOrders = useMemo(() => {
    return new Set(
      (existingVideos || [])
        .filter((item) => item?.id !== video?.id)
        .map((item) => Number(item?.sort_order))
        .filter((value) => Number.isInteger(value) && value >= 0),
    );
  }, [existingVideos, video?.id]);

  ////////////////////////////////////////////////////////////
  // INITIALIZE FORM
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    if (!open) {
      return;
    }

    setError("");
    setSuccess("");
    setFile(null);

    setUploadProgress(0);
    setUploadStep("");
    setUploading(false);

    ////////////////////////////////////////////////////////////
    // EDIT MODE
    ////////////////////////////////////////////////////////////

    if (video?.id) {
      setTitle(video.title || "");
      setDescription(video.description || "");

      setSortOrder(
        video.sort_order !== null && video.sort_order !== undefined
          ? String(video.sort_order)
          : "0",
      );

      setStatus(video.status || "draft");

      return;
    }

    ////////////////////////////////////////////////////////////
    // CREATE MODE
    ////////////////////////////////////////////////////////////

    setTitle("");
    setDescription("");

    ////////////////////////////////////////////////////////////
    // Suggest next available sort order
    //
    // sort_order is 0-based:
    //
    // first video  = 0
    // second video = 1
    // third video  = 2
    ////////////////////////////////////////////////////////////

    const nextSortOrder =
      (existingVideos || []).reduce((highest, item) => {
        const value = Number(item?.sort_order);

        if (!Number.isInteger(value) || value < 0) {
          return highest;
        }

        return Math.max(highest, value);
      }, -1) + 1;

    setSortOrder(String(nextSortOrder));
    setStatus("draft");
  }, [open, video?.id, existingVideos]);

  ////////////////////////////////////////////////////////////
  // FILE CHANGE
  ////////////////////////////////////////////////////////////

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    setError("");
    setSuccess("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!selectedFile.type.startsWith("video/")) {
      setError("Please select a valid video file.");
      setFile(null);
      return;
    }

    setFile(selectedFile);

    ////////////////////////////////////////////////////////////
    // Auto-generate title when creating
    ////////////////////////////////////////////////////////////

    if (!isEditMode && !title.trim()) {
      const cleanName = selectedFile.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[_-]+/g, " ")
        .trim();

      setTitle(cleanName);
    }
  }

  ////////////////////////////////////////////////////////////
  // SAFE RESPONSE PARSER
  ////////////////////////////////////////////////////////////

  async function parseResponse(response) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return await response.json();
    }

    const text = await response.text();

    return {
      error:
        text ||
        `Request failed with HTTP ${response.status} ${response.statusText}`,
    };
  }

  ////////////////////////////////////////////////////////////
  // VALIDATE FORM
  ////////////////////////////////////////////////////////////

  function validateForm({ requireFile = false } = {}) {
    if (!courseId || !moduleId) {
      return "Course and module are required.";
    }

    if (!title.trim()) {
      return "Video title is required.";
    }

    if (sortOrder === "" || sortOrder === null) {
      return "Video position is required.";
    }

    const parsedSortOrder = Number(sortOrder);

    if (!Number.isInteger(parsedSortOrder) || parsedSortOrder < 0) {
      return "Video position must be a non-negative integer.";
    }

    if (usedSortOrders.has(parsedSortOrder)) {
      return `Video position ${parsedSortOrder} is already being used by another video in this module.`;
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return "Invalid video status.";
    }

    if (requireFile && !file) {
      return "Please select a video file.";
    }

    return "";
  }

  ////////////////////////////////////////////////////////////
  // EDIT VIDEO
  ////////////////////////////////////////////////////////////

  async function handleEdit() {
    if (uploading) {
      return;
    }

    setError("");
    setSuccess("");

    const validationError = validateForm({
      requireFile: false,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!video?.id) {
      setError("The video being edited could not be determined.");
      return;
    }

    setUploading(true);
    setUploadStep("Saving video changes...");
    setUploadProgress(0);

    try {
      const url =
        `/api/admin/academy/courses/${courseId}` +
        `/modules/${moduleId}` +
        `/videos/${video.id}`;

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          sort_order: Number(sortOrder),
          status,
        }),
      });

      const data = await parseResponse(response);

      console.log(
        "[Academy Video Edit] PATCH response:",
        response.status,
        data,
      );

      if (!response.ok) {
        throw new Error(
          data?.error || `Failed to update video (${response.status}).`,
        );
      }

      setUploadProgress(100);
      setUploadStep("Complete");
      setSuccess("Video updated successfully.");

      if (onSaved) {
        await onSaved(data?.video || video);
      }

      setTimeout(() => {
        onClose?.();
      }, 500);
    } catch (err) {
      console.error("[Academy Video Edit] Error:", err);

      setUploadStep("");

      setError(
        err?.message || "Something went wrong while updating the video.",
      );
    } finally {
      setUploading(false);
    }
  }

  ////////////////////////////////////////////////////////////
  // CREATE VIDEO
  ////////////////////////////////////////////////////////////

  async function handleCreate() {
    if (uploading) {
      return;
    }

    setError("");
    setSuccess("");
    setUploadProgress(0);

    ////////////////////////////////////////////////////////////
    // VALIDATION
    ////////////////////////////////////////////////////////////

    const validationError = validateForm({
      requireFile: true,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    const parsedSortOrder = Number(sortOrder);

    setUploading(true);
    setUploadProgress(0);

    try {
      ////////////////////////////////////////////////////////////
      // STEP 1
      // PREPARE BUNNY UPLOAD
      ////////////////////////////////////////////////////////////

      setUploadStep("Preparing Bunny upload...");

      const uploadCredentialsUrl =
        `/api/admin/academy/courses/${courseId}` +
        `/modules/${moduleId}` +
        `/videos/upload-credentials`;

      const credentialsResponse = await fetch(uploadCredentialsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          fileName: file.name,
        }),
      });

      const credentialsData = await parseResponse(credentialsResponse);

      console.log(
        "[Academy Upload] Credentials response:",
        credentialsResponse.status,
        credentialsData,
      );

      if (!credentialsResponse.ok) {
        throw new Error(
          credentialsData?.error ||
            `Upload preparation failed (${credentialsResponse.status}).`,
        );
      }

      ////////////////////////////////////////////////////////////
      // VALIDATE BUNNY RESPONSE
      ////////////////////////////////////////////////////////////

      if (!credentialsData?.videoId) {
        throw new Error(
          "Bunny preparation succeeded but no videoId was returned.",
        );
      }

      if (!credentialsData?.signature) {
        throw new Error(
          "Bunny preparation succeeded but no upload signature was returned.",
        );
      }

      if (!credentialsData?.expirationTime) {
        throw new Error(
          "Bunny preparation succeeded but no expiration time was returned.",
        );
      }

      if (!credentialsData?.endpoint) {
        throw new Error(
          "Bunny preparation succeeded but no TUS endpoint was returned.",
        );
      }

      if (!credentialsData?.libraryId) {
        throw new Error(
          "Bunny preparation succeeded but no libraryId was returned.",
        );
      }

      ////////////////////////////////////////////////////////////
      // STEP 2
      // TUS UPLOAD
      ////////////////////////////////////////////////////////////

      setUploadStep("Uploading video to Bunny...");

      await new Promise((resolve, reject) => {
        let finished = false;

        const upload = new tus.Upload(file, {
          endpoint: credentialsData.endpoint,

          retryDelays: [0, 3000, 5000, 10000, 20000, 30000],

          headers: {
            AuthorizationSignature: credentialsData.signature,
            AuthorizationExpire: String(credentialsData.expirationTime),
            VideoId: credentialsData.videoId,
            LibraryId: String(credentialsData.libraryId),
          },

          metadata: {
            filetype: file.type || "video/mp4",
            title: title.trim(),
          },

          onError(error) {
            console.error("[Academy Upload] Bunny TUS error:", error);

            if (finished) {
              return;
            }

            finished = true;

            reject(new Error(error?.message || "Bunny TUS upload failed."));
          },

          onProgress(bytesUploaded, bytesTotal) {
            if (!bytesTotal) {
              return;
            }

            const percentage = (bytesUploaded / bytesTotal) * 100;

            const rounded = Math.min(100, Math.round(percentage));

            setUploadProgress(rounded);

            setUploadStep(`Uploading video to Bunny... ${rounded}%`);
          },

          onSuccess() {
            console.log("[Academy Upload] Bunny TUS upload completed.");

            if (finished) {
              return;
            }

            finished = true;

            setUploadProgress(100);
            setUploadStep("Bunny upload complete. Saving video...");

            resolve();
          },
        });

        try {
          upload.start();
        } catch (err) {
          console.error("[Academy Upload] Failed to start TUS:", err);

          if (!finished) {
            finished = true;

            reject(new Error(err?.message || "Unable to start Bunny upload."));
          }
        }
      });

      ////////////////////////////////////////////////////////////
      // STEP 3
      // SAVE VIDEO TO DATABASE
      //
      // academy_module_videos fields:
      //
      // module_id
      // title
      // description
      // duration_seconds
      // sort_order
      // status
      // bunny_video_id
      // thumbnail_url
      ////////////////////////////////////////////////////////////

      setUploadStep("Saving video to academy...");

      const videosUrl =
        `/api/admin/academy/courses/${courseId}` +
        `/modules/${moduleId}` +
        `/videos`;

      const videoResponse = await fetch(videosUrl, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          title: title.trim(),

          description: description.trim() || null,

          bunny_video_id: credentialsData.videoId,

          duration_seconds: null,

          sort_order: parsedSortOrder,

          status,

          thumbnail_url: credentialsData.thumbnailUrl || null,
        }),
      });

      const videoData = await parseResponse(videoResponse);

      console.log(
        "[Academy Upload] Database save response:",
        videoResponse.status,
        videoData,
      );

      if (!videoResponse.ok) {
        throw new Error(
          `Video uploaded to Bunny, but academy database save failed: ${
            videoData?.error || `HTTP ${videoResponse.status}`
          }`,
        );
      }

      ////////////////////////////////////////////////////////////
      // SUCCESS
      ////////////////////////////////////////////////////////////

      setUploadProgress(100);
      setUploadStep("Complete");
      setSuccess("Video uploaded successfully.");

      if (onSaved) {
        await onSaved(videoData?.video);
      }

      setTimeout(() => {
        onClose?.();
      }, 800);
    } catch (err) {
      console.error("[Academy Upload] Upload failed:", err);

      setUploadStep("");

      setError(
        err?.message || "Something went wrong while uploading the video.",
      );
    } finally {
      setUploading(false);
    }
  }

  ////////////////////////////////////////////////////////////
  // SUBMIT
  ////////////////////////////////////////////////////////////

  function handleSubmit() {
    if (isEditMode) {
      return handleEdit();
    }

    return handleCreate();
  }

  ////////////////////////////////////////////////////////////
  // CLOSED
  ////////////////////////////////////////////////////////////

  if (!open) {
    return null;
  }

  ////////////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////////////

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4">
      <div className="flex max-h-[96vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-2xl">
        {/* HEADER */}

        <div className="shrink-0 border-b border-neutral-200 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-neutral-900 sm:text-xl">
                {isEditMode ? "Edit Course Video" : "Add Course Video"}
              </h2>

              <p className="mt-1 text-xs leading-5 text-neutral-500 sm:text-sm">
                {isEditMode
                  ? "Update the video lesson details."
                  : "Upload a video directly to Bunny Stream."}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              aria-label="Close dialog"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-10"
            >
              ×
            </button>
          </div>
        </div>

        {/* BODY */}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
          <div className="space-y-5">
            {/* FILE */}

            {!isEditMode && (
              <div>
                <label
                  htmlFor="course-video-file"
                  className="mb-2 block text-sm font-medium text-neutral-700"
                >
                  Video file
                </label>

                <label
                  htmlFor="course-video-file"
                  className={`flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 text-center transition ${
                    uploading
                      ? "cursor-not-allowed border-neutral-200 bg-neutral-50"
                      : "border-neutral-300 bg-neutral-50 hover:border-blue-400 hover:bg-blue-50/40"
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg">
                    🎬
                  </div>

                  <div className="mt-2 text-sm font-medium text-neutral-800">
                    {file ? "Choose a different video" : "Choose a video file"}
                  </div>

                  <div className="mt-1 text-xs text-neutral-500">
                    MP4, WebM, MOV and other supported formats
                  </div>

                  <input
                    id="course-video-file"
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="sr-only"
                  />
                </label>

                {file && (
                  <div className="mt-3 flex min-w-0 flex-col gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div
                        className="truncate text-sm font-medium text-neutral-800"
                        title={file.name}
                      >
                        {file.name}
                      </div>

                      <div className="mt-1 text-xs text-neutral-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>

                    {!uploading && (
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="self-start text-xs font-medium text-red-600 hover:text-red-700 sm:self-auto"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* EXISTING BUNNY VIDEO */}

            {isEditMode && (
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Bunny Video
                </div>

                <div className="mt-1 break-all font-mono text-sm text-neutral-700">
                  {video?.bunny_video_id || "Unavailable"}
                </div>

                <p className="mt-2 text-xs leading-5 text-neutral-500">
                  Editing this record changes its academy details. The existing
                  Bunny video is not replaced.
                </p>
              </div>
            )}

            {/* TITLE */}

            <div>
              <label
                htmlFor="video-title"
                className="mb-2 block text-sm font-medium text-neutral-700"
              >
                Title
              </label>

              <input
                id="video-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploading}
                placeholder="Introduction to Hair Installation"
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-neutral-50"
              />
            </div>

            {/* DESCRIPTION */}

            <div>
              <label
                htmlFor="video-description"
                className="mb-2 block text-sm font-medium text-neutral-700"
              >
                Description
              </label>

              <textarea
                id="video-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploading}
                rows={4}
                placeholder="Describe what students will learn in this video..."
                className="w-full resize-y rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-neutral-50"
              />
            </div>

            {/* SORT ORDER */}

            <div>
              <label
                htmlFor="video-sort-order"
                className="mb-2 block text-sm font-medium text-neutral-700"
              >
                Video position
              </label>

              <input
                id="video-sort-order"
                type="number"
                min="0"
                step="1"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                disabled={uploading}
                placeholder="0"
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-neutral-50"
              />

              <p className="mt-1.5 text-xs leading-5 text-neutral-500">
                Determines the video's position inside this module. Position
                starts at 0.
              </p>
            </div>

            {/* STATUS */}

            <div>
              <label
                htmlFor="video-status"
                className="mb-2 block text-sm font-medium text-neutral-700"
              >
                Status
              </label>

              <select
                id="video-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={uploading}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-neutral-50"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* PROGRESS */}

            {uploading && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate font-medium text-blue-900">
                    {uploadStep ||
                      (isEditMode ? "Saving changes..." : "Uploading video...")}
                  </span>

                  <span className="shrink-0 font-semibold text-blue-900">
                    {uploadProgress}%
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-300"
                    style={{
                      width: `${uploadProgress}%`,
                    }}
                  />
                </div>

                {!isEditMode && (
                  <p className="mt-2 text-xs leading-5 text-blue-700">
                    Keep this browser tab open until the upload finishes.
                  </p>
                )}
              </div>
            )}

            {/* ERROR */}

            {error && (
              <div
                role="alert"
                className="break-words rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
              >
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div
                role="status"
                className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-700"
              >
                {success}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}

        <div className="shrink-0 border-t border-neutral-200 bg-white px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="w-full rounded-xl border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={uploading}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {uploading
                ? isEditMode
                  ? "Saving..."
                  : `Uploading ${uploadProgress}%`
                : isEditMode
                  ? "Save Changes"
                  : "Upload Video"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

//////////////////////////////////////////////////////////////
// CONSTANTS
//////////////////////////////////////////////////////////////

const ALLOWED_STATUSES = ["draft", "published", "archived"];
