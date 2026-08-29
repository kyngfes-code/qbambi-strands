import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * ============================================================
 * AUTHORIZE STUDENT
 * ============================================================
 */

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

/**
 * ============================================================
 * GET COURSE PROGRESS
 * ============================================================
 *
 * Returns:
 *
 * - course
 * - enrollment
 * - modules
 * - module progress
 * - total modules
 * - completed modules
 * - progress percentage
 * - current module
 * - next module
 *
 * Access is based on:
 *
 * student
 *   ↓
 * enrolled course
 *   ↓
 * course_id
 *
 * NOT student.enrollment_id.
 */

export async function GET(req, { params }) {
  const authResult = await authorizeStudent();

  if (authResult.error) {
    return authResult.error;
  }

  const { userId, supabase } = authResult;

  const { courseId } = await params;

  try {
    // ==========================================================
    // 1. VALIDATE COURSE ID
    // ==========================================================

    if (!courseId) {
      return NextResponse.json(
        {
          error: "Course ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    // ==========================================================
    // 2. VERIFY STUDENT
    // ==========================================================

    const { data: student, error: studentError } = await supabase
      .from("academy_students")
      .select(
        `
        id,
        user_id,
        student_number,
        first_name,
        last_name,
        status,
        is_active
      `,
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (studentError) {
      console.error("Course progress student lookup error:", studentError);

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

    // ==========================================================
    // 3. STUDENT ACCOUNT STATUS
    // ==========================================================

    if (student.status !== "active") {
      return NextResponse.json(
        {
          error: "Academy student account is not active.",
        },
        {
          status: 403,
        },
      );
    }

    if (student.is_active !== true) {
      return NextResponse.json(
        {
          error: "Academy student account is disabled.",
        },
        {
          status: 403,
        },
      );
    }

    // ==========================================================
    // 4. FIND ENROLLED COURSE
    // ==========================================================
    //
    // A student may have multiple courses.
    //
    // Therefore:
    //
    // user_id + course_id + enrolled
    //
    // identifies the access grant.
    // ==========================================================

    const { data: enrollment, error: enrollmentError } = await supabase
      .from("academy_enrollments")
      .select(
        `
        id,
        user_id,
        course_id,
        status,
        created_at,
        updated_at
      `,
      )
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .eq("status", "enrolled")
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (enrollmentError) {
      console.error(
        "Course progress enrollment lookup error:",
        enrollmentError,
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

    if (!enrollment) {
      return NextResponse.json(
        {
          error: "You do not have access to this course.",
        },
        {
          status: 403,
        },
      );
    }

    // ==========================================================
    // 5. COURSE
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
        sort_order
      `,
      )
      .eq("id", courseId)
      .maybeSingle();

    if (courseError) {
      console.error("Course progress course lookup error:", courseError);

      return NextResponse.json(
        {
          error: "Unable to load course.",
        },
        {
          status: 500,
        },
      );
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

    // ==========================================================
    // 6. COURSE MUST BE PUBLISHED
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
    // 7. LOAD COURSE MODULES
    // ==========================================================
    //
    // IMPORTANT:
    // Do not assume a particular module relationship exists.
    // Query directly using course_id.
    // ==========================================================

    const { data: modules, error: modulesError } = await supabase
      .from("academy_course_modules")
      .select("*")
      .eq("course_id", courseId)
      .order("order_index", {
        ascending: true,
      });

    if (modulesError) {
      console.error("Course progress modules lookup error:", modulesError);

      return NextResponse.json(
        {
          error: "Unable to load course modules.",
        },
        {
          status: 500,
        },
      );
    }

    const moduleRows = modules ?? [];

    // ==========================================================
    // 8. LOAD STUDENT PROGRESS
    // ==========================================================
    //
    // Progress belongs to the specific enrollment.
    // ==========================================================

    const { data: progressRows, error: progressError } = await supabase
      .from("academy_student_module_progress")
      .select("*")
      .eq("student_id", student.id)
      .eq("enrollment_id", enrollment.id)
      .eq("course_id", courseId);

    if (progressError) {
      console.error("Course progress progress lookup error:", progressError);

      return NextResponse.json(
        {
          error: "Unable to load course progress.",
        },
        {
          status: 500,
        },
      );
    }

    // ==========================================================
    // 9. MAP PROGRESS BY MODULE
    // ==========================================================

    const progressMap = new Map(
      (progressRows ?? []).map((item) => [item.module_id, item]),
    );

    // ==========================================================
    // 10. BUILD MODULE DATA
    // ==========================================================

    const moduleProgress = moduleRows.map((module, index) => {
      const progress = progressMap.get(module.id) ?? null;

      return {
        ...module,

        moduleIndex: index + 1,

        progress: progress
          ? {
              id: progress.id,
              progressSeconds: progress.progress_seconds,
              completed: progress.completed,
              startedAt: progress.started_at,
              completedAt: progress.completed_at,
            }
          : {
              id: null,
              progressSeconds: 0,
              completed: false,
              startedAt: null,
              completedAt: null,
            },
      };
    });

    // ==========================================================
    // 11. TOTAL MODULES
    // ==========================================================

    const totalModules = moduleProgress.length;

    // ==========================================================
    // 12. COMPLETED MODULES
    // ==========================================================

    const completedModules = moduleProgress.filter(
      (module) => module.progress.completed === true,
    ).length;

    // ==========================================================
    // 13. PROGRESS PERCENTAGE
    // ==========================================================

    const progressPercentage =
      totalModules > 0
        ? Math.round((completedModules / totalModules) * 100)
        : 0;

    // ==========================================================
    // 14. CURRENT MODULE
    // ==========================================================
    //
    // Current module is:
    //
    // first incomplete module that has been started.
    //
    // If none has been started:
    // first module.
    // ==========================================================

    const startedIncompleteModule =
      moduleProgress.find(
        (module) =>
          module.progress.startedAt && module.progress.completed !== true,
      ) ?? null;

    const firstIncompleteModule =
      moduleProgress.find((module) => module.progress.completed !== true) ??
      null;

    const currentModule =
      startedIncompleteModule ?? firstIncompleteModule ?? null;

    // ==========================================================
    // 15. NEXT MODULE
    // ==========================================================

    let nextModule = null;

    if (currentModule) {
      const currentIndex = moduleProgress.findIndex(
        (module) => module.id === currentModule.id,
      );

      nextModule = moduleProgress[currentIndex + 1] ?? null;
    }

    // ==========================================================
    // 16. COURSE COMPLETION
    // ==========================================================

    const courseCompleted =
      totalModules > 0 && completedModules === totalModules;

    // ==========================================================
    // 17. RESPONSE
    // ==========================================================

    return NextResponse.json({
      success: true,

      student: {
        id: student.id,
        studentNumber: student.student_number,
        firstName: student.first_name,
        lastName: student.last_name,
      },

      enrollment: {
        id: enrollment.id,
        courseId: enrollment.course_id,
        status: enrollment.status,
        createdAt: enrollment.created_at,
      },

      course,

      summary: {
        totalModules,
        completedModules,
        remainingModules: Math.max(totalModules - completedModules, 0),

        progressPercentage,

        courseCompleted,
      },

      currentModule,

      nextModule,

      modules: moduleProgress,
    });
  } catch (error) {
    console.error("Academy course progress API fatal error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to load course progress.",
      },
      {
        status: 500,
      },
    );
  }
}
