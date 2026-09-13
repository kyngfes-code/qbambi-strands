import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

// ==========================================================
// CONFIG
// ==========================================================

const VIDEO_COMPLETION_PERCENTAGE = 90;

// ==========================================================
// PATCH
//
// Module progress is calculated from:
//
// academy_module_videos
// academy_student_video_progress
//
// The frontend does NOT control module progress_seconds.
//
// We calculate everything from the saved video progress.
// ==========================================================

export async function PATCH(request, { params }) {
  try {
    console.log("\n========================================");
    console.log("[ACADEMY MODULE PROGRESS] PATCH STARTED");
    console.log("========================================");

    // ==========================================================
    // AUTH
    // ==========================================================

    const session = await auth();

    if (!session?.user?.id) {
      console.error("[ACADEMY MODULE PROGRESS] Unauthorized request");

      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    if (session.user.role !== "student") {
      console.error("[ACADEMY MODULE PROGRESS] Non-student attempted access", {
        userId: session.user.id,
        role: session.user.role,
      });

      return NextResponse.json(
        {
          error: "Academy student access required.",
        },
        {
          status: 403,
        },
      );
    }

    const userId = session.user.id;

    // ==========================================================
    // PARAMS
    // ==========================================================

    const { courseId, moduleId } = await params;

    console.log("[ACADEMY MODULE PROGRESS] Request params", {
      userId,
      courseId,
      moduleId,
    });

    if (!courseId || !moduleId) {
      return NextResponse.json(
        {
          error: "Course ID and module ID are required.",
        },
        {
          status: 400,
        },
      );
    }

    // ==========================================================
    // BODY
    //
    // We don't trust frontend progress.
    //
    // We only read this for debugging.
    // ==========================================================

    let body = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    console.log("[ACADEMY MODULE PROGRESS] Incoming body", body);

    // ==========================================================
    // SUPABASE
    // ==========================================================

    const supabase = createSupabaseAdmin();

    // ==========================================================
    // FIND STUDENT
    // ==========================================================

    const { data: student, error: studentError } = await supabase
      .from("academy_students")
      .select(
        `
            id,
            user_id,
            status,
            is_active
          `,
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (studentError) {
      console.error(
        "[ACADEMY MODULE PROGRESS] Student lookup failed",
        studentError,
      );

      return NextResponse.json(
        {
          error: "Unable to verify student.",
          details: studentError.message,
        },
        {
          status: 500,
        },
      );
    }

    if (!student) {
      console.error("[ACADEMY MODULE PROGRESS] Student record not found", {
        userId,
      });

      return NextResponse.json(
        {
          error: "Academy student record not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (student.status !== "active" || student.is_active !== true) {
      console.error("[ACADEMY MODULE PROGRESS] Student inactive", {
        studentId: student.id,
        status: student.status,
        isActive: student.is_active,
      });

      return NextResponse.json(
        {
          error: "Academy student account is not active.",
        },
        {
          status: 403,
        },
      );
    }

    console.log("[ACADEMY MODULE PROGRESS] Student verified", {
      studentId: student.id,
    });

    // ==========================================================
    // VERIFY MODULE
    //
    // academy_course_modules DOES contain course_id.
    // ==========================================================

    const { data: module, error: moduleError } = await supabase
      .from("academy_course_modules")
      .select(
        `
            id,
            course_id,
            status
          `,
      )
      .eq("id", moduleId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (moduleError) {
      console.error(
        "[ACADEMY MODULE PROGRESS] Module lookup failed",
        moduleError,
      );

      return NextResponse.json(
        {
          error: "Unable to verify module.",
          details: moduleError.message,
        },
        {
          status: 500,
        },
      );
    }

    if (!module) {
      console.error("[ACADEMY MODULE PROGRESS] Module not found", {
        moduleId,
        courseId,
      });

      return NextResponse.json(
        {
          error: "Module not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (module.status !== "published") {
      console.error("[ACADEMY MODULE PROGRESS] Module is not published", {
        moduleId,
        status: module.status,
      });

      return NextResponse.json(
        {
          error: "This module is not available.",
        },
        {
          status: 403,
        },
      );
    }

    console.log("[ACADEMY MODULE PROGRESS] Module verified", {
      moduleId: module.id,
      courseId: module.course_id,
    });

    // ==========================================================
    // FIND COURSE ENROLLMENTS
    // ==========================================================

    const { data: enrollmentCourses, error: enrollmentCourseError } =
      await supabase
        .from("academy_enrollment_courses")
        .select(
          `
          enrollment_id
        `,
        )
        .eq("course_id", courseId);

    if (enrollmentCourseError) {
      console.error(
        "[ACADEMY MODULE PROGRESS] Enrollment course lookup failed",
        enrollmentCourseError,
      );

      return NextResponse.json(
        {
          error: "Unable to verify course enrollment.",
          details: enrollmentCourseError.message,
        },
        {
          status: 500,
        },
      );
    }

    const enrollmentIds = (enrollmentCourses ?? []).map(
      (item) => item.enrollment_id,
    );

    console.log("[ACADEMY MODULE PROGRESS] Enrollment IDs found", {
      courseId,
      enrollmentIds,
    });

    if (!enrollmentIds.length) {
      return NextResponse.json(
        {
          error: "You are not enrolled in this course.",
        },
        {
          status: 403,
        },
      );
    }

    // ==========================================================
    // FIND USER'S ACTIVE ENROLLMENT
    // ==========================================================

    const { data: enrollment, error: enrollmentError } = await supabase
      .from("academy_enrollments")
      .select(
        `
            id,
            user_id,
            status
          `,
      )
      .eq("user_id", userId)
      .eq("status", "enrolled")
      .in("id", enrollmentIds)
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (enrollmentError) {
      console.error(
        "[ACADEMY MODULE PROGRESS] Enrollment lookup failed",
        enrollmentError,
      );

      return NextResponse.json(
        {
          error: "Unable to verify enrollment.",
          details: enrollmentError.message,
        },
        {
          status: 500,
        },
      );
    }

    if (!enrollment) {
      console.error("[ACADEMY MODULE PROGRESS] Active enrollment not found", {
        userId,
        courseId,
      });

      return NextResponse.json(
        {
          error: "You are not enrolled in this course.",
        },
        {
          status: 403,
        },
      );
    }

    console.log("[ACADEMY MODULE PROGRESS] Enrollment verified", {
      enrollmentId: enrollment.id,
    });

    // ==========================================================
    // GET ALL PUBLISHED VIDEOS FOR THIS MODULE
    //
    // IMPORTANT:
    //
    // academy_module_videos DOES NOT have course_id.
    //
    // module_id already identifies the videos.
    // ==========================================================

    const { data: videos, error: videosError } = await supabase
      .from("academy_module_videos")
      .select(
        `
            id,
            module_id,
            duration_seconds,
            status,
            sort_order
          `,
      )
      .eq("module_id", moduleId)
      .eq("status", "published")
      .order("sort_order", {
        ascending: true,
      });

    if (videosError) {
      console.error(
        "[ACADEMY MODULE PROGRESS] Module videos lookup failed",
        videosError,
      );

      return NextResponse.json(
        {
          error: "Unable to load module videos.",
          details: videosError.message,
        },
        {
          status: 500,
        },
      );
    }

    const moduleVideos = videos ?? [];

    console.log("[ACADEMY MODULE PROGRESS] Module videos loaded", {
      count: moduleVideos.length,
      videos: moduleVideos,
    });

    // ==========================================================
    // NO VIDEOS
    // ==========================================================

    if (!moduleVideos.length) {
      console.log("[ACADEMY MODULE PROGRESS] Module has no published videos");

      return NextResponse.json(
        {
          success: true,

          progress: null,

          moduleProgress: {
            totalVideos: 0,
            completedVideos: 0,
            percentage: 0,
            totalDurationSeconds: 0,
            watchedSeconds: 0,
            completed: false,
          },

          videos: [],
        },
        {
          status: 200,
        },
      );
    }

    // ==========================================================
    // VIDEO IDS
    // ==========================================================

    const videoIds = moduleVideos.map((video) => video.id);

    console.log("[ACADEMY MODULE PROGRESS] Module video IDs", videoIds);

    // ==========================================================
    // GET STUDENT VIDEO PROGRESS
    // ==========================================================

    const { data: videoProgressRows, error: videoProgressError } =
      await supabase
        .from("academy_student_video_progress")
        .select(
          `
          id,
          enrollment_id,
          course_id,
          video_id,
          watched_seconds,
          duration_seconds,
          watch_percentage,
          reached_end,
          completed,
          completed_at,
          last_watched_at,
          updated_at
        `,
        )
        .eq("enrollment_id", enrollment.id)
        .eq("course_id", courseId)
        .in("video_id", videoIds);

    if (videoProgressError) {
      console.error(
        "[ACADEMY MODULE PROGRESS] Video progress lookup failed",
        videoProgressError,
      );

      return NextResponse.json(
        {
          error: "Unable to load video progress.",
          details: videoProgressError.message,
        },
        {
          status: 500,
        },
      );
    }

    const studentVideoProgress = videoProgressRows ?? [];

    console.log("[ACADEMY MODULE PROGRESS] Student video progress loaded", {
      count: studentVideoProgress.length,
      progress: studentVideoProgress,
    });

    // ==========================================================
    // CREATE PROGRESS MAP
    // ==========================================================

    const progressByVideoId = new Map(
      studentVideoProgress.map((item) => [item.video_id, item]),
    );

    // ==========================================================
    // CALCULATE MODULE PROGRESS
    // ==========================================================

    let totalDurationSeconds = 0;

    let totalWatchedSeconds = 0;

    let completedVideos = 0;

    const calculatedVideos = moduleVideos.map((video) => {
      const videoProgress = progressByVideoId.get(video.id) || null;

      // ------------------------------------------------------
      // Duration
      //
      // Prefer actual saved video duration.
      //
      // Fallback to academy_module_videos duration.
      // ------------------------------------------------------

      const durationSeconds = Math.max(
        0,
        Number(
          videoProgress?.duration_seconds ?? video.duration_seconds ?? 0,
        ) || 0,
      );

      // ------------------------------------------------------
      // Watched seconds
      // ------------------------------------------------------

      const watchedSeconds = Math.max(
        0,
        Number(videoProgress?.watched_seconds ?? 0) || 0,
      );

      // ------------------------------------------------------
      // Percentage
      // ------------------------------------------------------

      const savedWatchPercentage = Math.max(
        0,
        Math.min(100, Number(videoProgress?.watch_percentage ?? 0) || 0),
      );

      const calculatedWatchPercentage =
        durationSeconds > 0
          ? Math.min(100, (watchedSeconds / durationSeconds) * 100)
          : 0;

      const watchPercentage = Math.max(
        savedWatchPercentage,
        calculatedWatchPercentage,
      );

      // ------------------------------------------------------
      // Completed
      // ------------------------------------------------------

      const isCompleted =
        videoProgress?.completed === true ||
        videoProgress?.reached_end === true ||
        watchPercentage >= VIDEO_COMPLETION_PERCENTAGE;

      // ------------------------------------------------------
      // Totals
      // ------------------------------------------------------

      totalDurationSeconds += durationSeconds;

      // Never count watched time above duration.
      const safeWatchedSeconds =
        durationSeconds > 0
          ? Math.min(watchedSeconds, durationSeconds)
          : watchedSeconds;

      totalWatchedSeconds += safeWatchedSeconds;

      if (isCompleted) {
        completedVideos += 1;
      }

      return {
        videoId: video.id,

        watchedSeconds,

        durationSeconds,

        watchPercentage,

        completed: isCompleted,
      };
    });

    const totalVideos = moduleVideos.length;

    // ==========================================================
    // MODULE PERCENTAGE
    //
    // Percentage is based on completed videos.
    //
    // 3/3 videos completed = 100%.
    // ==========================================================

    const completionPercentage =
      totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

    const moduleCompleted = totalVideos > 0 && completedVideos === totalVideos;

    console.log("[ACADEMY MODULE PROGRESS] CALCULATED MODULE PROGRESS", {
      totalVideos,
      completedVideos,
      completionPercentage,
      moduleCompleted,
      totalDurationSeconds,
      totalWatchedSeconds,
      videos: calculatedVideos,
    });

    // ==========================================================
    // EXISTING MODULE PROGRESS
    // ==========================================================

    const { data: existingProgress, error: existingProgressError } =
      await supabase
        .from("academy_student_module_progress")
        .select(
          `
          id,
          progress_seconds,
          completed,
          started_at,
          completed_at
        `,
        )
        .eq("enrollment_id", enrollment.id)
        .eq("module_id", moduleId)
        .maybeSingle();

    if (existingProgressError) {
      console.error(
        "[ACADEMY MODULE PROGRESS] Existing module progress lookup failed",
        existingProgressError,
      );

      return NextResponse.json(
        {
          error: "Unable to load module progress.",
          details: existingProgressError.message,
        },
        {
          status: 500,
        },
      );
    }

    console.log(
      "[ACADEMY MODULE PROGRESS] Existing module progress",
      existingProgress,
    );

    // ==========================================================
    // CALCULATE SAFE PROGRESS SECONDS
    //
    // Based on ALL video watched_seconds.
    //
    // Your current completed videos:
    //
    // 57 + 60 + 6 = 123 seconds
    //
    // So this should save:
    //
    // progress_seconds = 123
    // completed = true
    // ==========================================================

    const calculatedProgressSeconds = Math.floor(totalWatchedSeconds);

    const existingProgressSeconds = Math.max(
      0,
      Number(existingProgress?.progress_seconds ?? 0) || 0,
    );

    const safeProgressSeconds = Math.max(
      calculatedProgressSeconds,
      existingProgressSeconds,
    );

    const now = new Date().toISOString();

    // ==========================================================
    // BUILD PAYLOAD
    // ==========================================================

    const progressPayload = {
      student_id: student.id,

      enrollment_id: enrollment.id,

      course_id: courseId,

      module_id: moduleId,

      progress_seconds: safeProgressSeconds,

      completed: existingProgress?.completed === true || moduleCompleted,

      started_at:
        existingProgress?.started_at ?? (totalWatchedSeconds > 0 ? now : null),

      completed_at:
        existingProgress?.completed_at ?? (moduleCompleted ? now : null),

      updated_at: now,
    };

    console.log(
      "[ACADEMY MODULE PROGRESS] SAVING MODULE PROGRESS",
      progressPayload,
    );

    // ==========================================================
    // UPSERT MODULE PROGRESS
    // ==========================================================

    const { data: savedProgress, error: saveError } = await supabase
      .from("academy_student_module_progress")
      .upsert(progressPayload, {
        onConflict: "enrollment_id,module_id",
      })
      .select(
        `
          id,
          student_id,
          enrollment_id,
          course_id,
          module_id,
          progress_seconds,
          completed,
          started_at,
          completed_at,
          created_at,
          updated_at
        `,
      )
      .single();

    if (saveError) {
      console.error("[ACADEMY MODULE PROGRESS] SAVE FAILED", saveError);

      return NextResponse.json(
        {
          error: "Unable to save module progress.",
          details: saveError.message,
        },
        {
          status: 500,
        },
      );
    }

    // ==========================================================
    // SUCCESS
    // ==========================================================

    console.log("[ACADEMY MODULE PROGRESS] SUCCESS", {
      savedProgress,

      totalVideos,

      completedVideos,

      completionPercentage,

      moduleCompleted,

      totalDurationSeconds,

      totalWatchedSeconds,
    });

    console.log("========================================\n");

    return NextResponse.json({
      success: true,

      completed: savedProgress.completed,

      progress: savedProgress,

      moduleProgress: {
        totalVideos,

        completedVideos,

        percentage: completionPercentage,

        totalDurationSeconds,

        watchedSeconds: totalWatchedSeconds,

        completed: savedProgress.completed,
      },

      videos: calculatedVideos,
    });
  } catch (error) {
    console.error("[ACADEMY MODULE PROGRESS] FATAL ERROR", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to save module progress.",
      },
      {
        status: 500,
      },
    );
  }
}
