import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

// ==========================================================
// CONFIG
// ==========================================================

const VIDEO_COMPLETION_PERCENTAGE = 90;

// ==========================================================
// PATCH
// ==========================================================

export async function PATCH(request, { params }) {
  try {
    // ========================================================
    // 1. AUTHENTICATION
    // ========================================================

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    // ========================================================
    // 2. STUDENT ACCESS
    // ========================================================

    if (session.user.role !== "student") {
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

    // ========================================================
    // 3. ROUTE PARAMS
    // ========================================================

    const { courseId, moduleId, videoId } = await params;

    if (!courseId || !moduleId || !videoId) {
      return NextResponse.json(
        {
          error: "Course ID, module ID, and video ID are required.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // 4. REQUEST BODY
    //
    // Supports the exact payload structure used by:
    //
    // handleVideoProgress()
    //
    // and:
    //
    // handleVideoCompleted()
    // ========================================================

    const body = await request.json();

    const requestedSeconds = Number(body?.watchedSeconds ?? 0);

    const requestedDuration =
      body?.durationSeconds === null ||
      body?.durationSeconds === undefined ||
      body?.durationSeconds === ""
        ? null
        : Number(body.durationSeconds);

    const requestedReachedEnd = body?.reachedEnd === true;

    const requestedCompleted = body?.completed === true;

    const confirmedGood = body?.confirmedGood === true;

    // ========================================================
    // 5. VALIDATE WATCHED SECONDS
    // ========================================================

    if (!Number.isFinite(requestedSeconds) || requestedSeconds < 0) {
      return NextResponse.json(
        {
          error: "Invalid watched position.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // 6. VALIDATE DURATION
    // ========================================================

    if (
      requestedDuration !== null &&
      (!Number.isFinite(requestedDuration) || requestedDuration < 0)
    ) {
      return NextResponse.json(
        {
          error: "Invalid video duration.",
        },
        {
          status: 400,
        },
      );
    }

    const watchedSeconds = Math.floor(requestedSeconds);

    const durationSeconds =
      requestedDuration !== null ? Math.floor(requestedDuration) : null;

    // ========================================================
    // 7. SUPABASE
    // ========================================================

    const supabase = createSupabaseAdmin();

    // ========================================================
    // 8. VERIFY STUDENT
    // ========================================================

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
        "Academy video progress student lookup failed:",
        studentError,
      );

      return NextResponse.json(
        {
          error: "Unable to verify academy student.",
        },
        {
          status: 500,
        },
      );
    }

    if (!student) {
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
      return NextResponse.json(
        {
          error: "Academy student account is not active.",
        },
        {
          status: 403,
        },
      );
    }

    // ========================================================
    // 9. VERIFY MODULE
    // ========================================================

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
        "Academy video progress module lookup failed:",
        moduleError,
      );

      return NextResponse.json(
        {
          error: "Unable to verify academy module.",
        },
        {
          status: 500,
        },
      );
    }

    if (!module) {
      return NextResponse.json(
        {
          error: "Module not found for this course.",
        },
        {
          status: 404,
        },
      );
    }

    if (module.status !== "published") {
      return NextResponse.json(
        {
          error: "This module is not available.",
        },
        {
          status: 403,
        },
      );
    }

    // ========================================================
    // 10. VERIFY VIDEO
    // ========================================================

    const { data: video, error: videoError } = await supabase
      .from("academy_module_videos")
      .select(
        `
            id,
            module_id,
            duration_seconds,
            status
          `,
      )
      .eq("id", videoId)
      .eq("module_id", moduleId)
      .maybeSingle();

    if (videoError) {
      console.error("Academy video progress video lookup failed:", videoError);

      return NextResponse.json(
        {
          error: "Unable to verify academy video.",
        },
        {
          status: 500,
        },
      );
    }

    if (!video) {
      return NextResponse.json(
        {
          error: "Video not found in this module.",
        },
        {
          status: 404,
        },
      );
    }

    // ========================================================
    // 11. VERIFY COURSE ENROLLMENT
    // ========================================================

    const { data: enrollmentCourses, error: enrollmentCourseError } =
      await supabase
        .from("academy_enrollment_courses")
        .select(
          `
          enrollment_id,
          course_id
        `,
        )
        .eq("course_id", courseId);

    if (enrollmentCourseError) {
      console.error(
        "Academy video progress enrollment-course lookup failed:",
        enrollmentCourseError,
      );

      return NextResponse.json(
        {
          error: "Unable to verify course enrollment.",
        },
        {
          status: 500,
        },
      );
    }

    const enrollmentIds = (enrollmentCourses ?? []).map(
      (item) => item.enrollment_id,
    );

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

    // ========================================================
    // 12. FIND ACTIVE ENROLLMENT OWNED BY USER
    // ========================================================

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
        "Academy video progress enrollment lookup failed:",
        enrollmentError,
      );

      return NextResponse.json(
        {
          error: "Unable to verify academy enrollment.",
        },
        {
          status: 500,
        },
      );
    }

    if (!enrollment) {
      return NextResponse.json(
        {
          error: "You are not enrolled in this course.",
        },
        {
          status: 403,
        },
      );
    }

    // ========================================================
    // 13. LOAD EXISTING VIDEO PROGRESS
    // ========================================================

    const { data: existingProgress, error: existingProgressError } =
      await supabase
        .from("academy_student_video_progress")
        .select(
          `
          id,
          watched_seconds,
          duration_seconds,
          watch_percentage,
          reached_end,
          completed,
          confirmed_good,
          completed_at,
          confirmed_at,
          last_watched_at
        `,
        )
        .eq("enrollment_id", enrollment.id)
        .eq("video_id", videoId)
        .maybeSingle();

    if (existingProgressError) {
      console.error(
        "Academy existing video progress lookup failed:",
        existingProgressError,
      );

      return NextResponse.json(
        {
          error: "Unable to load video progress.",
        },
        {
          status: 500,
        },
      );
    }

    // ========================================================
    // 14. RESOLVE VIDEO DURATION
    //
    // Priority:
    //
    // 1. Database duration
    // 2. Client-reported duration
    // 3. Existing saved duration
    //
    // Bunny can sometimes report 0 temporarily.
    // We therefore DO NOT overwrite a valid duration
    // with zero.
    // ========================================================

    const databaseDuration =
      Number(video.duration_seconds) > 0
        ? Math.floor(Number(video.duration_seconds))
        : null;

    const clientDuration =
      durationSeconds && durationSeconds > 0 ? durationSeconds : null;

    const existingDuration =
      Number(existingProgress?.duration_seconds) > 0
        ? Math.floor(Number(existingProgress.duration_seconds))
        : null;

    const resolvedDuration =
      databaseDuration || clientDuration || existingDuration || null;

    // ========================================================
    // 15. PREVENT PROGRESS GOING BACKWARDS
    // ========================================================

    const existingWatchedSeconds = Math.max(
      0,
      Number(existingProgress?.watched_seconds || 0),
    );

    let safeWatchedSeconds = Math.max(watchedSeconds, existingWatchedSeconds);

    // If duration is known, never exceed it.
    if (resolvedDuration !== null && resolvedDuration > 0) {
      safeWatchedSeconds = Math.min(safeWatchedSeconds, resolvedDuration);
    }

    // ========================================================
    // 16. CALCULATE WATCH PERCENTAGE
    // ========================================================

    const existingWatchPercentage = Math.max(
      0,
      Number(existingProgress?.watch_percentage || 0),
    );

    let calculatedWatchPercentage = existingWatchPercentage;

    if (resolvedDuration !== null && resolvedDuration > 0) {
      calculatedWatchPercentage = Math.max(
        existingWatchPercentage,
        (safeWatchedSeconds / resolvedDuration) * 100,
      );
    }

    // ========================================================
    // 17. HANDLE EXPLICIT COMPLETION
    //
    // This is the important fix.
    //
    // Your component calls:
    //
    // handleVideoCompleted(video)
    //
    // which sends:
    //
    // reachedEnd: true
    // completed: true
    // watchPercentage: 100
    //
    // Even if Bunny reports duration = 0,
    // the video must still be marked completed.
    // ========================================================

    const reachedEnd =
      existingProgress?.reached_end === true ||
      requestedReachedEnd === true ||
      (resolvedDuration !== null &&
        resolvedDuration > 0 &&
        safeWatchedSeconds >= resolvedDuration);

    const isCompleted =
      existingProgress?.completed === true ||
      requestedCompleted === true ||
      reachedEnd === true ||
      calculatedWatchPercentage >= VIDEO_COMPLETION_PERCENTAGE;

    // ========================================================
    // 18. FINAL WATCH PERCENTAGE
    //
    // Explicit completion always means 100%.
    // ========================================================

    const finalWatchPercentage = isCompleted
      ? 100
      : Math.min(
          100,
          Math.max(
            existingWatchPercentage,
            Number(calculatedWatchPercentage.toFixed(2)),
          ),
        );

    // ========================================================
    // 19. IF VIDEO IS COMPLETED AND DURATION IS KNOWN,
    // SET WATCHED TIME TO FULL DURATION
    // ========================================================

    if (isCompleted && resolvedDuration !== null && resolvedDuration > 0) {
      safeWatchedSeconds = resolvedDuration;
    }

    // ========================================================
    // 20. CONFIRMATION
    // ========================================================

    const isConfirmedGood =
      existingProgress?.confirmed_good === true || confirmedGood === true;

    // ========================================================
    // 21. TIMESTAMPS
    // ========================================================

    const now = new Date().toISOString();

    const completedAt = isCompleted
      ? existingProgress?.completed_at || now
      : null;

    const confirmedAt = isConfirmedGood
      ? existingProgress?.confirmed_at || now
      : null;

    // ========================================================
    // 22. SAVE VIDEO PROGRESS
    // ========================================================

    const { data: savedProgress, error: saveError } = await supabase
      .from("academy_student_video_progress")
      .upsert(
        {
          enrollment_id: enrollment.id,
          course_id: courseId,
          video_id: videoId,

          watched_seconds: safeWatchedSeconds,

          duration_seconds: resolvedDuration,

          watch_percentage: finalWatchPercentage,

          reached_end: reachedEnd,

          completed: isCompleted,

          confirmed_good: isConfirmedGood,

          completed_at: completedAt,

          confirmed_at: confirmedAt,

          last_watched_at: now,

          updated_at: now,
        },
        {
          onConflict: "enrollment_id,video_id",
        },
      )
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
          confirmed_good,
          completed_at,
          confirmed_at,
          last_watched_at,
          created_at,
          updated_at
        `,
      )
      .single();

    if (saveError) {
      console.error("Academy video progress save failed:", saveError);

      return NextResponse.json(
        {
          error: "Unable to save video progress.",
        },
        {
          status: 500,
        },
      );
    }

    // ========================================================
    // 23. LOG SUCCESS
    // ========================================================

    console.log("VIDEO PROGRESS SAVED", {
      videoId,
      watchedSeconds: savedProgress.watched_seconds,
      durationSeconds: savedProgress.duration_seconds,
      watchPercentage: savedProgress.watch_percentage,
      reachedEnd: savedProgress.reached_end,
      completed: savedProgress.completed,
    });

    // ========================================================
    // 24. SUCCESS
    // ========================================================

    return NextResponse.json({
      success: true,

      completionThreshold: VIDEO_COMPLETION_PERCENTAGE,

      progress: savedProgress,

      video: {
        id: videoId,

        watchedSeconds: savedProgress.watched_seconds,

        durationSeconds: savedProgress.duration_seconds,

        watchPercentage: Number(savedProgress.watch_percentage),

        reachedEnd: savedProgress.reached_end,

        completed: savedProgress.completed,

        confirmedGood: savedProgress.confirmed_good,
      },
    });
  } catch (error) {
    console.error("Academy video progress fatal error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to save academy video progress.",
      },
      {
        status: 500,
      },
    );
  }
}
