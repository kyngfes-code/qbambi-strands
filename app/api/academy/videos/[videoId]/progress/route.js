// app/api/academy/videos/[videoId]/progress/route.js

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

/* ============================================================
   AUTHORIZATION
============================================================ */

async function authorizeStudent() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        },
      ),
    };
  }

  if (session.user.role !== "student") {
    return {
      error: NextResponse.json(
        {
          error: "Academy student access required.",
        },
        {
          status: 403,
        },
      ),
    };
  }

  return {
    userId: session.user.id,
    supabase: createSupabaseAdmin(),
  };
}

/* ============================================================
   LOAD MODULE VIDEO + COURSE
============================================================ */

async function loadModuleVideo(supabase, videoId) {
  const { data: video, error: videoError } = await supabase
    .from("academy_module_videos")
    .select(
      `
        id,
        module_id,
        title,
        description,
        duration_seconds,
        sort_order,
        status,
        bunny_video_id,
        thumbnail_url
      `,
    )
    .eq("id", videoId)
    .maybeSingle();

  if (videoError) {
    console.error("Academy module video lookup error:", videoError);

    return {
      error: NextResponse.json(
        {
          error: "Unable to load video.",
        },
        {
          status: 500,
        },
      ),
    };
  }

  if (!video) {
    return {
      error: NextResponse.json(
        {
          error: "Video not found.",
        },
        {
          status: 404,
        },
      ),
    };
  }

  /* ----------------------------------------------------------
     Resolve course through academy_course_modules
  ---------------------------------------------------------- */

  const { data: module, error: moduleError } = await supabase
    .from("academy_course_modules")
    .select(
      `
        id,
        course_id,
        module_code,
        title,
        status,
        sort_order
      `,
    )
    .eq("id", video.module_id)
    .maybeSingle();

  if (moduleError) {
    console.error("Academy module video module lookup error:", moduleError);

    return {
      error: NextResponse.json(
        {
          error: "Unable to verify video module.",
        },
        {
          status: 500,
        },
      ),
    };
  }

  if (!module) {
    return {
      error: NextResponse.json(
        {
          error: "Video module not found.",
        },
        {
          status: 404,
        },
      ),
    };
  }

  return {
    video,
    module,
    courseId: module.course_id,
  };
}

/* ============================================================
   FIND STUDENT ENROLLMENT FOR COURSE
============================================================ */

async function loadEnrollment(supabase, userId, courseId) {
  const { data: enrollments, error: enrollmentError } = await supabase
    .from("academy_enrollments")
    .select(
      `
        id,
        user_id,
        course_id,
        status,
        created_at
      `,
    )
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .in("status", ["enrolled", "completed"])
    .order("created_at", {
      ascending: false,
    });

  if (enrollmentError) {
    console.error(
      "Academy video progress enrollment lookup error:",
      enrollmentError,
    );

    return {
      error: NextResponse.json(
        {
          error: "Unable to verify course access.",
        },
        {
          status: 500,
        },
      ),
    };
  }

  if (!enrollments?.length) {
    return {
      error: NextResponse.json(
        {
          error: "You do not have access to this course.",
        },
        {
          status: 403,
        },
      ),
    };
  }

  /*
   * The newest active enrollment is used if multiple records
   * exist for the same student/course.
   */
  return {
    enrollment: enrollments[0],
  };
}

/* ============================================================
   GET
   Return progress for the current student on this video
============================================================ */

export async function GET(req, { params }) {
  const authResult = await authorizeStudent();

  if (authResult.error) {
    return authResult.error;
  }

  const { userId, supabase } = authResult;

  try {
    /* ----------------------------------------------------------
       PARAMS
    ---------------------------------------------------------- */

    const { videoId } = await params;

    if (!videoId) {
      return NextResponse.json(
        {
          error: "Video ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    /* ----------------------------------------------------------
       1. LOAD VIDEO
    ---------------------------------------------------------- */

    const videoResult = await loadModuleVideo(supabase, videoId);

    if (videoResult.error) {
      return videoResult.error;
    }

    const { video, module, courseId } = videoResult;

    /* ----------------------------------------------------------
       2. VIDEO MUST BE PUBLISHED
    ---------------------------------------------------------- */

    if (video.status !== "published") {
      return NextResponse.json(
        {
          error: "This video is not currently available.",
        },
        {
          status: 403,
        },
      );
    }

    /* ----------------------------------------------------------
       3. FIND ENROLLMENT
    ---------------------------------------------------------- */

    const enrollmentResult = await loadEnrollment(supabase, userId, courseId);

    if (enrollmentResult.error) {
      return enrollmentResult.error;
    }

    const { enrollment } = enrollmentResult;

    /* ----------------------------------------------------------
       4. FIND PROGRESS
    ---------------------------------------------------------- */

    const { data: progress, error: progressError } = await supabase
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
            confirmed_good,

            completed_at,
            confirmed_at,
            last_watched_at,

            created_at,
            updated_at
          `,
      )
      .eq("enrollment_id", enrollment.id)
      .eq("course_id", courseId)
      .eq("video_id", video.id)
      .maybeSingle();

    if (progressError) {
      console.error("Academy video progress lookup error:", progressError);

      return NextResponse.json(
        {
          error: "Unable to load video progress.",
        },
        {
          status: 500,
        },
      );
    }

    /* ----------------------------------------------------------
       5. RESPONSE
    ---------------------------------------------------------- */

    return NextResponse.json({
      success: true,

      video: {
        id: video.id,

        courseId,

        moduleId: video.module_id,

        title: video.title,

        description: video.description,

        durationSeconds: video.duration_seconds,

        sortOrder: video.sort_order,

        status: video.status,

        bunnyVideoId: video.bunny_video_id,

        thumbnailUrl: video.thumbnail_url,

        module: {
          id: module.id,

          courseId: module.course_id,

          moduleCode: module.module_code,

          title: module.title,

          status: module.status,

          sortOrder: module.sort_order,
        },
      },

      enrollment: {
        id: enrollment.id,

        courseId: enrollment.course_id,

        status: enrollment.status,
      },

      progress: progress ?? {
        id: null,

        enrollment_id: enrollment.id,

        course_id: courseId,

        video_id: video.id,

        watched_seconds: 0,

        duration_seconds: video.duration_seconds,

        watch_percentage: 0,

        reached_end: false,

        completed: false,

        confirmed_good: false,

        completed_at: null,

        confirmed_at: null,

        last_watched_at: null,
      },
    });
  } catch (error) {
    console.error("Academy video progress GET error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to load video progress.",
      },
      {
        status: 500,
      },
    );
  }
}

/* ============================================================
   POST
   Save/update video progress
============================================================ */

export async function POST(req, { params }) {
  const authResult = await authorizeStudent();

  if (authResult.error) {
    return authResult.error;
  }

  const { userId, supabase } = authResult;

  try {
    /* ----------------------------------------------------------
       PARAMS
    ---------------------------------------------------------- */

    const { videoId } = await params;

    if (!videoId) {
      return NextResponse.json(
        {
          error: "Video ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    /* ----------------------------------------------------------
       BODY
    ---------------------------------------------------------- */

    let body;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid request body.",
        },
        {
          status: 400,
        },
      );
    }

    /* ----------------------------------------------------------
       ACCEPTED VALUES
    ---------------------------------------------------------- */

    let watchedSeconds = Number(body?.watched_seconds ?? 0);

    if (!Number.isFinite(watchedSeconds)) {
      watchedSeconds = 0;
    }

    watchedSeconds = Math.max(Math.floor(watchedSeconds), 0);

    /* ----------------------------------------------------------
       1. LOAD VIDEO
    ---------------------------------------------------------- */

    const videoResult = await loadModuleVideo(supabase, videoId);

    if (videoResult.error) {
      return videoResult.error;
    }

    const { video, module, courseId } = videoResult;

    /* ----------------------------------------------------------
       2. VIDEO MUST BE PUBLISHED
    ---------------------------------------------------------- */

    if (video.status !== "published") {
      return NextResponse.json(
        {
          error: "This video is not currently available.",
        },
        {
          status: 403,
        },
      );
    }

    /* ----------------------------------------------------------
       3. VERIFY MODULE
    ---------------------------------------------------------- */

    if (module.course_id !== courseId) {
      return NextResponse.json(
        {
          error: "Video module configuration is invalid.",
        },
        {
          status: 409,
        },
      );
    }

    /* ----------------------------------------------------------
       4. FIND ENROLLMENT
    ---------------------------------------------------------- */

    const enrollmentResult = await loadEnrollment(supabase, userId, courseId);

    if (enrollmentResult.error) {
      return enrollmentResult.error;
    }

    const { enrollment } = enrollmentResult;

    /* ----------------------------------------------------------
       5. LOAD EXISTING PROGRESS
    ---------------------------------------------------------- */

    const { data: existing, error: existingError } = await supabase
      .from("academy_student_video_progress")
      .select("*")
      .eq("enrollment_id", enrollment.id)
      .eq("course_id", courseId)
      .eq("video_id", video.id)
      .maybeSingle();

    if (existingError) {
      console.error(
        "Academy video progress existing lookup error:",
        existingError,
      );

      return NextResponse.json(
        {
          error: "Unable to load existing video progress.",
        },
        {
          status: 500,
        },
      );
    }

    /* ----------------------------------------------------------
       6. DURATION
    ---------------------------------------------------------- */

    const durationSeconds =
      video.duration_seconds !== null && video.duration_seconds !== undefined
        ? Number(video.duration_seconds)
        : null;

    if (durationSeconds !== null && Number.isFinite(durationSeconds)) {
      watchedSeconds = Math.min(
        watchedSeconds,
        Math.max(Math.floor(durationSeconds), 0),
      );
    }

    /* ----------------------------------------------------------
       7. CALCULATE WATCH PERCENTAGE
    ---------------------------------------------------------- */

    let watchPercentage = 0;

    if (
      durationSeconds !== null &&
      Number.isFinite(durationSeconds) &&
      durationSeconds > 0
    ) {
      watchPercentage = (watchedSeconds / durationSeconds) * 100;
    }

    watchPercentage = Math.min(Math.max(watchPercentage, 0), 100);

    watchPercentage = Number(watchPercentage.toFixed(2));

    /* ----------------------------------------------------------
       8. COMPLETION
       
       95% is treated as completed.

       The player can also explicitly report reached_end.
    ---------------------------------------------------------- */

    const reachedEnd =
      body?.reached_end === true ||
      (durationSeconds !== null &&
        Number.isFinite(durationSeconds) &&
        durationSeconds > 0 &&
        watchedSeconds >= durationSeconds);

    const completed =
      body?.completed === true || reachedEnd || watchPercentage >= 95;

    /* ----------------------------------------------------------
       9. PRESERVE EXISTING COMPLETION
       
       Once a video is completed, normal progress updates
       cannot accidentally reset it.
    ---------------------------------------------------------- */

    const finalCompleted = existing?.completed === true || completed;

    const finalReachedEnd = existing?.reached_end === true || reachedEnd;

    const now = new Date().toISOString();

    /* ----------------------------------------------------------
       10. BUILD UPDATE PAYLOAD
    ---------------------------------------------------------- */

    const updatePayload = {
      enrollment_id: enrollment.id,

      course_id: courseId,

      video_id: video.id,

      watched_seconds: watchedSeconds,

      duration_seconds: durationSeconds ?? existing?.duration_seconds ?? null,

      watch_percentage: watchPercentage,

      reached_end: finalReachedEnd,

      completed: finalCompleted,

      last_watched_at: now,

      updated_at: now,

      ...(finalCompleted &&
        !existing?.completed_at && {
          completed_at: now,
        }),
    };

    /* ----------------------------------------------------------
       11. UPsert
    ---------------------------------------------------------- */

    const { data: progress, error: upsertError } = await supabase
      .from("academy_student_video_progress")
      .upsert(updatePayload, {
        onConflict: "enrollment_id,video_id",
      })
      .select("*")
      .single();

    if (upsertError) {
      console.error("Academy video progress upsert error:", upsertError);

      return NextResponse.json(
        {
          error: "Unable to save video progress.",
        },
        {
          status: 500,
        },
      );
    }

    /* ----------------------------------------------------------
       12. RESPONSE
    ---------------------------------------------------------- */

    return NextResponse.json({
      success: true,

      video: {
        id: video.id,

        courseId,

        moduleId: video.module_id,

        durationSeconds: video.duration_seconds,

        sortOrder: video.sort_order,
      },

      enrollment: {
        id: enrollment.id,

        courseId: enrollment.course_id,

        status: enrollment.status,
      },

      progress,

      completion: {
        completed: progress.completed,

        reachedEnd: progress.reached_end,

        watchPercentage: Number(progress.watch_percentage ?? 0),
      },
    });
  } catch (error) {
    console.error("Academy video progress POST error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to save video progress.",
      },
      {
        status: 500,
      },
    );
  }
}
