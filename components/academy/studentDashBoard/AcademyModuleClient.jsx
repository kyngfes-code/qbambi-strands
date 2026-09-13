"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  GraduationCap,
  Loader2,
  Lock,
  Video,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ==========================================================
// CONFIG
// ==========================================================

const VIDEO_COMPLETION_PERCENTAGE = 90;

// Debounce progress saves so we don't send a request every second.
const VIDEO_SAVE_DELAY = 1500;

// Bunny Player.js CDN.
const PLAYER_JS_SRC =
  "https://assets.mediadelivery.net/playerjs/player-0.1.0.min.js";

// ==========================================================
// COMPONENT
// ==========================================================

export default function AcademyModuleClient({ data }) {
  const { course, module, progress, courseProgress, navigation } = data;

  // ==========================================================
  // MODULE VIDEOS
  // ==========================================================

  const videos = useMemo(() => {
    return Array.isArray(module?.videos) ? module.videos : [];
  }, [module?.videos]);

  // ==========================================================
  // DEBUG HELPER
  // ==========================================================

  const debug = useCallback((label, payload = {}) => {
    console.log(
      `%c[ACADEMY DEBUG] ${label}`,
      "color: #C6A667; font-weight: bold;",
      payload,
    );
  }, []);

  // ==========================================================
  // DEBUG INITIAL DATA
  // ==========================================================

  useEffect(() => {
    debug("COMPONENT DATA RECEIVED", {
      course,
      module,
      progress,
      courseProgress,
      navigation,
      videos,
    });
  }, [course, module, progress, courseProgress, navigation, videos, debug]);

  // ==========================================================
  // IFRAME REFERENCES
  // ==========================================================

  const iframeRefs = useRef({});

  // ==========================================================
  // PLAYER.JS REFERENCES
  // ==========================================================

  const playerRefs = useRef({});

  const playerInitializedRef = useRef({});

  // ==========================================================
  // SAVE TIMERS
  // ==========================================================

  const saveTimersRef = useRef({});

  // ==========================================================
  // PREVENT DUPLICATE SAVES
  // ==========================================================

  const savingVideoRef = useRef({});

  // ==========================================================
  // INITIAL VIDEO PROGRESS
  // ==========================================================

  const getInitialVideoProgress = useCallback(() => {
    const initial = {};

    videos.forEach((video) => {
      const saved =
        video?.progress || video?.videoProgress || video?.studentProgress || {};

      initial[video.id] = {
        watchedSeconds: Math.max(
          0,
          Number(saved?.watched_seconds ?? saved?.watchedSeconds ?? 0),
        ),

        durationSeconds: Math.max(
          0,
          Number(
            saved?.duration_seconds ??
              saved?.durationSeconds ??
              video?.duration_seconds ??
              video?.durationSeconds ??
              0,
          ),
        ),

        watchPercentage: Math.min(
          100,
          Math.max(
            0,
            Number(saved?.watch_percentage ?? saved?.watchPercentage ?? 0),
          ),
        ),

        reachedEnd: saved?.reached_end === true || saved?.reachedEnd === true,

        completed: saved?.completed === true,

        confirmedGood:
          saved?.confirmed_good === true || saved?.confirmedGood === true,
      };
    });

    debug("INITIAL VIDEO PROGRESS", initial);

    return initial;
  }, [videos, debug]);

  // ==========================================================
  // VIDEO PROGRESS STATE
  // ==========================================================

  const [videoProgress, setVideoProgress] = useState(getInitialVideoProgress);

  const videoProgressRef = useRef(videoProgress);

  useEffect(() => {
    videoProgressRef.current = videoProgress;

    debug("VIDEO PROGRESS STATE CHANGED", videoProgress);
  }, [videoProgress, debug]);

  // ==========================================================
  // MODULE COMPLETION STATE
  // ==========================================================

  const [completed, setCompleted] = useState(progress?.completed === true);

  useEffect(() => {
    debug("MODULE COMPLETION STATE FROM SERVER", {
      completed: progress?.completed,
    });

    setCompleted(progress?.completed === true);
  }, [progress?.completed, debug]);

  // ==========================================================
  // SAVING STATE
  // ==========================================================

  const [savingVideoId, setSavingVideoId] = useState(null);

  const [savingModule, setSavingModule] = useState(false);

  // ==========================================================
  // SYNC INITIAL SERVER DATA
  // ==========================================================

  useEffect(() => {
    debug("SYNCING VIDEO PROGRESS FROM SERVER DATA");

    setVideoProgress(getInitialVideoProgress());
  }, [getInitialVideoProgress, debug]);

  // ==========================================================
  // LOAD BUNNY PLAYER.JS
  // ==========================================================

  const [playerJsReady, setPlayerJsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // Already available.
    if (window.playerjs?.Player) {
      debug("PLAYER.JS ALREADY AVAILABLE", {
        playerjs: window.playerjs,
      });

      setPlayerJsReady(true);

      return;
    }

    // Check if script already exists.
    const existingScript = document.querySelector(
      `script[src="${PLAYER_JS_SRC}"]`,
    );

    if (existingScript) {
      debug("PLAYER.JS SCRIPT ALREADY EXISTS");

      const handleExistingLoad = () => {
        debug("EXISTING PLAYER.JS SCRIPT LOADED", {
          playerjs: window.playerjs,
        });

        if (window.playerjs?.Player) {
          setPlayerJsReady(true);
        } else {
          console.error(
            "[ACADEMY DEBUG] PLAYER.JS LOADED BUT window.playerjs.Player IS MISSING",
            window.playerjs,
          );
        }
      };

      existingScript.addEventListener("load", handleExistingLoad);

      if (window.playerjs?.Player) {
        setPlayerJsReady(true);
      }

      return () => {
        existingScript.removeEventListener("load", handleExistingLoad);
      };
    }

    debug("LOADING PLAYER.JS", {
      src: PLAYER_JS_SRC,
    });

    const script = document.createElement("script");

    script.src = PLAYER_JS_SRC;

    script.async = true;

    script.onload = () => {
      debug("PLAYER.JS LOADED SUCCESSFULLY", {
        playerjs: window.playerjs,
      });

      if (window.playerjs?.Player) {
        setPlayerJsReady(true);
      } else {
        console.error(
          "[ACADEMY DEBUG] PLAYER.JS SCRIPT LOADED BUT PLAYER CONSTRUCTOR IS MISSING",
          window.playerjs,
        );
      }
    };

    script.onerror = (error) => {
      console.error("[ACADEMY DEBUG] FAILED TO LOAD BUNNY PLAYER.JS", {
        src: PLAYER_JS_SRC,
        error,
      });
    };

    document.head.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, [debug]);

  // ==========================================================
  // CLEANUP
  // ==========================================================

  useEffect(() => {
    return () => {
      debug("COMPONENT UNMOUNTING");

      // Clear pending save timers.
      Object.values(saveTimersRef.current).forEach((timer) => {
        if (timer) {
          clearTimeout(timer);
        }
      });

      saveTimersRef.current = {};

      // Destroy player references.
      playerRefs.current = {};

      playerInitializedRef.current = {};
    };
  }, [debug]);

  // ==========================================================
  // GET VIDEO PROGRESS
  // ==========================================================

  const getVideoProgress = useCallback((videoId) => {
    return (
      videoProgressRef.current?.[videoId] || {
        watchedSeconds: 0,
        durationSeconds: 0,
        watchPercentage: 0,
        reachedEnd: false,
        completed: false,
        confirmedGood: false,
      }
    );
  }, []);

  // ==========================================================
  // VIDEO COMPLETION CHECK
  // ==========================================================

  const isVideoCompleted = useCallback(
    (video) => {
      if (!video?.id) {
        return false;
      }

      const current = getVideoProgress(video.id);

      return (
        current.completed === true ||
        current.reachedEnd === true ||
        Number(current.watchPercentage || 0) >= VIDEO_COMPLETION_PERCENTAGE
      );
    },
    [getVideoProgress],
  );

  // ==========================================================
  // MODULE PROGRESS
  // ==========================================================

  const moduleProgress = useMemo(() => {
    if (!videos.length) {
      return {
        completedVideos: 0,
        totalVideos: 0,
        percentage: completed ? 100 : 0,
        allCompleted: completed,
      };
    }

    const completedVideos = videos.filter((video) =>
      isVideoCompleted(video),
    ).length;

    const percentage = Math.round((completedVideos / videos.length) * 100);

    return {
      completedVideos,
      totalVideos: videos.length,
      percentage,
      allCompleted: completedVideos === videos.length,
    };
  }, [videos, completed, isVideoCompleted]);

  // ==========================================================
  // SAVE VIDEO PROGRESS
  // ==========================================================

  const saveVideoProgress = useCallback(
    async (video, progressData) => {
      if (!video?.id) {
        return null;
      }

      // Prevent simultaneous saves for same video.
      if (savingVideoRef.current[video.id]) {
        debug("VIDEO SAVE SKIPPED - ALREADY SAVING", {
          videoId: video.id,
        });

        return null;
      }

      savingVideoRef.current[video.id] = true;

      try {
        setSavingVideoId(video.id);

        const payload = {
          watchedSeconds: Math.max(
            0,
            Math.floor(Number(progressData.watchedSeconds) || 0),
          ),

          durationSeconds:
            Number(progressData.durationSeconds) > 0
              ? Number(progressData.durationSeconds)
              : null,

          completed: progressData.completed === true,

          reachedEnd: progressData.reachedEnd === true,

          confirmedGood: progressData.confirmedGood === true,
        };

        const endpoint =
          `/api/academy/courses/${course.id}` +
          `/modules/${module.id}` +
          `/videos/${video.id}/progress`;

        debug("SAVING VIDEO PROGRESS", {
          videoId: video.id,
          endpoint,
          payload,
        });

        const response = await fetch(endpoint, {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        });

        let result = null;

        try {
          result = await response.json();
        } catch (error) {
          console.error("[ACADEMY DEBUG] FAILED TO PARSE VIDEO SAVE RESPONSE", {
            videoId: video.id,
            error,
          });
        }

        debug("VIDEO SAVE RESPONSE", {
          videoId: video.id,
          status: response.status,
          ok: response.ok,
          result,
        });

        if (!response.ok) {
          console.error("[ACADEMY DEBUG] VIDEO PROGRESS SAVE FAILED", {
            videoId: video.id,
            status: response.status,
            result,
          });

          return null;
        }

        const saved =
          result?.progress || result?.videoProgress || result?.video || null;

        if (!saved) {
          console.error(
            "[ACADEMY DEBUG] VIDEO SAVE RETURNED NO PROGRESS DATA",
            {
              videoId: video.id,
              result,
            },
          );

          return null;
        }

        const normalized = {
          watchedSeconds: Math.max(
            0,
            Number(
              saved?.watched_seconds ??
                saved?.watchedSeconds ??
                progressData.watchedSeconds ??
                0,
            ),
          ),

          durationSeconds: Math.max(
            0,
            Number(
              saved?.duration_seconds ??
                saved?.durationSeconds ??
                progressData.durationSeconds ??
                0,
            ),
          ),

          watchPercentage: Math.min(
            100,
            Math.max(
              0,
              Number(
                saved?.watch_percentage ??
                  saved?.watchPercentage ??
                  progressData.watchPercentage ??
                  0,
              ),
            ),
          ),

          reachedEnd:
            saved?.reached_end === true ||
            saved?.reachedEnd === true ||
            progressData.reachedEnd === true,

          completed:
            saved?.completed === true || progressData.completed === true,

          confirmedGood:
            saved?.confirmed_good === true ||
            saved?.confirmedGood === true ||
            progressData.confirmedGood === true,
        };

        debug("VIDEO PROGRESS NORMALIZED", {
          videoId: video.id,
          normalized,
        });

        setVideoProgress((previous) => {
          const current = previous[video.id] || {};

          const next = {
            ...previous,

            [video.id]: {
              ...current,

              watchedSeconds: Math.max(
                Number(current.watchedSeconds || 0),
                Number(normalized.watchedSeconds || 0),
              ),

              durationSeconds:
                Number(normalized.durationSeconds || 0) ||
                Number(current.durationSeconds || 0),

              watchPercentage: Math.max(
                Number(current.watchPercentage || 0),
                Number(normalized.watchPercentage || 0),
              ),

              reachedEnd:
                current.reachedEnd === true || normalized.reachedEnd === true,

              completed:
                current.completed === true || normalized.completed === true,

              confirmedGood:
                current.confirmedGood === true ||
                normalized.confirmedGood === true,
            },
          };

          debug("VIDEO STATE UPDATED FROM SERVER", {
            videoId: video.id,
            progress: next[video.id],
          });

          return next;
        });

        return normalized;
      } catch (error) {
        console.error("[ACADEMY DEBUG] VIDEO PROGRESS REQUEST FAILED", {
          videoId: video.id,
          error,
        });

        return null;
      } finally {
        delete savingVideoRef.current[video.id];

        setSavingVideoId((current) => (current === video.id ? null : current));
      }
    },
    [course.id, module.id, debug],
  );

  // ==========================================================
  // QUEUE VIDEO SAVE
  // ==========================================================

  const queueVideoSave = useCallback(
    (video, progressData) => {
      if (!video?.id) {
        return;
      }

      if (saveTimersRef.current[video.id]) {
        clearTimeout(saveTimersRef.current[video.id]);

        debug("PREVIOUS VIDEO SAVE TIMER CLEARED", {
          videoId: video.id,
        });
      }

      debug("VIDEO SAVE QUEUED", {
        videoId: video.id,
        delay: VIDEO_SAVE_DELAY,
        progressData,
      });

      saveTimersRef.current[video.id] = setTimeout(() => {
        delete saveTimersRef.current[video.id];

        debug("VIDEO SAVE TIMER FIRED", {
          videoId: video.id,
        });

        saveVideoProgress(video, progressData);
      }, VIDEO_SAVE_DELAY);
    },
    [saveVideoProgress, debug],
  );

  // ==========================================================
  // HANDLE VIDEO PROGRESS
  // ==========================================================

  const handleVideoProgress = useCallback(
    ({ video, watchedSeconds, durationSeconds }) => {
      if (!video?.id) {
        return;
      }

      const current = getVideoProgress(video.id);

      if (current.completed === true) {
        debug("VIDEO PROGRESS IGNORED - ALREADY COMPLETED", {
          videoId: video.id,
        });

        return;
      }

      const safeDuration = Math.max(
        0,
        Number(
          durationSeconds ||
            current.durationSeconds ||
            video.duration_seconds ||
            video.durationSeconds ||
            0,
        ) || 0,
      );

      const safeWatched = Math.max(0, Number(watchedSeconds) || 0);

      const calculatedPercentage =
        safeDuration > 0
          ? Math.min(100, (safeWatched / safeDuration) * 100)
          : 0;

      const nextPercentage = Math.max(
        Number(current.watchPercentage || 0),
        calculatedPercentage,
      );

      const shouldComplete = nextPercentage >= VIDEO_COMPLETION_PERCENTAGE;

      const nextProgress = {
        watchedSeconds: Math.max(
          safeWatched,
          Number(current.watchedSeconds || 0),
        ),

        durationSeconds: safeDuration || Number(current.durationSeconds || 0),

        watchPercentage: nextPercentage,

        reachedEnd: false,

        completed: shouldComplete,

        confirmedGood: current.confirmedGood === true,
      };

      debug("HANDLE VIDEO PROGRESS", {
        videoId: video.id,
        watchedSeconds,
        durationSeconds,
        current,
        nextProgress,
      });

      setVideoProgress((previous) => ({
        ...previous,

        [video.id]: {
          ...(previous[video.id] || {}),
          ...nextProgress,
        },
      }));

      // Immediately save completion.
      if (shouldComplete) {
        debug("VIDEO HIT COMPLETION THRESHOLD", {
          videoId: video.id,
          percentage: nextPercentage,
        });

        if (saveTimersRef.current[video.id]) {
          clearTimeout(saveTimersRef.current[video.id]);

          delete saveTimersRef.current[video.id];
        }

        saveVideoProgress(video, nextProgress);

        return;
      }

      queueVideoSave(video, nextProgress);
    },
    [getVideoProgress, queueVideoSave, saveVideoProgress, debug],
  );

  // ==========================================================
  // HANDLE VIDEO ENDED
  // ==========================================================

  const handleVideoEnded = useCallback(
    async (video) => {
      if (!video?.id) {
        return;
      }

      debug("BUNNY VIDEO ENDED EVENT", {
        videoId: video.id,
      });

      if (saveTimersRef.current[video.id]) {
        clearTimeout(saveTimersRef.current[video.id]);

        delete saveTimersRef.current[video.id];
      }

      const current = getVideoProgress(video.id);

      const knownDuration = Math.max(
        Number(current.durationSeconds || 0),
        Number(video.duration_seconds || video.durationSeconds || 0),
      );

      const finalProgress = {
        watchedSeconds:
          knownDuration > 0
            ? knownDuration
            : Math.max(Number(current.watchedSeconds || 0), 1),

        durationSeconds: knownDuration,

        watchPercentage: 100,

        reachedEnd: true,

        completed: true,

        confirmedGood: current.confirmedGood === true,
      };

      debug("FINAL VIDEO PROGRESS", {
        videoId: video.id,
        finalProgress,
      });

      setVideoProgress((previous) => ({
        ...previous,

        [video.id]: {
          ...(previous[video.id] || {}),
          ...finalProgress,
        },
      }));

      await saveVideoProgress(video, finalProgress);
    },
    [getVideoProgress, saveVideoProgress, debug],
  );

  // ==========================================================
  // INITIALIZE BUNNY PLAYERS
  // ==========================================================

  useEffect(() => {
    if (!playerJsReady) {
      debug("WAITING FOR PLAYER.JS BEFORE INITIALIZATION");

      return;
    }

    if (!window.playerjs?.Player) {
      console.error(
        "[ACADEMY DEBUG] PLAYER.JS READY BUT PLAYER CONSTRUCTOR IS MISSING",
      );

      return;
    }

    debug("INITIALIZING BUNNY PLAYERS", {
      videoCount: videos.length,
    });

    videos.forEach((video) => {
      if (!video?.id) {
        return;
      }

      if (playerInitializedRef.current[video.id]) {
        return;
      }

      const iframe = iframeRefs.current[video.id];

      if (!iframe) {
        debug("IFRAME NOT READY YET", {
          videoId: video.id,
        });

        return;
      }

      try {
        debug("CREATING PLAYER.JS INSTANCE", {
          videoId: video.id,
          iframeSrc: iframe.src,
        });

        const player = new window.playerjs.Player(iframe);

        playerRefs.current[video.id] = player;

        playerInitializedRef.current[video.id] = true;

        // ------------------------------------------------------
        // READY
        // ------------------------------------------------------

        player.on("ready", () => {
          debug("🐰 BUNNY PLAYER READY", {
            videoId: video.id,
          });

          // Get duration.
          try {
            player.getDuration((duration) => {
              const safeDuration = Number(duration) || 0;

              debug("BUNNY GET DURATION RESULT", {
                videoId: video.id,
                duration,
                safeDuration,
              });

              if (safeDuration > 0) {
                setVideoProgress((previous) => ({
                  ...previous,

                  [video.id]: {
                    ...(previous[video.id] || {}),

                    durationSeconds: Math.max(
                      Number(previous[video.id]?.durationSeconds || 0),
                      safeDuration,
                    ),
                  },
                }));
              }
            });
          } catch (error) {
            console.warn("[ACADEMY DEBUG] GET DURATION FAILED", {
              videoId: video.id,
              error,
            });
          }
        });

        // ------------------------------------------------------
        // PLAY
        // ------------------------------------------------------

        player.on("play", () => {
          debug("▶️ BUNNY PLAY EVENT", {
            videoId: video.id,
          });
        });

        // ------------------------------------------------------
        // PAUSE
        // ------------------------------------------------------

        player.on("pause", () => {
          debug("⏸️ BUNNY PAUSE EVENT", {
            videoId: video.id,
          });

          const current = getVideoProgress(video.id);

          debug("FORCING SAVE ON PAUSE", {
            videoId: video.id,
            current,
          });

          if (Number(current.watchedSeconds || 0) > 0) {
            if (saveTimersRef.current[video.id]) {
              clearTimeout(saveTimersRef.current[video.id]);

              delete saveTimersRef.current[video.id];
            }

            saveVideoProgress(video, current);
          }
        });

        // ------------------------------------------------------
        // TIME UPDATE
        // ------------------------------------------------------

        player.on("timeupdate", (timingData) => {
          debug("⏱️ BUNNY TIMEUPDATE EVENT", {
            videoId: video.id,
            timingData,
            type: typeof timingData,
          });

          let parsed = timingData;

          // Bunny Player.js may send JSON as a string.
          if (typeof parsed === "string") {
            try {
              parsed = JSON.parse(parsed);
            } catch (error) {
              console.warn(
                "[ACADEMY DEBUG] TIMEUPDATE DATA IS NOT VALID JSON",
                {
                  videoId: video.id,
                  timingData,
                  error,
                },
              );

              return;
            }
          }

          if (!parsed) {
            return;
          }

          const watchedSeconds =
            Number(
              parsed?.seconds ??
                parsed?.currentTime ??
                parsed?.current_time ??
                parsed?.time ??
                0,
            ) || 0;

          const durationSeconds =
            Number(
              parsed?.duration ??
                parsed?.durationSeconds ??
                parsed?.duration_seconds ??
                0,
            ) || 0;

          debug("TIMEUPDATE NORMALIZED", {
            videoId: video.id,
            watchedSeconds,
            durationSeconds,
            percentage:
              durationSeconds > 0
                ? (watchedSeconds / durationSeconds) * 100
                : 0,
          });

          handleVideoProgress({
            video,
            watchedSeconds,
            durationSeconds,
          });
        });

        // ------------------------------------------------------
        // ENDED
        // ------------------------------------------------------

        player.on("ended", () => {
          debug("🏁 BUNNY ENDED EVENT", {
            videoId: video.id,
          });

          handleVideoEnded(video);
        });

        // ------------------------------------------------------
        // ERROR
        // ------------------------------------------------------

        player.on("error", (errorData) => {
          console.error("[ACADEMY DEBUG] 🐰 BUNNY PLAYER ERROR", {
            videoId: video.id,
            errorData,
          });
        });

        debug("PLAYER EVENT LISTENERS ATTACHED", {
          videoId: video.id,
        });
      } catch (error) {
        console.error("[ACADEMY DEBUG] FAILED TO INITIALIZE BUNNY PLAYER", {
          videoId: video.id,
          error,
        });

        delete playerInitializedRef.current[video.id];
      }
    });
  }, [
    playerJsReady,
    videos,
    getVideoProgress,
    handleVideoProgress,
    handleVideoEnded,
    saveVideoProgress,
    debug,
  ]);

  // ==========================================================
  // SAVE MODULE COMPLETION
  // ==========================================================

  const saveModuleCompletion = useCallback(async () => {
    if (completed) {
      debug("MODULE COMPLETION SKIPPED - ALREADY COMPLETED");

      return;
    }

    try {
      setSavingModule(true);

      const endpoint =
        `/api/academy/courses/${course.id}` + `/modules/${module.id}/progress`;

      debug("SAVING MODULE COMPLETION", {
        endpoint,
      });

      const response = await fetch(endpoint, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          progressSeconds: 0,
          completed: true,
        }),
      });

      let result = null;

      try {
        result = await response.json();
      } catch {
        result = null;
      }

      debug("MODULE COMPLETION RESPONSE", {
        status: response.status,
        ok: response.ok,
        result,
      });

      if (!response.ok) {
        console.error("[ACADEMY DEBUG] MODULE COMPLETION FAILED", result);

        return;
      }

      if (result?.progress?.completed === true) {
        debug("MODULE SUCCESSFULLY COMPLETED");

        setCompleted(true);
      }
    } catch (error) {
      console.error("[ACADEMY DEBUG] MODULE COMPLETION REQUEST FAILED", error);
    } finally {
      setSavingModule(false);
    }
  }, [completed, course.id, module.id, debug]);

  // ==========================================================
  // AUTO COMPLETE MODULE
  // ==========================================================

  useEffect(() => {
    debug("CHECKING MODULE AUTO COMPLETION", {
      completed,
      videoCount: videos.length,
      moduleProgress,
    });

    if (completed) {
      return;
    }

    if (!videos.length) {
      return;
    }

    if (!moduleProgress.allCompleted) {
      return;
    }

    debug("ALL VIDEOS COMPLETED - COMPLETING MODULE");

    saveModuleCompletion();
  }, [
    completed,
    videos.length,
    moduleProgress.allCompleted,
    saveModuleCompletion,
    debug,
  ]);

  // ==========================================================
  // GET VIDEO URL
  // ==========================================================

  const getVideoUrl = useCallback((video) => {
    const rawUrl = video?.bunnyEmbedUrl || video?.bunny_embed_url || null;

    if (!rawUrl) {
      return null;
    }

    return rawUrl;
  }, []);

  // ==========================================================
  // FORMAT DURATION
  // ==========================================================

  const formatDuration = (seconds) => {
    const total = Math.max(0, Number(seconds) || 0);

    const hours = Math.floor(total / 3600);

    const minutes = Math.floor((total % 3600) / 60);

    const remainingSeconds = Math.floor(total % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }

    return `${remainingSeconds}s`;
  };

  // ==========================================================
  // COURSE DATA
  // ==========================================================

  const totalModules = courseProgress?.totalModules ?? 0;

  const completedModules = courseProgress?.completedModules ?? 0;

  const coursePercentage = courseProgress?.progressPercentage ?? 0;

  const moduleIndex = (navigation?.currentIndex ?? 0) + 1;

  const isSaving = savingModule || savingVideoId !== null;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ====================================================
            BACK
        ==================================================== */}

        <div className="mb-6">
          <Link
            href={`/academy/dashboard/courses/${course.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to {course.title}
          </Link>
        </div>

        {/* ====================================================
            HEADER
        ==================================================== */}

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

                    {videos.length > 0 && (
                      <Badge variant="outline">
                        <Video className="mr-1 h-3.5 w-3.5" />
                        {videos.length}{" "}
                        {videos.length === 1 ? "Video" : "Videos"}
                      </Badge>
                    )}

                    {completed && (
                      <Badge className="gap-1 bg-green-100 text-green-700 hover:bg-green-100">
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

            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-neutral-500">
                  {completedModules} of {totalModules} modules completed
                </span>

                {isSaving && (
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

        {/* ====================================================
            MODULE CONTENT
        ==================================================== */}

        <Card className="mt-6 rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-[#C6A667]" />

            <h2 className="text-lg font-semibold text-neutral-900">
              Module Content
            </h2>
          </div>

          {module.description && (
            <div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-neutral-600">
              {module.description}
            </div>
          )}

          {/* ==================================================
              MODULE PROGRESS
          ================================================== */}

          {videos.length > 0 && (
            <div className="mt-8 rounded-2xl border bg-neutral-50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    Module learning progress
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    {moduleProgress.completedVideos} of{" "}
                    {moduleProgress.totalVideos} videos completed
                  </p>
                </div>

                <p className="text-2xl font-bold text-neutral-900">
                  {moduleProgress.percentage}%
                </p>
              </div>

              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full rounded-full bg-[#C6A667] transition-all duration-500"
                  style={{
                    width: `${moduleProgress.percentage}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* ==================================================
              MODULE VIDEOS
          ================================================== */}

          <div className="mt-10 border-t pt-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C6A667]/10">
                <Video className="h-5 w-5 text-[#C6A667]" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-neutral-900">
                  Module Videos
                </h2>

                <p className="text-sm text-neutral-500">
                  Complete all videos in this module to unlock the next module.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-8">
              {videos.map((video, index) => {
                const videoUrl = getVideoUrl(video);

                const current = getVideoProgress(video.id);

                const videoCompleted = isVideoCompleted(video);

                return (
                  <div
                    key={video.id}
                    className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                  >
                    {/* VIDEO */}

                    <div className="relative aspect-video w-full bg-black">
                      {videoUrl ? (
                        <iframe
                          ref={(element) => {
                            if (element) {
                              iframeRefs.current[video.id] = element;

                              debug("IFRAME REF ASSIGNED", {
                                videoId: video.id,
                                iframe: element,
                              });
                            } else {
                              delete iframeRefs.current[video.id];
                            }
                          }}
                          src={videoUrl}
                          title={video.title || `Module video ${index + 1}`}
                          className="absolute inset-0 h-full w-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                          allowFullScreen
                          onLoad={() => {
                            debug("🐰 BUNNY IFRAME LOADED", {
                              videoId: video.id,
                              src: videoUrl,
                            });
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-white">
                          Video unavailable
                        </div>
                      )}
                    </div>

                    {/* VIDEO DETAILS */}

                    <div className="p-5 sm:p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Video {index + 1}</Badge>

                        {videoCompleted && (
                          <Badge className="gap-1 bg-green-100 text-green-700 hover:bg-green-100">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Completed
                          </Badge>
                        )}

                        {current.durationSeconds > 0 && (
                          <Badge variant="secondary">
                            {formatDuration(current.durationSeconds)}
                          </Badge>
                        )}

                        {savingVideoId === video.id && (
                          <Badge variant="secondary" className="gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Saving
                          </Badge>
                        )}
                      </div>

                      <h3 className="mt-3 text-lg font-semibold text-neutral-900">
                        {video.title || `Module Video ${index + 1}`}
                      </h3>

                      {video.description && (
                        <p className="mt-2 text-sm leading-6 text-neutral-600">
                          {video.description}
                        </p>
                      )}

                      {/* VIDEO PROGRESS */}

                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="text-neutral-500">
                            Video progress
                          </span>

                          <span className="font-medium text-neutral-700">
                            {Math.round(current.watchPercentage || 0)}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              videoCompleted ? "bg-green-500" : "bg-[#C6A667]"
                            }`}
                            style={{
                              width: `${Math.min(
                                Math.max(current.watchPercentage || 0, 0),
                                100,
                              )}%`,
                            }}
                          />
                        </div>

                        <div className="mt-2 flex justify-between text-[11px] text-neutral-400">
                          <span>
                            Watched: {Math.floor(current.watchedSeconds || 0)}s
                          </span>

                          <span>
                            Duration: {Math.floor(current.durationSeconds || 0)}
                            s
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ==================================================
              MODULE COMPLETION
          ================================================== */}

          <div className="mt-10">
            {completed ? (
              <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                <CheckCircle2 className="h-5 w-5 shrink-0" />

                <div>
                  <p className="font-semibold">Module completed</p>

                  <p className="mt-1 text-xs text-green-600">
                    You have completed all required videos. The next module is
                    now unlocked.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border bg-neutral-50 p-5">
                <p className="text-sm font-semibold text-neutral-900">
                  Complete this module to continue
                </p>

                <p className="mt-1 text-xs text-neutral-500">
                  Complete all {moduleProgress.totalVideos} videos to at least{" "}
                  {VIDEO_COMPLETION_PERCENTAGE}% to unlock the next module.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* ====================================================
            MODULE NAVIGATION
        ==================================================== */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {/* PREVIOUS */}

          {navigation?.previousModule ? (
            <Link
              href={`/academy/dashboard/courses/${course.id}/modules/${navigation.previousModule.id}`}
            >
              <Card className="h-full cursor-pointer rounded-2xl border bg-white p-5 shadow-sm transition hover:border-[#C6A667]/40 hover:shadow-md">
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

          {/* NEXT */}

          {navigation?.nextModule ? (
            completed ? (
              <Link
                href={`/academy/dashboard/courses/${course.id}/modules/${navigation.nextModule.id}`}
              >
                <Card className="h-full cursor-pointer rounded-2xl border bg-white p-5 shadow-sm transition hover:border-[#C6A667]/40 hover:shadow-md">
                  <p className="text-xs uppercase tracking-wider text-neutral-400">
                    Next Module
                  </p>

                  <div className="mt-2 flex items-center justify-end gap-2">
                    <p className="font-semibold text-neutral-900">
                      {navigation.nextModule.title}
                    </p>

                    <ArrowRight className="h-4 w-4 text-[#C6A667]" />
                  </div>
                </Card>
              </Link>
            ) : (
              <Card className="h-full rounded-2xl border border-neutral-200 bg-neutral-50 p-5 opacity-70">
                <p className="flex items-center justify-end gap-1 text-xs uppercase tracking-wider text-neutral-400">
                  <Lock className="h-3.5 w-3.5" />
                  Next Module Locked
                </p>

                <div className="mt-2 text-right">
                  <p className="font-semibold text-neutral-700">
                    {navigation.nextModule.title}
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    Complete all videos in this module to continue.
                  </p>
                </div>
              </Card>
            )
          ) : (
            <Card className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-[#C6A667]">
                Final Module
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
