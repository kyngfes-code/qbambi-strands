import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

//////////////////////////////////////////////////////////////
// AUTH
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
// POST
//
// /api/admin/academy/courses/[courseId]/modules/[moduleId]/videos/reorder
//
// Body:
//
// {
//   "videoIds": [
//     "uuid-1",
//     "uuid-2",
//     "uuid-3"
//   ]
// }
//
// The order of videoIds becomes:
//
// videoIds[0] -> sort_order 0
// videoIds[1] -> sort_order 1
// videoIds[2] -> sort_order 2
//
// academy_module_videos has:
//
//   id
//   module_id
//   title
//   description
//   duration_seconds
//   sort_order
//   status
//   bunny_video_id
//   thumbnail_url
//   created_at
//   updated_at
//
// There is a UNIQUE constraint on:
//
//   (module_id, sort_order)
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

    let body;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error: "Request body must contain valid JSON.",
        },
        {
          status: 400,
        },
      );
    }

    const { videoIds } = body;

    ////////////////////////////////////////////////////////////
    // 4. VALIDATE videoIds
    ////////////////////////////////////////////////////////////

    if (!Array.isArray(videoIds)) {
      return NextResponse.json(
        {
          error: "videoIds must be an array.",
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // EMPTY MODULE
    ////////////////////////////////////////////////////////////

    if (videoIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No videos to reorder.",
        videos: [],
      });
    }

    ////////////////////////////////////////////////////////////
    // 5. VALIDATE IDS
    ////////////////////////////////////////////////////////////

    const invalidIds = videoIds.filter(
      (id) => typeof id !== "string" || !id.trim(),
    );

    if (invalidIds.length > 0) {
      return NextResponse.json(
        {
          error: "Every video ID must be a valid non-empty string.",
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // NORMALIZE IDS
    ////////////////////////////////////////////////////////////

    const normalizedVideoIds = videoIds.map((id) => id.trim());

    ////////////////////////////////////////////////////////////
    // 6. CHECK DUPLICATES
    ////////////////////////////////////////////////////////////

    const uniqueVideoIds = new Set(normalizedVideoIds);

    if (uniqueVideoIds.size !== normalizedVideoIds.length) {
      return NextResponse.json(
        {
          error: "Duplicate video IDs are not allowed.",
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
      throw courseError;
    }

    if (!course) {
      return NextResponse.json(
        {
          error: "Academy course not found.",
        },
        {
          status: 404,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 9. VERIFY MODULE
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
          status,
          created_at,
          updated_at
        `,
      )
      .eq("id", moduleId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (moduleError) {
      throw moduleError;
    }

    if (!module) {
      return NextResponse.json(
        {
          error: "Academy course module not found.",
        },
        {
          status: 404,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 10. FETCH MODULE VIDEOS
    //
    // IMPORTANT:
    // academy_module_videos only needs module_id because the
    // module itself belongs to the course.
    ////////////////////////////////////////////////////////////

    const { data: existingVideos, error: videosError } = await supabase
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
      })
      .order("created_at", {
        ascending: true,
      });

    if (videosError) {
      throw videosError;
    }

    const videos = existingVideos || [];

    ////////////////////////////////////////////////////////////
    // 11. VERIFY ALL VIDEO IDS BELONG TO MODULE
    ////////////////////////////////////////////////////////////

    const existingVideoIds = new Set(videos.map((video) => video.id));

    const invalidVideoIds = normalizedVideoIds.filter(
      (videoId) => !existingVideoIds.has(videoId),
    );

    if (invalidVideoIds.length > 0) {
      return NextResponse.json(
        {
          error: "One or more video IDs do not belong to this module.",

          invalidVideoIds,
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 12. REQUIRE COMPLETE LIST
    //
    // The frontend must send every video in the module.
    //
    ////////////////////////////////////////////////////////////

    if (normalizedVideoIds.length !== videos.length) {
      return NextResponse.json(
        {
          error:
            "The reorder request must contain every video belonging to this module.",

          expectedCount: videos.length,

          receivedCount: normalizedVideoIds.length,
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 13. MAKE SURE THERE ARE NO MISSING IDS
    ////////////////////////////////////////////////////////////

    if (existingVideoIds.size !== uniqueVideoIds.size) {
      return NextResponse.json(
        {
          error:
            "The reorder request does not contain every video belonging to this module.",
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 14. TEMPORARY SORT ORDERS
    //
    // Because:
    //
    // UNIQUE(module_id, sort_order)
    //
    // exists, directly changing:
    //
    // 0 -> 1
    // 1 -> 0
    //
    // can cause a duplicate-key error.
    //
    // We first move every video to a unique negative number.
    //
    // Example:
    //
    // video A -> -1
    // video B -> -2
    // video C -> -3
    ////////////////////////////////////////////////////////////

    const temporaryTimestamp = new Date().toISOString();

    for (let index = 0; index < videos.length; index++) {
      const video = videos[index];

      const { error: temporaryUpdateError } = await supabase
        .from("academy_module_videos")
        .update({
          sort_order: -(index + 1),
          updated_at: temporaryTimestamp,
        })
        .eq("id", video.id)
        .eq("module_id", moduleId);

      if (temporaryUpdateError) {
        throw temporaryUpdateError;
      }
    }

    ////////////////////////////////////////////////////////////
    // 15. APPLY FINAL ORDER
    //
    // sort_order is zero-based:
    //
    // first video  -> 0
    // second video -> 1
    // third video  -> 2
    //
    ////////////////////////////////////////////////////////////

    const updatedVideos = [];

    for (let index = 0; index < normalizedVideoIds.length; index++) {
      const videoId = normalizedVideoIds[index];

      const finalSortOrder = index;

      const { data: updatedVideo, error: updateError } = await supabase
        .from("academy_module_videos")
        .update({
          sort_order: finalSortOrder,
          updated_at: new Date().toISOString(),
        })
        .eq("id", videoId)
        .eq("module_id", moduleId)
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

      if (updateError) {
        throw updateError;
      }

      updatedVideos.push(updatedVideo);
    }

    ////////////////////////////////////////////////////////////
    // 16. SORT RESPONSE
    ////////////////////////////////////////////////////////////

    updatedVideos.sort((a, b) => a.sort_order - b.sort_order);

    ////////////////////////////////////////////////////////////
    // 17. RESPONSE
    ////////////////////////////////////////////////////////////

    return NextResponse.json({
      success: true,

      message: "Academy module videos reordered successfully.",

      course,

      module,

      videos: updatedVideos,

      count: updatedVideos.length,
    });
  } catch (error) {
    console.error("POST academy module video reorder error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Failed to reorder academy module videos.",
      },
      {
        status: 500,
      },
    );
  }
}
