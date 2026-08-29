import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { updateBunnyVideo } from "@/lib/bunny";

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

async function verifyCourseAndModule(supabase, courseId, moduleId) {
  ////////////////////////////////////////////////////////////
  // VERIFY COURSE
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
    return {
      error: NextResponse.json(
        {
          error: "Course not found.",
        },
        {
          status: 404,
        },
      ),
    };
  }

  ////////////////////////////////////////////////////////////
  // VERIFY MODULE BELONGS TO COURSE
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
    throw moduleError;
  }

  if (!module) {
    return {
      error: NextResponse.json(
        {
          error: "Module not found for this course.",
        },
        {
          status: 404,
        },
      ),
    };
  }

  return {
    course,
    module,
  };
}

//////////////////////////////////////////////////////////////
// CONSTANTS
//////////////////////////////////////////////////////////////

const VIDEO_SELECT = `
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
`;

const ALLOWED_STATUSES = ["draft", "published", "archived"];

//////////////////////////////////////////////////////////////
// GET
//
// GET /api/admin/academy/courses/[courseId]/modules/[moduleId]/videos/[videoId]
//////////////////////////////////////////////////////////////

export async function GET(req, { params }) {
  try {
    ////////////////////////////////////////////////////////////
    // AUTH
    ////////////////////////////////////////////////////////////

    const adminCheck = await requireAdmin();

    if (adminCheck.error) {
      return adminCheck.error;
    }

    ////////////////////////////////////////////////////////////
    // PARAMS
    ////////////////////////////////////////////////////////////

    const { courseId, moduleId, videoId } = await params;

    if (!courseId || !moduleId || !videoId) {
      return NextResponse.json(
        {
          error: "Course ID, module ID and video ID are required.",
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
    // VERIFY COURSE + MODULE
    ////////////////////////////////////////////////////////////

    const verified = await verifyCourseAndModule(supabase, courseId, moduleId);

    if (verified.error) {
      return verified.error;
    }

    const { course, module } = verified;

    ////////////////////////////////////////////////////////////
    // FETCH VIDEO
    ////////////////////////////////////////////////////////////

    const { data: video, error: videoError } = await supabase
      .from("academy_module_videos")
      .select(VIDEO_SELECT)
      .eq("id", videoId)
      .eq("module_id", moduleId)
      .maybeSingle();

    if (videoError) {
      throw videoError;
    }

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
    // RESPONSE
    ////////////////////////////////////////////////////////////

    return NextResponse.json({
      success: true,
      video,
      module,
      course,
    });
  } catch (error) {
    console.error("GET academy module video error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Failed to fetch academy module video.",
      },
      {
        status: 500,
      },
    );
  }
}

//////////////////////////////////////////////////////////////
// PATCH
//
// Update academy module video
//
// If the title changes:
// 1. Verify Bunny video exists
// 2. Update Bunny title
// 3. Update Supabase record
//
// If Bunny update fails, Supabase is NOT updated.
//////////////////////////////////////////////////////////////

export async function PATCH(req, { params }) {
  try {
    ////////////////////////////////////////////////////////////
    // AUTH
    ////////////////////////////////////////////////////////////

    const adminCheck = await requireAdmin();

    if (adminCheck.error) {
      return adminCheck.error;
    }

    ////////////////////////////////////////////////////////////
    // PARAMS
    ////////////////////////////////////////////////////////////

    const { courseId, moduleId, videoId } = await params;

    if (!courseId || !moduleId || !videoId) {
      return NextResponse.json(
        {
          error: "Course ID, module ID and video ID are required.",
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // BODY
    ////////////////////////////////////////////////////////////

    let body;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON request body.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      title,
      description,
      duration_seconds,
      sort_order,
      status,
      bunny_video_id,
      thumbnail_url,
    } = body;

    ////////////////////////////////////////////////////////////
    // SUPABASE
    ////////////////////////////////////////////////////////////

    const supabase = createSupabaseAdmin();

    ////////////////////////////////////////////////////////////
    // VERIFY COURSE + MODULE
    ////////////////////////////////////////////////////////////

    const verified = await verifyCourseAndModule(supabase, courseId, moduleId);

    if (verified.error) {
      return verified.error;
    }

    const { course, module } = verified;

    ////////////////////////////////////////////////////////////
    // VERIFY EXISTING VIDEO
    ////////////////////////////////////////////////////////////

    const { data: existingVideo, error: existingVideoError } = await supabase
      .from("academy_module_videos")
      .select(VIDEO_SELECT)
      .eq("id", videoId)
      .eq("module_id", moduleId)
      .maybeSingle();

    if (existingVideoError) {
      throw existingVideoError;
    }

    if (!existingVideo) {
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
    // VALIDATE TITLE
    ////////////////////////////////////////////////////////////

    let parsedTitle;

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return NextResponse.json(
          {
            error: "Video title cannot be empty.",
          },
          {
            status: 400,
          },
        );
      }

      parsedTitle = title.trim();
    }

    ////////////////////////////////////////////////////////////
    // VALIDATE DESCRIPTION
    ////////////////////////////////////////////////////////////

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return NextResponse.json(
        {
          error: "Video description must be text.",
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // VALIDATE DURATION
    ////////////////////////////////////////////////////////////

    let parsedDuration;

    if (duration_seconds !== undefined) {
      if (
        duration_seconds !== null &&
        duration_seconds !== "" &&
        (!Number.isInteger(Number(duration_seconds)) ||
          Number(duration_seconds) < 0)
      ) {
        return NextResponse.json(
          {
            error: "Duration must be a non-negative integer.",
          },
          {
            status: 400,
          },
        );
      }

      parsedDuration =
        duration_seconds === null || duration_seconds === ""
          ? null
          : Number(duration_seconds);
    }

    ////////////////////////////////////////////////////////////
    // VALIDATE SORT ORDER
    ////////////////////////////////////////////////////////////

    let parsedSortOrder;

    if (sort_order !== undefined) {
      if (
        sort_order === null ||
        sort_order === "" ||
        !Number.isInteger(Number(sort_order)) ||
        Number(sort_order) < 0
      ) {
        return NextResponse.json(
          {
            error: "Sort order must be a non-negative integer.",
          },
          {
            status: 400,
          },
        );
      }

      parsedSortOrder = Number(sort_order);
    }

    ////////////////////////////////////////////////////////////
    // VALIDATE STATUS
    ////////////////////////////////////////////////////////////

    if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid status. Use draft, published or archived.",
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // VALIDATE BUNNY VIDEO ID
    ////////////////////////////////////////////////////////////

    let parsedBunnyVideoId;

    if (bunny_video_id !== undefined) {
      if (typeof bunny_video_id !== "string" || !bunny_video_id.trim()) {
        return NextResponse.json(
          {
            error: "Bunny video ID cannot be empty.",
          },
          {
            status: 400,
          },
        );
      }

      parsedBunnyVideoId = bunny_video_id.trim();
    }

    ////////////////////////////////////////////////////////////
    // VALIDATE THUMBNAIL URL
    ////////////////////////////////////////////////////////////

    let parsedThumbnailUrl;

    if (thumbnail_url !== undefined) {
      if (thumbnail_url !== null && typeof thumbnail_url !== "string") {
        return NextResponse.json(
          {
            error: "Thumbnail URL must be text.",
          },
          {
            status: 400,
          },
        );
      }

      parsedThumbnailUrl =
        thumbnail_url === null ? null : thumbnail_url.trim() || null;
    }

    ////////////////////////////////////////////////////////////
    // DETERMINE WHETHER TITLE CHANGED
    ////////////////////////////////////////////////////////////

    const titleChanged =
      parsedTitle !== undefined && parsedTitle !== existingVideo.title;

    ////////////////////////////////////////////////////////////
    // UPDATE BUNNY TITLE FIRST
    ////////////////////////////////////////////////////////////

    if (titleChanged) {
      if (!existingVideo.bunny_video_id) {
        return NextResponse.json(
          {
            error:
              "This academy video does not have a Bunny Stream video ID, so its Bunny title cannot be updated.",
          },
          {
            status: 409,
          },
        );
      }

      try {
        await updateBunnyVideo(existingVideo.bunny_video_id, {
          title: parsedTitle,
        });
      } catch (bunnyError) {
        console.error("Bunny video title update failed:", bunnyError);

        return NextResponse.json(
          {
            error:
              bunnyError?.message ||
              "Unable to update the video title in Bunny Stream.",
          },
          {
            status: 502,
          },
        );
      }
    }

    ////////////////////////////////////////////////////////////
    // BUILD SUPABASE UPDATE
    ////////////////////////////////////////////////////////////

    const updateData = {};

    if (parsedTitle !== undefined) {
      updateData.title = parsedTitle;
    }

    if (description !== undefined) {
      updateData.description =
        description === null ? null : description.trim() || null;
    }

    if (duration_seconds !== undefined) {
      updateData.duration_seconds = parsedDuration;
    }

    if (sort_order !== undefined) {
      updateData.sort_order = parsedSortOrder;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (bunny_video_id !== undefined) {
      updateData.bunny_video_id = parsedBunnyVideoId;
    }

    if (thumbnail_url !== undefined) {
      updateData.thumbnail_url = parsedThumbnailUrl;
    }

    updateData.updated_at = new Date().toISOString();

    ////////////////////////////////////////////////////////////
    // NOTHING TO UPDATE
    ////////////////////////////////////////////////////////////

    if (Object.keys(updateData).length === 1) {
      return NextResponse.json(
        {
          error: "No video fields were provided for update.",
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // DUPLICATE BUNNY VIDEO ID
    ////////////////////////////////////////////////////////////

    if (
      parsedBunnyVideoId !== undefined &&
      parsedBunnyVideoId !== existingVideo.bunny_video_id
    ) {
      const { data: duplicateBunny, error: duplicateBunnyError } =
        await supabase
          .from("academy_module_videos")
          .select("id, module_id, title, bunny_video_id")
          .eq("bunny_video_id", parsedBunnyVideoId)
          .neq("id", videoId)
          .maybeSingle();

      if (duplicateBunnyError) {
        throw duplicateBunnyError;
      }

      if (duplicateBunny) {
        return NextResponse.json(
          {
            error: "Another academy video already uses this Bunny video ID.",
            existingVideo: duplicateBunny,
          },
          {
            status: 409,
          },
        );
      }
    }

    ////////////////////////////////////////////////////////////
    // DUPLICATE SORT ORDER
    ////////////////////////////////////////////////////////////

    if (
      parsedSortOrder !== undefined &&
      parsedSortOrder !== existingVideo.sort_order
    ) {
      const { data: duplicateSortOrder, error: duplicateSortError } =
        await supabase
          .from("academy_module_videos")
          .select("id, title, bunny_video_id, sort_order")
          .eq("module_id", moduleId)
          .eq("sort_order", parsedSortOrder)
          .neq("id", videoId)
          .maybeSingle();

      if (duplicateSortError) {
        throw duplicateSortError;
      }

      if (duplicateSortOrder) {
        return NextResponse.json(
          {
            error: `Sort order ${parsedSortOrder} is already being used in this module.`,
            existingVideo: duplicateSortOrder,
          },
          {
            status: 409,
          },
        );
      }
    }

    ////////////////////////////////////////////////////////////
    // UPDATE SUPABASE
    ////////////////////////////////////////////////////////////

    const { data: video, error: updateError } = await supabase
      .from("academy_module_videos")
      .update(updateData)
      .eq("id", videoId)
      .eq("module_id", moduleId)
      .select(VIDEO_SELECT)
      .single();

    if (updateError) {
      //////////////////////////////////////////////////////////
      // HANDLE UNIQUE CONSTRAINT RACE CONDITIONS
      //////////////////////////////////////////////////////////

      if (updateError.code === "23505") {
        return NextResponse.json(
          {
            error:
              "Another video already uses the same Bunny video ID or sort order.",
          },
          {
            status: 409,
          },
        );
      }

      throw updateError;
    }

    ////////////////////////////////////////////////////////////
    // RESPONSE
    ////////////////////////////////////////////////////////////

    return NextResponse.json({
      success: true,

      message: titleChanged
        ? "Academy video and Bunny Stream title updated successfully."
        : "Academy video updated successfully.",

      video,

      module,

      course,
    });
  } catch (error) {
    console.error("PATCH academy module video error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Failed to update academy module video.",
      },
      {
        status: 500,
      },
    );
  }
}
