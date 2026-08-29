import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

//////////////////////////////////////////////////////////////
// CONFIG
//////////////////////////////////////////////////////////////

const BUNNY_PLAYBACK_BASE = "https://iframe.mediadelivery.net/embed";

//////////////////////////////////////////////////////////////
// HELPERS
//////////////////////////////////////////////////////////////

async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    return {
      error: NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      ),
    };
  }

  if (session.user.role !== "admin") {
    return {
      error: NextResponse.json(
        {
          error: "Forbidden",
        },
        {
          status: 403,
        },
      ),
    };
  }

  return {
    session,
  };
}

//////////////////////////////////////////////////////////////
// BUNNY PLAYBACK URL
//////////////////////////////////////////////////////////////

function getBunnyPlaybackUrl(libraryId, bunnyVideoId) {
  return `${BUNNY_PLAYBACK_BASE}/${libraryId}/${bunnyVideoId}`;
}

//////////////////////////////////////////////////////////////
// GET
//
// /api/admin/academy/courses/[courseId]/modules/[moduleId]/videos
//
// Fetches videos from:
// academy_module_videos
//////////////////////////////////////////////////////////////

export async function GET(req, { params }) {
  try {
    ////////////////////////////////////////////////////////////
    // 1. AUTH
    ////////////////////////////////////////////////////////////

    const authResult = await requireAdmin();

    if (authResult.error) {
      return authResult.error;
    }

    ////////////////////////////////////////////////////////////
    // 2. PARAMS
    ////////////////////////////////////////////////////////////

    const { courseId, moduleId } = await params;

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

    ////////////////////////////////////////////////////////////
    // 3. SUPABASE
    ////////////////////////////////////////////////////////////

    const supabase = createSupabaseAdmin();

    ////////////////////////////////////////////////////////////
    // 4. VERIFY COURSE
    ////////////////////////////////////////////////////////////

    const { data: course, error: courseError } = await supabase
      .from("academy_courses")
      .select(
        `
          id,
          course_code,
          title,
          slug,
          status
        `,
      )
      .eq("id", courseId)
      .maybeSingle();

    if (courseError) {
      console.error("Academy course lookup error:", courseError);

      throw new Error("Unable to verify academy course.");
    }

    if (!course) {
      return NextResponse.json(
        {
          error: "Course not found.",
        },
        {
          status: 404,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 5. VERIFY MODULE
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
      .eq("id", moduleId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (moduleError) {
      console.error("Academy module lookup error:", moduleError);

      throw new Error("Unable to verify academy module.");
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

    ////////////////////////////////////////////////////////////
    // 6. FETCH MODULE VIDEOS
    ////////////////////////////////////////////////////////////

    const { data: videos, error: videosError } = await supabase
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
          thumbnail_url,
          created_at,
          updated_at
        `,
      )
      .eq("module_id", moduleId)
      .order("sort_order", {
        ascending: true,
      });

    if (videosError) {
      console.error("Academy module videos lookup error:", videosError);

      throw new Error("Unable to fetch academy module videos.");
    }

    ////////////////////////////////////////////////////////////
    // 7. BUNNY LIBRARY ID
    ////////////////////////////////////////////////////////////

    const bunnyLibraryId = process.env.BUNNY_STREAM_LIBRARY_ID || null;

    ////////////////////////////////////////////////////////////
    // 8. ADD PLAYBACK URL
    ////////////////////////////////////////////////////////////

    const normalizedVideos = (videos ?? []).map((video) => ({
      ...video,

      playback_url:
        bunnyLibraryId && video.bunny_video_id
          ? getBunnyPlaybackUrl(bunnyLibraryId, video.bunny_video_id)
          : null,
    }));

    ////////////////////////////////////////////////////////////
    // 9. RESPONSE
    ////////////////////////////////////////////////////////////

    return NextResponse.json({
      success: true,

      course,

      module,

      videos: normalizedVideos,

      count: normalizedVideos.length,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/academy/courses/[courseId]/modules/[moduleId]/videos error:",
      error,
    );

    return NextResponse.json(
      {
        error: error?.message || "Failed to fetch academy module videos.",
      },
      {
        status: 500,
      },
    );
  }
}

//////////////////////////////////////////////////////////////
// POST
//
// /api/admin/academy/courses/[courseId]/modules/[moduleId]/videos
//
// Creates a record in:
// academy_module_videos
//
// IMPORTANT:
// The actual video is already uploaded to Bunny.
// This route only links the Bunny video to the academy module.
//////////////////////////////////////////////////////////////

export async function POST(req, { params }) {
  try {
    ////////////////////////////////////////////////////////////
    // 1. AUTH
    ////////////////////////////////////////////////////////////

    const authResult = await requireAdmin();

    if (authResult.error) {
      return authResult.error;
    }

    ////////////////////////////////////////////////////////////
    // 2. PARAMS
    ////////////////////////////////////////////////////////////

    const { courseId, moduleId } = await params;

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

    ////////////////////////////////////////////////////////////
    // 3. BODY
    ////////////////////////////////////////////////////////////

    const body = await req.json();

    const {
      title,
      description = null,
      bunny_video_id,
      duration_seconds = null,
      sort_order,
      status = "draft",
      thumbnail_url = null,
    } = body;

    ////////////////////////////////////////////////////////////
    // 4. BASIC VALIDATION
    ////////////////////////////////////////////////////////////

    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        {
          error: "Video title is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (typeof bunny_video_id !== "string" || !bunny_video_id.trim()) {
      return NextResponse.json(
        {
          error: "Bunny video ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 5. DURATION VALIDATION
    ////////////////////////////////////////////////////////////

    let parsedDuration = null;

    if (
      duration_seconds !== null &&
      duration_seconds !== undefined &&
      duration_seconds !== ""
    ) {
      parsedDuration = Number(duration_seconds);

      if (!Number.isInteger(parsedDuration) || parsedDuration < 0) {
        return NextResponse.json(
          {
            error: "Duration must be a non-negative integer.",
          },
          {
            status: 400,
          },
        );
      }
    }

    ////////////////////////////////////////////////////////////
    // 6. STATUS VALIDATION
    ////////////////////////////////////////////////////////////

    const allowedStatuses = ["draft", "published", "archived"];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid video status.",
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 7. SUPABASE
    ////////////////////////////////////////////////////////////

    const supabase = createSupabaseAdmin();

    ////////////////////////////////////////////////////////////
    // 8. VERIFY COURSE
    ////////////////////////////////////////////////////////////

    const { data: course, error: courseError } = await supabase
      .from("academy_courses")
      .select(
        `
          id,
          course_code,
          title,
          slug,
          status
        `,
      )
      .eq("id", courseId)
      .maybeSingle();

    if (courseError) {
      console.error("Academy course lookup error:", courseError);

      throw new Error("Unable to verify academy course.");
    }

    if (!course) {
      return NextResponse.json(
        {
          error: "Course not found.",
        },
        {
          status: 404,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 9. VERIFY MODULE BELONGS TO COURSE
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
      .eq("id", moduleId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (moduleError) {
      console.error("Academy module lookup error:", moduleError);

      throw new Error("Unable to verify academy module.");
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

    ////////////////////////////////////////////////////////////
    // 10. DETERMINE SORT ORDER
    //
    // If admin doesn't provide sort_order,
    // put video after the existing videos.
    ////////////////////////////////////////////////////////////

    let parsedSortOrder = null;

    if (sort_order !== null && sort_order !== undefined && sort_order !== "") {
      parsedSortOrder = Number(sort_order);

      if (!Number.isInteger(parsedSortOrder) || parsedSortOrder < 0) {
        return NextResponse.json(
          {
            error: "Sort order must be a non-negative integer.",
          },
          {
            status: 400,
          },
        );
      }
    }

    ////////////////////////////////////////////////////////////
    // 11. AUTO SORT ORDER
    ////////////////////////////////////////////////////////////

    if (parsedSortOrder === null) {
      const { data: lastVideo, error: lastVideoError } = await supabase
        .from("academy_module_videos")
        .select("sort_order")
        .eq("module_id", moduleId)
        .order("sort_order", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (lastVideoError) {
        console.error(
          "Academy module video sort lookup error:",
          lastVideoError,
        );

        throw new Error("Unable to determine video sort order.");
      }

      parsedSortOrder =
        lastVideo?.sort_order !== null && lastVideo?.sort_order !== undefined
          ? Number(lastVideo.sort_order) + 1
          : 0;
    }

    ////////////////////////////////////////////////////////////
    // 12. CHECK SORT ORDER
    ////////////////////////////////////////////////////////////

    const { data: existingSortOrder, error: existingSortOrderError } =
      await supabase
        .from("academy_module_videos")
        .select(
          `
          id,
          title,
          sort_order
        `,
        )
        .eq("module_id", moduleId)
        .eq("sort_order", parsedSortOrder)
        .maybeSingle();

    if (existingSortOrderError) {
      console.error(
        "Academy module video sort order check error:",
        existingSortOrderError,
      );

      throw new Error("Unable to check video sort order.");
    }

    if (existingSortOrder) {
      return NextResponse.json(
        {
          error:
            `Video sort order ${parsedSortOrder} ` +
            "is already being used in this module.",

          existingVideo: existingSortOrder,
        },
        {
          status: 409,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 13. CHECK DUPLICATE BUNNY VIDEO
    ////////////////////////////////////////////////////////////

    const { data: existingBunnyVideo, error: existingBunnyVideoError } =
      await supabase
        .from("academy_module_videos")
        .select(
          `
          id,
          module_id,
          title,
          bunny_video_id
        `,
        )
        .eq("bunny_video_id", bunny_video_id.trim())
        .maybeSingle();

    if (existingBunnyVideoError) {
      console.error(
        "Academy Bunny video lookup error:",
        existingBunnyVideoError,
      );

      throw new Error("Unable to check Bunny video ID.");
    }

    if (existingBunnyVideo) {
      return NextResponse.json(
        {
          error: "This Bunny video is already linked to an academy module.",

          existingVideo: existingBunnyVideo,
        },
        {
          status: 409,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 14. BUNNY LIBRARY
    ////////////////////////////////////////////////////////////

    const bunnyLibraryId = process.env.BUNNY_STREAM_LIBRARY_ID;

    if (!bunnyLibraryId) {
      return NextResponse.json(
        {
          error: "BUNNY_STREAM_LIBRARY_ID is not configured.",
        },
        {
          status: 500,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 15. BUILD PLAYBACK URL
    ////////////////////////////////////////////////////////////

    const playbackUrl = getBunnyPlaybackUrl(
      bunnyLibraryId,
      bunny_video_id.trim(),
    );

    ////////////////////////////////////////////////////////////
    // 16. INSERT INTO academy_module_videos
    ////////////////////////////////////////////////////////////

    const { data: video, error: insertError } = await supabase
      .from("academy_module_videos")
      .insert({
        module_id: moduleId,

        title: title.trim(),

        description:
          typeof description === "string" ? description.trim() || null : null,

        duration_seconds: parsedDuration,

        sort_order: parsedSortOrder,

        status,

        bunny_video_id: bunny_video_id.trim(),

        thumbnail_url:
          typeof thumbnail_url === "string" && thumbnail_url.trim()
            ? thumbnail_url.trim()
            : null,
      })
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
            thumbnail_url,
            created_at,
            updated_at
          `,
      )
      .single();

    ////////////////////////////////////////////////////////////
    // 17. DATABASE ERROR
    ////////////////////////////////////////////////////////////

    if (insertError) {
      console.error("Saving academy module video failed:", insertError);

      return NextResponse.json(
        {
          error: insertError.message || "Failed to save academy module video.",
        },
        {
          status: 500,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 18. RESPONSE
    ////////////////////////////////////////////////////////////

    return NextResponse.json(
      {
        success: true,

        message: "Academy module video created successfully.",

        video: {
          ...video,
          playback_url: playbackUrl,
        },

        course,

        module,

        bunny: {
          libraryId: bunnyLibraryId,
          videoId: bunny_video_id.trim(),
          playbackUrl,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "POST /api/admin/academy/courses/[courseId]/modules/[moduleId]/videos error:",
      error,
    );

    return NextResponse.json(
      {
        error: error?.message || "Failed to create academy module video.",
      },
      {
        status: 500,
      },
    );
  }
}
