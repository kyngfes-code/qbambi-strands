import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { createBunnyEmbedUrl } from "@/lib/bunny-stream";

export async function GET(request, { params }) {
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
    // 2. ROLE
    // ==========================================================

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

    // ==========================================================
    // 3. PARAMS
    // ==========================================================

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

    // ==========================================================
    // 4. SUPABASE
    // ==========================================================

    const supabase = createSupabaseAdmin();

    // ==========================================================
    // 5. STUDENT
    // ==========================================================

    const { data: student, error: studentError } = await supabase
      .from("academy_students")
      .select(
        `
        id,
        student_number,
        email,
        status,
        is_active,
        first_name,
        last_name,
        other_name,
        phone,
        whatsapp,
        user_id
      `,
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (studentError) {
      console.error("Academy module student lookup failed:", studentError);

      return NextResponse.json(
        {
          error: "Unable to load academy student.",
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

    // ==========================================================
    // 6. FIND MODULE
    // ==========================================================

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
      console.error("Academy module lookup failed:", moduleError);

      return NextResponse.json(
        {
          error: "Unable to load academy module.",
        },
        {
          status: 500,
        },
      );
    }

    if (!module) {
      return NextResponse.json(
        {
          error: "Academy module not found.",
        },
        {
          status: 404,
        },
      );
    }

    // ==========================================================
    // 7. MODULE AVAILABILITY
    // ==========================================================

    if (module.status !== "published") {
      return NextResponse.json(
        {
          error: "This module is not currently available.",
        },
        {
          status: 403,
        },
      );
    }

    // ==========================================================
    // 8. VERIFY COURSE
    // ==========================================================

    const { data: course, error: courseError } = await supabase
      .from("academy_courses")
      .select(
        `
        id,
        course_code,
        title,
        slug,
        description,
        thumbnail_path,
        duration_minutes,
        status,
        sort_order,
        created_at,
        updated_at
      `,
      )
      .eq("id", courseId)
      .maybeSingle();

    if (courseError) {
      console.error("Academy course lookup failed:", courseError);

      return NextResponse.json(
        {
          error: "Unable to load academy course.",
        },
        {
          status: 500,
        },
      );
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

    // ==========================================================
    // 9. COURSE AVAILABILITY
    // ==========================================================

    if (course.status !== "published") {
      return NextResponse.json(
        {
          error: "This course is not currently available.",
        },
        {
          status: 403,
        },
      );
    }

    // ==========================================================
    // 10. FIND COURSE ENROLLMENTS
    //
    // academy_enrollments does not have course_id.
    //
    // Relationship:
    //
    // academy_enrollments
    //        ↓
    // academy_enrollment_courses
    // ==========================================================

    const { data: enrollmentCourses, error: enrollmentCoursesError } =
      await supabase
        .from("academy_enrollment_courses")
        .select(
          `
          id,
          enrollment_id,
          course_id,
          course_price,
          pricing_id,
          duration_months
        `,
        )
        .eq("course_id", courseId);

    if (enrollmentCoursesError) {
      console.error(
        "Academy enrollment course lookup failed:",
        enrollmentCoursesError,
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

    const enrollmentIds = (enrollmentCourses ?? [])
      .map((row) => row.enrollment_id)
      .filter(Boolean);

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
    // 11. VERIFY USER OWNS ENROLLMENT
    // ==========================================================

    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("academy_enrollments")
      .select(
        `
        id,
        user_id,
        enrollment_number,
        status,
        learning_mode,
        total_course_fee,
        amount_paid,
        balance_due,
        payment_status,
        payment_plan_id,
        additional_fee_percentage,
        total_payable,
        initial_payment_amount,
        initial_payment_percentage,
        created_at,
        updated_at
      `,
      )
      .eq("user_id", userId)
      .in("id", enrollmentIds)
      .eq("status", "enrolled")
      .order("created_at", {
        ascending: false,
      });

    if (enrollmentsError) {
      console.error(
        "Academy student enrollment verification failed:",
        enrollmentsError,
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

    const validEnrollments = enrollments ?? [];

    if (!validEnrollments.length) {
      return NextResponse.json(
        {
          error: "You are not currently enrolled in this course.",
        },
        {
          status: 403,
        },
      );
    }

    // Newest active enrollment
    const enrollment = validEnrollments[0];

    // ==========================================================
    // 12. LOAD MODULE VIDEOS
    //
    // ACTUAL TABLE:
    // academy_module_videos
    //
    // ACTUAL COLUMNS:
    // id
    // module_id
    // title
    // description
    // duration_seconds
    // sort_order
    // status
    // created_at
    // updated_at
    // bunny_video_id
    // thumbnail_url
    //
    // NO video_code
    // NO is_preview
    // ==========================================================

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
        created_at,
        updated_at,
        bunny_video_id,
        thumbnail_url
      `,
      )
      .eq("module_id", moduleId)
      .eq("status", "published")
      .order("sort_order", {
        ascending: true,
      })
      .order("created_at", {
        ascending: true,
      });

    if (videosError) {
      console.error("Academy module videos lookup failed:", videosError);

      return NextResponse.json(
        {
          error: "Unable to load academy module videos.",
        },
        {
          status: 500,
        },
      );
    }

    // ==========================================================
    // 13. CREATE SECURE BUNNY EMBED URLS
    //
    // IMPORTANT:
    //
    // BUNNY_STREAM_TOKEN_KEY NEVER goes to the browser.
    //
    // The server creates the signed URL and sends only the
    // resulting embed URL to the AcademyModuleClient.
    //
    // URL lifetime:
    // 1 hour
    // ==========================================================

    const moduleVideos = (videos ?? []).map((video) => {
      let embedUrl = null;

      if (video.bunny_video_id) {
        try {
          embedUrl = createBunnyEmbedUrl(video.bunny_video_id, 60 * 60);
        } catch (error) {
          console.error(
            `Failed to create Bunny embed URL for video ${video.id}:`,
            error,
          );
        }
      }

      return {
        id: video.id,
        module_id: video.module_id,
        title: video.title,
        description: video.description,
        duration_seconds: video.duration_seconds,
        sort_order: video.sort_order,
        status: video.status,
        created_at: video.created_at,
        updated_at: video.updated_at,
        bunny_video_id: video.bunny_video_id,
        thumbnail_url: video.thumbnail_url,

        // Secure signed Bunny player URL
        bunnyEmbedUrl: embedUrl,
      };
    });

    // ==========================================================
    // 14. LOAD ALL PUBLISHED MODULES
    //
    // Needed for previous/next navigation.
    // ==========================================================

    const { data: modules, error: modulesError } = await supabase
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
      .eq("course_id", courseId)
      .eq("status", "published")
      .order("sort_order", {
        ascending: true,
      })
      .order("created_at", {
        ascending: true,
      });

    if (modulesError) {
      console.error("Academy course modules lookup failed:", modulesError);

      return NextResponse.json(
        {
          error: "Unable to load academy course modules.",
        },
        {
          status: 500,
        },
      );
    }

    const moduleRows = modules ?? [];

    // ==========================================================
    // 15. MODULE INDEX
    // ==========================================================

    const currentIndex = moduleRows.findIndex((item) => item.id === module.id);

    const previousModule =
      currentIndex > 0 ? moduleRows[currentIndex - 1] : null;

    const nextModule =
      currentIndex >= 0 ? (moduleRows[currentIndex + 1] ?? null) : null;

    // ==========================================================
    // 16. LOAD CURRENT MODULE PROGRESS
    // ==========================================================

    const { data: progress, error: progressError } = await supabase
      .from("academy_student_module_progress")
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
      .eq("student_id", student.id)
      .eq("enrollment_id", enrollment.id)
      .eq("course_id", courseId)
      .eq("module_id", moduleId)
      .maybeSingle();

    if (progressError) {
      console.error("Academy module progress lookup failed:", progressError);

      return NextResponse.json(
        {
          error: "Unable to load module progress.",
        },
        {
          status: 500,
        },
      );
    }

    // ==========================================================
    // 17. LOAD ALL COURSE PROGRESS
    // ==========================================================

    const { data: courseProgressRows, error: courseProgressError } =
      await supabase
        .from("academy_student_module_progress")
        .select(
          `
        id,
        module_id,
        progress_seconds,
        completed,
        started_at,
        completed_at
      `,
        )
        .eq("student_id", student.id)
        .eq("enrollment_id", enrollment.id)
        .eq("course_id", courseId);

    if (courseProgressError) {
      console.error(
        "Academy course progress lookup failed:",
        courseProgressError,
      );

      return NextResponse.json(
        {
          error: "Unable to load course progress.",
        },
        {
          status: 500,
        },
      );
    }

    const courseProgressList = courseProgressRows ?? [];

    // ==========================================================
    // 18. COURSE PROGRESS SUMMARY
    // ==========================================================

    const completedModules = courseProgressList.filter(
      (item) => item.completed === true,
    ).length;

    const totalModules = moduleRows.length;

    const progressPercentage =
      totalModules > 0
        ? Math.round((completedModules / totalModules) * 100)
        : 0;

    // ==========================================================
    // 19. MODULE WITH VIDEOS
    // ==========================================================

    const moduleWithVideos = {
      ...module,
      videos: moduleVideos,
      videoCount: moduleVideos.length,
    };

    // ==========================================================
    // 20. RESPONSE
    // ==========================================================

    return NextResponse.json({
      success: true,

      student,

      course,

      enrollment: {
        id: enrollment.id,
        enrollmentNumber: enrollment.enrollment_number,
        status: enrollment.status,
        learningMode: enrollment.learning_mode,
        createdAt: enrollment.created_at,
      },

      module: moduleWithVideos,

      progress: progress
        ? {
            id: progress.id,
            progressSeconds: progress.progress_seconds ?? 0,
            completed: progress.completed === true,
            startedAt: progress.started_at ?? null,
            completedAt: progress.completed_at ?? null,
            updatedAt: progress.updated_at ?? null,
          }
        : {
            id: null,
            progressSeconds: 0,
            completed: false,
            startedAt: null,
            completedAt: null,
            updatedAt: null,
          },

      courseProgress: {
        totalModules,
        completedModules,
        remainingModules: Math.max(totalModules - completedModules, 0),
        progressPercentage,
      },

      navigation: {
        previousModule,
        nextModule,
        currentIndex: currentIndex >= 0 ? currentIndex : 0,
      },
    });
  } catch (error) {
    console.error("Academy module dashboard fatal error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to load academy module.",
      },
      {
        status: 500,
      },
    );
  }
}
