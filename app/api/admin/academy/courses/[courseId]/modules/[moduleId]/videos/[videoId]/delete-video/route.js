import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { deleteBunnyVideo } from "@/lib/bunny";

export async function DELETE(request, { params }) {
  try {
    // ==========================================================
    // 1. AUTHENTICATION
    // ==========================================================

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

    // ==========================================================
    // 2. ADMIN ROLE
    // ==========================================================

    if (session.user.role !== "admin") {
      return NextResponse.json(
        {
          error: "Admin access required.",
        },
        {
          status: 403,
        },
      );
    }

    // ==========================================================
    // 3. PARAMS
    // ==========================================================

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

    // ==========================================================
    // 4. SUPABASE
    // ==========================================================

    const supabase = createSupabaseAdmin();

    // ==========================================================
    // 5. VERIFY COURSE + MODULE
    //
    // Make sure the module actually belongs to this course.
    // ==========================================================

    const { data: module, error: moduleError } = await supabase
      .from("academy_course_modules")
      .select(
        `
        id,
        course_id
      `,
      )
      .eq("id", moduleId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (moduleError) {
      console.error("Academy module verification failed:", moduleError);

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
          error: "Academy module was not found for this course.",
        },
        {
          status: 404,
        },
      );
    }

    // ==========================================================
    // 6. FIND VIDEO
    //
    // Verify the video belongs to the module.
    // ==========================================================

    const { data: video, error: videoError } = await supabase
      .from("academy_module_videos")
      .select(
        `
        id,
        module_id,
        bunny_video_id
      `,
      )
      .eq("id", videoId)
      .eq("module_id", moduleId)
      .maybeSingle();

    if (videoError) {
      console.error("Academy video lookup failed:", videoError);

      return NextResponse.json(
        {
          error: "Unable to find academy video.",
        },
        {
          status: 500,
        },
      );
    }

    if (!video) {
      return NextResponse.json(
        {
          error: "Academy video not found in this module.",
        },
        {
          status: 404,
        },
      );
    }

    // ==========================================================
    // 7. DELETE FROM BUNNY
    //
    // Bunny must succeed before removing the database record.
    // ==========================================================

    if (video.bunny_video_id) {
      try {
        await deleteBunnyVideo(video.bunny_video_id);
      } catch (error) {
        console.error("Bunny video deletion failed:", error);

        return NextResponse.json(
          {
            error:
              "The video could not be deleted from Bunny Stream. The academy video record was not deleted.",
          },
          {
            status: 502,
          },
        );
      }
    }

    // ==========================================================
    // 8. DELETE DATABASE RECORD
    // ==========================================================

    const { error: deleteError } = await supabase
      .from("academy_module_videos")
      .delete()
      .eq("id", videoId)
      .eq("module_id", moduleId);

    if (deleteError) {
      console.error(
        "Academy module video database deletion failed:",
        deleteError,
      );

      return NextResponse.json(
        {
          error:
            "Bunny video was deleted, but the academy video record could not be deleted.",
        },
        {
          status: 500,
        },
      );
    }

    // ==========================================================
    // 9. SUCCESS
    // ==========================================================

    return NextResponse.json({
      success: true,
      message: "Academy video deleted successfully.",
      videoId,
      moduleId,
      courseId,
    });
  } catch (error) {
    console.error("Academy video deletion fatal error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to delete academy video.",
      },
      {
        status: 500,
      },
    );
  }
}
