"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  GraduationCap,
  Loader2,
  Play,
  Video,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AcademyModuleClient({ data }) {
  const {
    student,
    course,
    enrollment,
    module,
    progress,
    courseProgress,
    navigation,
  } = data;

  // ==========================================================
  // MODULE VIDEOS
  // ==========================================================

  const videos = Array.isArray(module?.videos) ? module.videos : [];

  // ==========================================================
  // MODULE PROGRESS
  // ==========================================================

  const [progressSeconds, setProgressSeconds] = useState(
    progress?.progressSeconds ?? 0,
  );

  const [completed, setCompleted] = useState(progress?.completed === true);

  const [saving, setSaving] = useState(false);

  const saveTimerRef = useRef(null);

  // ==========================================================
  // SAVE PROGRESS
  // ==========================================================

  const saveProgress = useCallback(
    async (seconds, markCompleted = false) => {
      try {
        setSaving(true);

        const response = await fetch(
          `/api/academy/courses/${course.id}/modules/${module.id}/progress`,
          {
            method: "PATCH",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              progressSeconds: seconds,
              completed: markCompleted,
            }),
          },
        );

        const result = await response.json();

        if (!response.ok) {
          console.error("Academy module progress save failed:", result);

          return;
        }

        if (result.progress) {
          setProgressSeconds(
            result.progress.progress_seconds ??
              result.progress.progressSeconds ??
              seconds,
          );

          setCompleted(result.progress.completed === true);
        }
      } catch (error) {
        console.error("Academy module progress request failed:", error);
      } finally {
        setSaving(false);
      }
    },
    [course.id, module.id],
  );

  // ==========================================================
  // CLEANUP AUTO-SAVE TIMER
  // ==========================================================

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  // ==========================================================
  // HANDLE PROGRESS CHANGE
  // ==========================================================

  const handleProgressChange = (value) => {
    const seconds = Math.max(0, Math.floor(Number(value) || 0));

    setProgressSeconds(seconds);

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      saveProgress(seconds, false);
    }, 800);
  };

  // ==========================================================
  // COMPLETE MODULE
  // ==========================================================

  const handleComplete = async () => {
    await saveProgress(progressSeconds, true);
  };

  // ==========================================================
  // HELPERS
  // ==========================================================

  const totalModules = courseProgress?.totalModules ?? 0;

  const completedModules = courseProgress?.completedModules ?? 0;

  const coursePercentage = courseProgress?.progressPercentage ?? 0;

  const moduleIndex = (navigation?.currentIndex ?? 0) + 1;

  const formatDuration = (seconds) => {
    const totalSeconds = Math.max(0, Number(seconds) || 0);

    const hours = Math.floor(totalSeconds / 3600);

    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const remainingSeconds = Math.floor(totalSeconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }

    return `${remainingSeconds}s`;
  };

  // ==========================================================
  // BUNNY PLAYER URL
  //
  // IMPORTANT:
  //
  // The signed URL must be generated on the SERVER.
  //
  // The client should NEVER use:
  //
  // process.env.BUNNY_STREAM_TOKEN_KEY
  //
  // and should NOT construct the Bunny token itself.
  //
  // The API should return:
  //
  // bunnyEmbedUrl
  //
  // or:
  //
  // bunny_embed_url
  // ==========================================================

  const getVideoUrl = (video) => {
    return video?.bunnyEmbedUrl || null;
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ======================================================
            BACK
        ====================================================== */}

        <div className="mb-6">
          <Link
            href={`/academy/dashboard/courses/${course.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to {course.title}
          </Link>
        </div>

        {/* ======================================================
            HEADER
        ====================================================== */}

        <Card className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#C6A667]/10">
                  <BookOpen className="h-6 w-6 text-[#C6A667]" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C6A667]">
                    {course.title}
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                    {module.title}
                  </h1>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                      Module {moduleIndex}
                      {totalModules ? ` of ${totalModules}` : ""}
                    </Badge>

                    {module.module_code && (
                      <Badge variant="outline">{module.module_code}</Badge>
                    )}

                    {videos.length > 0 && (
                      <Badge
                        variant="outline"
                        className="gap-1 border-[#C6A667]/30 text-[#8f722f]"
                      >
                        <Video className="h-3.5 w-3.5" />
                        {videos.length}{" "}
                        {videos.length === 1 ? "Video" : "Videos"}
                      </Badge>
                    )}

                    {completed && (
                      <Badge className="gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="shrink-0 text-left sm:text-right">
                <p className="text-xs text-neutral-500">Course progress</p>

                <p className="mt-1 text-2xl font-bold text-neutral-900">
                  {coursePercentage}%
                </p>
              </div>
            </div>

            {/* ==================================================
                COURSE PROGRESS
            ================================================== */}

            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-neutral-500">
                  {completedModules} of {totalModules} modules completed
                </span>

                {saving && (
                  <span className="inline-flex items-center gap-1 text-neutral-400">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving
                  </span>
                )}
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-[#C6A667] transition-all"
                  style={{
                    width: `${Math.min(Math.max(coursePercentage, 0), 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* ======================================================
            MODULE CONTENT
        ====================================================== */}

        <Card className="mt-6 rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-[#C6A667]" />

            <h2 className="text-lg font-semibold text-neutral-900">
              Module Content
            </h2>
          </div>

          {module.description ? (
            <div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-neutral-600">
              {module.description}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed p-8 text-center">
              <p className="text-sm text-neutral-500">
                No written description has been added for this module yet.
              </p>
            </div>
          )}

          {/* ====================================================
              MODULE VIDEOS
          ==================================================== */}

          <div className="mt-10 border-t pt-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C6A667]/10">
                    <Video className="h-5 w-5 text-[#C6A667]" />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">
                      Module Videos
                    </h2>

                    <p className="text-sm text-neutral-500">
                      {videos.length > 0
                        ? `${videos.length} learning ${
                            videos.length === 1 ? "video" : "videos"
                          } available`
                        : "No videos have been added to this module yet."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================================================
                NO VIDEOS
            ================================================== */}

            {!videos.length ? (
              <div className="mt-6 rounded-2xl border border-dashed bg-neutral-50 p-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <Video className="h-6 w-6 text-neutral-400" />
                </div>

                <p className="mt-4 font-medium text-neutral-700">
                  No videos available yet
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  Videos for this module will appear here when they are
                  published.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-8">
                {videos.map((video, index) => {
                  const videoUrl = getVideoUrl(video);

                  return (
                    <div
                      key={video.id}
                      className="overflow-hidden rounded-2xl border bg-white"
                    >
                      {/* ==========================================
                          VIDEO PLAYER
                      ========================================== */}

                      <div className="relative aspect-video w-full bg-black">
                        {videoUrl ? (
                          <iframe
                            src={videoUrl}
                            title={video.title || `Module video ${index + 1}`}
                            className="absolute inset-0 h-full w-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                            allowFullScreen
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center text-white">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                              <Play className="h-6 w-6 fill-current" />
                            </div>

                            <div>
                              <p className="font-medium">
                                Video is not available
                              </p>

                              <p className="mt-1 max-w-md px-4 text-sm text-white/60">
                                This video does not have a valid Bunny playback
                                URL.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ==========================================
                          VIDEO INFORMATION
                      ========================================== */}

                      <div className="p-5 sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant="outline"
                                className="border-[#C6A667]/30 text-[#8f722f]"
                              >
                                Video {index + 1}
                              </Badge>

                              {video.duration_seconds > 0 && (
                                <Badge variant="secondary">
                                  {formatDuration(video.duration_seconds)}
                                </Badge>
                              )}

                              {video.is_preview && (
                                <Badge variant="secondary">Preview</Badge>
                              )}
                            </div>

                            <h3 className="mt-3 text-lg font-semibold text-neutral-900">
                              {video.title || `Module Video ${index + 1}`}
                            </h3>

                            {video.description && (
                              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-600">
                                {video.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ====================================================
              PROGRESS POSITION
          ==================================================== */}

          <div className="mt-10 rounded-2xl bg-neutral-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  Learning progress
                </p>

                <p className="mt-1 text-xs text-neutral-500">
                  Saved position: {progressSeconds} seconds
                </p>
              </div>

              <input
                type="number"
                min="0"
                value={progressSeconds}
                onChange={(event) => handleProgressChange(event.target.value)}
                className="h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:border-[#C6A667] focus:ring-2 focus:ring-[#C6A667]/20 sm:w-40"
              />
            </div>
          </div>

          {/* ====================================================
              COMPLETE
          ==================================================== */}

          <div className="mt-6">
            {completed ? (
              <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                <CheckCircle2 className="h-5 w-5 shrink-0" />

                <span>You have completed this module.</span>
              </div>
            ) : (
              <Button
                type="button"
                onClick={handleComplete}
                disabled={saving}
                className="w-full sm:w-auto"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark Module Complete
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>

        {/* ======================================================
            NAVIGATION
        ====================================================== */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {navigation?.previousModule ? (
            <Link
              href={`/academy/dashboard/courses/${course.id}/modules/${navigation.previousModule.id}`}
            >
              <Card className="h-full rounded-2xl border bg-white p-5 shadow-sm transition hover:border-neutral-300 hover:shadow-md">
                <p className="text-xs uppercase tracking-wider text-neutral-400">
                  Previous Module
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4 text-[#C6A667]" />

                  <p className="font-semibold text-neutral-900">
                    {navigation.previousModule.title}
                  </p>
                </div>
              </Card>
            </Link>
          ) : (
            <div />
          )}

          {navigation?.nextModule ? (
            <Link
              href={`/academy/dashboard/courses/${course.id}/modules/${navigation.nextModule.id}`}
            >
              <Card className="h-full rounded-2xl border bg-white p-5 shadow-sm transition hover:border-neutral-300 hover:shadow-md">
                <p className="text-xs uppercase tracking-wider text-neutral-400">
                  Next Module
                </p>

                <div className="mt-2 flex items-center justify-end gap-2 text-right">
                  <p className="font-semibold text-neutral-900">
                    {navigation.nextModule.title}
                  </p>

                  <ArrowRight className="h-4 w-4 text-[#C6A667]" />
                </div>
              </Card>
            </Link>
          ) : (
            <Card className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-[#C6A667]">
                Course Complete
              </p>

              <p className="mt-2 font-semibold text-neutral-900">
                You have reached the final module.
              </p>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
