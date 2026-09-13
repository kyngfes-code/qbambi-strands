import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

//////////////////////////////////////////////////////////////
// POST
//////////////////////////////////////////////////////////////

export async function POST(req, { params }) {
  try {
    ////////////////////////////////////////////////////////////
    // AUTH
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
    // LOAD MODULE VIDEO
    //
    // academy_module_videos does not contain course_id.
    // We get the course through academy_course_modules.
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
          thumbnail_url,
          created_at,
          updated_at,
          module:academy_course_modules!academy_module_videos_module_fkey(
            id,
            course_id,
            module_code,
            title,
            sort_order,
            status
          )
        `,
      )
      .eq("id", videoId)
      .maybeSingle();

    if (videoError) {
      console.error("Academy module video lookup:", videoError);

      return NextResponse.json(
        {
          error: "Unable to load video.",
        },
        {
          status: 500,
        },
      );
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
    // VERIFY MODULE
    ////////////////////////////////////////////////////////////

    const module = Array.isArray(video.module) ? video.module[0] : video.module;

    if (!module) {
      return NextResponse.json(
        {
          error: "The video module could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // COURSE ID
    ////////////////////////////////////////////////////////////

    const courseId = module.course_id;

    if (!courseId) {
      return NextResponse.json(
        {
          error: "The video course could not be determined.",
        },
        {
          status: 500,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // VIDEO MUST BE PUBLISHED
    ////////////////////////////////////////////////////////////

    if (video.status !== "published") {
      return NextResponse.json(
        {
          error: "This video is not available.",
        },
        {
          status: 403,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // VERIFY VIDEO ACCESS
    //
    // IMPORTANT:
    // The server determines the enrollment.
    // We do NOT accept enrollment_id from the browser.
    //
    // IMPORTANT:
    // academy_can_access_video must use
    // academy_module_videos internally.
    ////////////////////////////////////////////////////////////

    const { data: access, error: accessError } = await supabase.rpc(
      "academy_can_access_video",
      {
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

    const accessResult = Array.isArray(access) ? access[0] : access;

    if (accessResult?.can_access !== true) {
      return NextResponse.json(
        {
          error:
            accessResult?.reason || "You do not have access to this video.",
        },
        {
          status: 403,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // SERVER-DETERMINED ENROLLMENT
    ////////////////////////////////////////////////////////////

    const enrollmentId = accessResult?.enrollment_id;

    if (!enrollmentId) {
      return NextResponse.json(
        {
          error: "Active academy enrollment could not be determined.",
        },
        {
          status: 403,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // VERIFY ENROLLMENT BELONGS TO CURRENT USER
    ////////////////////////////////////////////////////////////

    const { data: enrollment, error: enrollmentError } = await supabase
      .from("academy_enrollments")
      .select(
        `
          id,
          user_id,
          status
        `,
      )
      .eq("id", enrollmentId)
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (enrollmentError) {
      console.error("Academy confirmation enrollment lookup:", enrollmentError);

      return NextResponse.json(
        {
          error: "Unable to verify enrollment.",
        },
        {
          status: 500,
        },
      );
    }

    if (!enrollment) {
      return NextResponse.json(
        {
          error: "Enrollment not found.",
        },
        {
          status: 403,
        },
      );
    }

    if (!["enrolled", "completed"].includes(enrollment.status)) {
      return NextResponse.json(
        {
          error: "Your academy enrollment is not active.",
        },
        {
          status: 403,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // LOAD VIDEO PROGRESS
    ////////////////////////////////////////////////////////////

    const { data: progress, error: progressError } = await supabase
      .from("academy_student_video_progress")
      .select("*")
      .eq("enrollment_id", enrollment.id)
      .eq("video_id", video.id)
      .maybeSingle();

    if (progressError) {
      console.error(
        "Academy video confirmation progress lookup:",
        progressError,
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

    ////////////////////////////////////////////////////////////
    // NO PROGRESS
    ////////////////////////////////////////////////////////////

    if (!progress) {
      return NextResponse.json(
        {
          error: "You must watch the video before confirming it.",
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // MUST BE COMPLETED
    ////////////////////////////////////////////////////////////

    if (progress.completed !== true) {
      return NextResponse.json(
        {
          error: "You must finish watching this video before confirming it.",

          progress: {
            watchedSeconds: progress.watched_seconds,
            durationSeconds: progress.duration_seconds,
            watchPercentage: progress.watch_percentage,
            completed: progress.completed,
            confirmedGood: progress.confirmed_good,
          },
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // ALREADY CONFIRMED
    ////////////////////////////////////////////////////////////

    if (progress.confirmed_good === true) {
      return NextResponse.json({
        success: true,

        alreadyConfirmed: true,

        message: "This video has already been confirmed.",

        progress: {
          id: progress.id,

          videoId: progress.video_id,

          completed: true,

          confirmedGood: true,

          completedAt: progress.completed_at,

          confirmedAt: progress.confirmed_at,
        },
      });
    }

    ////////////////////////////////////////////////////////////
    // CONFIRM VIDEO
    ////////////////////////////////////////////////////////////

    const confirmedAt = new Date().toISOString();

    const { data: updatedProgress, error: updateError } = await supabase
      .from("academy_student_video_progress")
      .update({
        confirmed_good: true,

        confirmed_at: confirmedAt,

        updated_at: confirmedAt,

        last_watched_at: confirmedAt,
      })
      .eq("id", progress.id)
      .eq("enrollment_id", enrollment.id)
      .eq("video_id", video.id)
      .select()
      .single();

    if (updateError) {
      console.error("Academy video confirmation update:", updateError);

      return NextResponse.json(
        {
          error: "Unable to confirm this video.",
        },
        {
          status: 500,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // FIND ALL PUBLISHED MODULE VIDEOS
    //
    // We now build the course-wide order using:
    //
    // module.sort_order
    // +
    // video.sort_order
    //
    ////////////////////////////////////////////////////////////

    const { data: courseModules, error: courseModulesError } = await supabase
      .from("academy_course_modules")
      .select(
        `
            id,
            course_id,
            sort_order,
            status
          `,
      )
      .eq("course_id", courseId)
      .order("sort_order", {
        ascending: true,
      });

    if (courseModulesError) {
      console.error("Academy course modules lookup:", courseModulesError);
    }

    ////////////////////////////////////////////////////////////
    // NEXT VIDEO
    ////////////////////////////////////////////////////////////

    let nextVideo = null;

    if (courseModules?.length) {
      const moduleIds = courseModules.map((item) => item.id);

      const { data: allPublishedVideos, error: videosError } = await supabase
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
        .in("module_id", moduleIds)
        .eq("status", "published");

      if (videosError) {
        console.error("Next academy module video lookup:", videosError);
      } else {
        ////////////////////////////////////////////////////////
        // MODULE ORDER MAP
        ////////////////////////////////////////////////////////

        const moduleOrder = new Map(
          (courseModules ?? []).map((item) => [
            item.id,
            Number(item.sort_order ?? 0),
          ]),
        );

        ////////////////////////////////////////////////////////
        // COURSE-WIDE VIDEO ORDER
        ////////////////////////////////////////////////////////

        const orderedVideos = [...(allPublishedVideos ?? [])].sort((a, b) => {
          const moduleA = moduleOrder.get(a.module_id) ?? 0;
          const moduleB = moduleOrder.get(b.module_id) ?? 0;

          if (moduleA !== moduleB) {
            return moduleA - moduleB;
          }

          const videoA = Number(a.sort_order ?? 0);
          const videoB = Number(b.sort_order ?? 0);

          if (videoA !== videoB) {
            return videoA - videoB;
          }

          return a.id.localeCompare(b.id);
        });

        ////////////////////////////////////////////////////////
        // CURRENT VIDEO INDEX
        ////////////////////////////////////////////////////////

        const currentIndex = orderedVideos.findIndex(
          (item) => item.id === video.id,
        );

        ////////////////////////////////////////////////////////
        // NEXT VIDEO
        ////////////////////////////////////////////////////////

        if (currentIndex !== -1 && currentIndex < orderedVideos.length - 1) {
          nextVideo = orderedVideos[currentIndex + 1];
        }
      }
    }

    ////////////////////////////////////////////////////////////
    // COURSE COMPLETION
    ////////////////////////////////////////////////////////////

    const courseCompleted = !nextVideo;

    ////////////////////////////////////////////////////////////
    // COURSE VIDEO PROGRESS
    ////////////////////////////////////////////////////////////

    const { data: allCourseVideos, error: allCourseVideosError } =
      await supabase
        .from("academy_module_videos")
        .select(
          `
            id,
            module_id
          `,
        )
        .in(
          "module_id",
          (courseModules ?? []).map((item) => item.id),
        )
        .eq("status", "published");

    if (allCourseVideosError) {
      console.error(
        "Course module videos completion lookup:",
        allCourseVideosError,
      );
    }

    const totalVideos = allCourseVideos?.length ?? 0;

    ////////////////////////////////////////////////////////////
    // COMPLETED VIDEOS
    ////////////////////////////////////////////////////////////

    let completedVideos = 0;

    if (totalVideos > 0) {
      const videoIds = allCourseVideos.map((item) => item.id);

      const { data: completedRows, error: completedRowsError } = await supabase
        .from("academy_student_video_progress")
        .select("video_id")
        .eq("enrollment_id", enrollment.id)
        .eq("completed", true)
        .eq("confirmed_good", true)
        .in("video_id", videoIds);

      if (completedRowsError) {
        console.error("Completed module videos lookup:", completedRowsError);
      } else {
        completedVideos = completedRows?.length ?? 0;
      }
    }

    ////////////////////////////////////////////////////////////
    // PROGRESS PERCENTAGE
    ////////////////////////////////////////////////////////////

    const progressPercentage =
      totalVideos > 0
        ? Number(((completedVideos / totalVideos) * 100).toFixed(2))
        : 0;

    ////////////////////////////////////////////////////////////
    // UPDATE COURSE PROGRESS
    ////////////////////////////////////////////////////////////

    const now = new Date().toISOString();

    const { error: courseProgressError } = await supabase
      .from("academy_student_course_progress")
      .upsert(
        {
          enrollment_id: enrollment.id,

          course_id: courseId,

          completed_videos: completedVideos,

          total_videos: totalVideos,

          progress_percentage: progressPercentage,

          last_accessed_at: now,

          completed_at: courseCompleted ? now : null,

          updated_at: now,
        },
        {
          onConflict: "enrollment_id,course_id",
        },
      );

    if (courseProgressError) {
      console.error(
        "Academy student course progress update:",
        courseProgressError,
      );
    }

    ////////////////////////////////////////////////////////////
    // RESPONSE
    ////////////////////////////////////////////////////////////

    return NextResponse.json({
      success: true,

      message: "Video confirmed successfully.",

      progress: {
        id: updatedProgress.id,

        videoId: updatedProgress.video_id,

        completed: updatedProgress.completed,

        confirmedGood: updatedProgress.confirmed_good,

        completedAt: updatedProgress.completed_at,

        confirmedAt: updatedProgress.confirmed_at,
      },

      courseProgress: {
        completedVideos,

        totalVideos,

        progressPercentage,

        completed: totalVideos > 0 && completedVideos === totalVideos,
      },

      nextVideo: nextVideo
        ? {
            id: nextVideo.id,

            moduleId: nextVideo.module_id,

            title: nextVideo.title,

            sortOrder: nextVideo.sort_order,

            durationSeconds: nextVideo.duration_seconds,

            bunnyVideoId: nextVideo.bunny_video_id,

            thumbnailUrl: nextVideo.thumbnail_url,

            unlocked: true,
          }
        : null,

      courseCompleted,
    });
  } catch (error) {
    console.error("Academy module video confirmation API error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to confirm video.",
      },
      {
        status: 500,
      },
    );
  }
}
