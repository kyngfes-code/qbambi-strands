import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req, { params }) {
  try {
    ////////////////////////////////////////////////////////////
    // AUTHENTICATION
    ////////////////////////////////////////////////////////////

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

    const userId = session.user.id;

    ////////////////////////////////////////////////////////////
    // PARAMS
    ////////////////////////////////////////////////////////////

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

    ////////////////////////////////////////////////////////////
    // SUPABASE
    ////////////////////////////////////////////////////////////

    const supabase = createSupabaseAdmin();

    ////////////////////////////////////////////////////////////
    // 1. LOAD VIDEO
    //
    // academy_module_videos does NOT contain course_id.
    // The course is obtained through academy_course_modules.
    ////////////////////////////////////////////////////////////

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

      return NextResponse.json(
        {
          error: "Unable to load video.",
        },
        {
          status: 500,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 2. VIDEO NOT FOUND
    ////////////////////////////////////////////////////////////

    if (!video) {
      return NextResponse.json(
        {
          error: "Video not found.",
        },
        {
          status: 404,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 3. LOAD MODULE
    //
    // The module provides the course_id.
    ////////////////////////////////////////////////////////////

    const { data: module, error: moduleError } = await supabase
      .from("academy_course_modules")
      .select(
        `
          id,
          course_id,
          module_code,
          title,
          description,
          sort_order,
          status
        `,
      )
      .eq("id", video.module_id)
      .maybeSingle();

    if (moduleError) {
      console.error("Academy module lookup error:", moduleError);

      return NextResponse.json(
        {
          error: "Unable to load video module.",
        },
        {
          status: 500,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 4. MODULE NOT FOUND
    ////////////////////////////////////////////////////////////

    if (!module) {
      return NextResponse.json(
        {
          error: "Video module not found.",
        },
        {
          status: 404,
        },
      );
    }

    const courseId = module.course_id;

    ////////////////////////////////////////////////////////////
    // 5. VIDEO MUST BE PUBLISHED
    ////////////////////////////////////////////////////////////

    if (video.status !== "published") {
      return NextResponse.json(
        {
          success: false,
          access: false,
          error: "This video is not currently available.",
        },
        {
          status: 403,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 6. SERVER-SIDE VIDEO ACCESS AUTHORIZATION
    //
    // The RPC now works with academy_module_videos.
    //
    // It determines:
    //
    // - academy enrollment
    // - course access
    // - first-video access
    // - previous-video completion
    // - previous-video confirmation
    //
    ////////////////////////////////////////////////////////////

    const { data: access, error: accessError } = await supabase.rpc(
      "academy_can_access_video",
      {
        p_user_id: userId,
        p_video_id: video.id,
      },
    );

    if (accessError) {
      console.error("academy_can_access_video error:", accessError);

      return NextResponse.json(
        {
          error: "Unable to verify video access.",
        },
        {
          status: 500,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 7. NORMALIZE RPC RESULT
    ////////////////////////////////////////////////////////////

    const accessResult = Array.isArray(access) ? access[0] : access;

    const canAccess = accessResult?.can_access === true;

    ////////////////////////////////////////////////////////////
    // 8. ACCESS DENIED
    ////////////////////////////////////////////////////////////

    if (!canAccess) {
      return NextResponse.json(
        {
          success: false,
          access: false,

          error:
            accessResult?.reason ||
            "You do not currently have access to this video.",
        },
        {
          status: 403,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 9. DETERMINE ENROLLMENT
    ////////////////////////////////////////////////////////////

    const enrollmentId = accessResult?.enrollment_id;

    if (!enrollmentId) {
      return NextResponse.json(
        {
          error:
            "Video access was granted but no academy enrollment was returned.",
        },
        {
          status: 500,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 10. LOAD STUDENT VIDEO PROGRESS
    //
    // course_id is still used here because the progress table
    // may contain course_id, but the video itself gets its
    // course_id from the module.
    ////////////////////////////////////////////////////////////

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
      .eq("enrollment_id", enrollmentId)
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

    ////////////////////////////////////////////////////////////
    // 11. NORMALIZE PROGRESS
    ////////////////////////////////////////////////////////////

    const normalizedProgress = progress
      ? {
          id: progress.id,

          watchedSeconds: progress.watched_seconds ?? 0,

          durationSeconds:
            progress.duration_seconds ?? video.duration_seconds ?? null,

          watchPercentage: Number(progress.watch_percentage ?? 0),

          reachedEnd: progress.reached_end === true,

          completed: progress.completed === true,

          confirmedGood: progress.confirmed_good === true,

          completedAt: progress.completed_at ?? null,

          confirmedAt: progress.confirmed_at ?? null,

          lastWatchedAt: progress.last_watched_at ?? null,
        }
      : {
          id: null,

          watchedSeconds: 0,

          durationSeconds: video.duration_seconds ?? null,

          watchPercentage: 0,

          reachedEnd: false,

          completed: false,

          confirmedGood: false,

          completedAt: null,

          confirmedAt: null,

          lastWatchedAt: null,
        };

    ////////////////////////////////////////////////////////////
    // 12. VIDEO STATE
    //
    // academy_module_videos no longer has is_preview.
    //
    // Preview access should therefore come exclusively from
    // the authorization RPC if you later add preview logic
    // there.
    ////////////////////////////////////////////////////////////

    const isPreview = accessResult?.is_preview === true;

    const isFirstVideo = accessResult?.is_first_video === true;

    ////////////////////////////////////////////////////////////
    // 13. RESPONSE
    //
    // Do NOT return a permanent Bunny playback URL.
    //
    // The player should request playback from the dedicated
    // Bunny playback endpoint when needed.
    ////////////////////////////////////////////////////////////

    return NextResponse.json({
      success: true,

      access: true,

      preview: isPreview,

      enrollment: {
        id: enrollmentId,
      },

      course: {
        id: courseId,
      },

      module: {
        id: module.id,

        courseId: module.course_id,

        moduleCode: module.module_code,

        title: module.title,

        sortOrder: module.sort_order,
      },

      video: {
        id: video.id,

        courseId: courseId,

        moduleId: video.module_id,

        title: video.title,

        description: video.description,

        bunnyVideoId: video.bunny_video_id,

        thumbnailUrl: video.thumbnail_url,

        durationSeconds: video.duration_seconds,

        sortOrder: video.sort_order,

        isPreview,

        isFirstVideo,
      },

      progress: normalizedProgress,

      authorization: {
        canAccess: true,

        previousVideoId: accessResult?.previous_video_id ?? null,

        previousVideoCompleted: accessResult?.previous_video_completed ?? null,

        previousVideoConfirmedGood:
          accessResult?.previous_video_confirmed_good ?? null,
      },
    });
  } catch (error) {
    console.error("Academy video access API error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to access academy video.",
      },
      {
        status: 500,
      },
    );
  }
}
