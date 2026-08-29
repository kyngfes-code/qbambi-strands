import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";

//////////////////////////////////////////////////////////////
// BUNNY CONFIG
//////////////////////////////////////////////////////////////

const BUNNY_STREAM_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID;
const BUNNY_STREAM_TOKEN_KEY = process.env.BUNNY_STREAM_TOKEN_KEY;

//////////////////////////////////////////////////////////////
// CREATE BUNNY STREAM EMBED TOKEN
//////////////////////////////////////////////////////////////

function createBunnyPlaybackToken({ videoId, expiresAt }) {
  if (!BUNNY_STREAM_LIBRARY_ID) {
    throw new Error("BUNNY_STREAM_LIBRARY_ID is not configured.");
  }

  if (!BUNNY_STREAM_TOKEN_KEY) {
    throw new Error("BUNNY_STREAM_TOKEN_KEY is not configured.");
  }

  if (!videoId) {
    throw new Error("Bunny video ID is required.");
  }

  if (!expiresAt) {
    throw new Error("Bunny token expiration is required.");
  }

  ////////////////////////////////////////////////////////////
  // Bunny Stream token authentication
  //
  // SHA256_HEX(
  //   token_security_key +
  //   video_id +
  //   expiration
  // )
  ////////////////////////////////////////////////////////////

  const tokenPayload = BUNNY_STREAM_TOKEN_KEY + videoId + expiresAt;

  const token = crypto.createHash("sha256").update(tokenPayload).digest("hex");

  ////////////////////////////////////////////////////////////
  // BUNNY EMBED URL
  ////////////////////////////////////////////////////////////

  const playbackUrl =
    `https://iframe.mediadelivery.net/embed/` +
    `${BUNNY_STREAM_LIBRARY_ID}/` +
    `${videoId}` +
    `?token=${token}` +
    `&expires=${expiresAt}`;

  return {
    token,
    expiresAt,
    playbackUrl,
  };
}

//////////////////////////////////////////////////////////////
// GET
//
// /api/academy/videos/[videoId]/playback
//
// Uses:
//   academy_module_videos
//
// Course is derived through:
//   academy_module_videos.module_id
//        ↓
//   academy_course_modules.id
//        ↓
//   academy_course_modules.course_id
//////////////////////////////////////////////////////////////

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
    // IMPORTANT:
    //
    // academy_module_videos does NOT contain course_id.
    // We therefore load the module relationship separately.
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
      console.error("Academy module video playback lookup:", videoError);

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

    ////////////////////////////////////////////////////////////

    const { data: module, error: moduleError } = await supabase
      .from("academy_course_modules")
      .select(
        `
          id,
          course_id,
          module_code,
          title,
          sort_order,
          status
        `,
      )
      .eq("id", video.module_id)
      .maybeSingle();

    if (moduleError) {
      console.error("Academy module video module lookup:", moduleError);

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
          error: "The module associated with this video was not found.",
        },
        {
          status: 404,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 5. VIDEO MUST BE PUBLISHED
    ////////////////////////////////////////////////////////////

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

    ////////////////////////////////////////////////////////////
    // 6. MODULE MUST BE ACTIVE
    //
    // This is optional depending on your academy module rules,
    // but it prevents videos inside inactive modules from being
    // played.
    ////////////////////////////////////////////////////////////

    if (module.status && !["active", "published"].includes(module.status)) {
      return NextResponse.json(
        {
          error: "This video module is not currently available.",
        },
        {
          status: 403,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 7. BUNNY VIDEO MUST EXIST
    ////////////////////////////////////////////////////////////

    if (!video.bunny_video_id?.trim()) {
      return NextResponse.json(
        {
          error:
            "This academy video has not been connected to Bunny Stream yet.",
        },
        {
          status: 409,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 8. SERVER-SIDE ACCESS AUTHORIZATION
    //
    // IMPORTANT:
    //
    // The frontend NEVER decides whether this video is unlocked.
    //
    // The RPC must be rebuilt to use:
    //
    //   academy_module_videos
    //
    // The RPC is responsible for:
    //
    // - academy enrollment
    // - course access
    // - first-video access
    // - previous-video completion
    // - previous-video confirmed_good
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
      console.error("academy_can_access_video:", accessError);

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
    // 9. NORMALIZE RPC RESULT
    ////////////////////////////////////////////////////////////

    const accessResult = Array.isArray(access) ? access[0] : access;

    const canAccess = accessResult?.can_access === true;

    ////////////////////////////////////////////////////////////
    // 10. ACCESS DENIED
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
    // 11. VERIFY COURSE CONSISTENCY
    //
    // The course returned by the module must match the course
    // returned by the authorization RPC when available.
    ////////////////////////////////////////////////////////////

    const authorizedCourseId = accessResult?.course_id ?? null;

    if (authorizedCourseId && authorizedCourseId !== module.course_id) {
      console.error("Academy video authorization course mismatch:", {
        videoId: video.id,
        moduleId: module.id,
        moduleCourseId: module.course_id,
        authorizedCourseId,
      });

      return NextResponse.json(
        {
          error: "Video authorization data is inconsistent.",
        },
        {
          status: 500,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 12. SHORT-LIVED BUNNY TOKEN
    //
    // 10 minutes.
    ////////////////////////////////////////////////////////////

    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 10;

    ////////////////////////////////////////////////////////////
    // 13. GENERATE BUNNY TOKEN
    ////////////////////////////////////////////////////////////

    const playback = createBunnyPlaybackToken({
      videoId: video.bunny_video_id.trim(),
      expiresAt,
    });

    ////////////////////////////////////////////////////////////
    // 14. RESPONSE
    ////////////////////////////////////////////////////////////

    return NextResponse.json({
      success: true,

      access: true,

      enrollment: accessResult?.enrollment_id
        ? {
            id: accessResult.enrollment_id,
          }
        : null,

      video: {
        id: video.id,

        courseId: module.course_id,

        moduleId: video.module_id,

        title: video.title,

        description: video.description,

        durationSeconds: video.duration_seconds,

        sortOrder: video.sort_order,

        status: video.status,

        thumbnailUrl: video.thumbnail_url,

        bunnyVideoId: video.bunny_video_id,

        isFirstVideo: accessResult?.is_first_video === true,
      },

      module: {
        id: module.id,

        courseId: module.course_id,

        moduleCode: module.module_code,

        title: module.title,

        sortOrder: module.sort_order,

        status: module.status,
      },

      authorization: {
        canAccess: true,

        isFirstVideo: accessResult?.is_first_video === true,

        previousVideoId: accessResult?.previous_video_id ?? null,

        previousVideoCompleted: accessResult?.previous_video_completed ?? null,

        previousVideoConfirmedGood:
          accessResult?.previous_video_confirmed_good ?? null,
      },

      playback: {
        type: "bunny_stream_embed",

        url: playback.playbackUrl,

        expiresAt: playback.expiresAt,
      },
    });
  } catch (error) {
    console.error("Academy Bunny playback error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to authorize video playback.",
      },
      {
        status: 500,
      },
    );
  }
}
