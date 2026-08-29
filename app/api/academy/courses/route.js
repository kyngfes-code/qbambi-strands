/**
 * app/api/academy/courses/route.js
 */

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * ============================================================
 * GET /api/academy/courses
 * ============================================================
 *
 * Returns courses the authenticated student is enrolled in.
 *
 * Access:
 *
 * user
 *   ↓
 * academy_students
 *   ↓
 * academy_enrollments
 *   ↓
 * enrollment.status = enrolled
 *   ↓
 * academy_courses
 *   ↓
 * academy_course_modules
 *
 * A student can have multiple independent enrollments/courses.
 *
 * Only published courses and published modules are returned.
 * ============================================================
 */

export async function GET() {
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

    const userId = session.user.id;

    // ==========================================================
    // 2. ROLE SECURITY
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

    // ==========================================================
    // 3. SUPABASE
    // ==========================================================

    const supabase = createSupabaseAdmin();

    // ==========================================================
    // 4. STUDENT
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
        other_name,
        status,
        is_active
      `,
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (studentError) {
      console.error("Academy courses student lookup error:", studentError);

      return NextResponse.json(
        {
          error: "Unable to load academy student.",
        },
        {
          status: 500,
        },
      );
    }

    // ==========================================================
    // 5. STUDENT MUST EXIST
    // ==========================================================

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
    // 6. STUDENT STATUS
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
    // 7. ENROLLED ENROLLMENTS
    // ==========================================================

    const { data: enrollments, error: enrollmentError } = await supabase
      .from("academy_enrollments")
      .select(
        `
          id,
          user_id,
          course_id,
          status,
          enrollment_number,
          created_at,
          updated_at
        `,
      )
      .eq("user_id", userId)
      .eq("status", "enrolled")
      .order("created_at", {
        ascending: false,
      });

    if (enrollmentError) {
      console.error(
        "Academy courses enrollment lookup error:",
        enrollmentError,
      );

      return NextResponse.json(
        {
          error: "Unable to load enrolled courses.",
        },
        {
          status: 500,
        },
      );
    }

    // ==========================================================
    // 8. NO ENROLLED COURSES
    // ==========================================================

    if (!enrollments?.length) {
      return NextResponse.json({
        success: true,

        student: {
          id: student.id,
          studentNumber: student.student_number,
          firstName: student.first_name,
          lastName: student.last_name,
          otherName: student.other_name,
        },

        courses: [],
      });
    }

    // ==========================================================
    // 9. COURSE IDS
    // ==========================================================

    const courseIds = [
      ...new Set(
        enrollments.map((enrollment) => enrollment.course_id).filter(Boolean),
      ),
    ];

    if (!courseIds.length) {
      return NextResponse.json({
        success: true,

        student: {
          id: student.id,
          studentNumber: student.student_number,
          firstName: student.first_name,
          lastName: student.last_name,
          otherName: student.other_name,
        },

        courses: [],
      });
    }

    // ==========================================================
    // 10. COURSES
    // ==========================================================

    const { data: courses, error: coursesError } = await supabase
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
      .in("id", courseIds)
      .eq("status", "published")
      .order("sort_order", {
        ascending: true,
      });

    if (coursesError) {
      console.error("Academy courses lookup error:", coursesError);

      return NextResponse.json(
        {
          error: "Unable to load academy courses.",
        },
        {
          status: 500,
        },
      );
    }

    // ==========================================================
    // 11. MODULES
    //
    // Actual academy_course_modules schema:
    //
    // id
    // course_id
    // module_code
    // title
    // description
    // sort_order
    // status
    // created_at
    // updated_at
    //
    // Therefore:
    //
    // status = published
    //
    // is what controls student visibility.
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
      .in("course_id", courseIds)
      .eq("status", "published")
      .order("sort_order", {
        ascending: true,
      });

    if (modulesError) {
      console.error("Academy course modules lookup error:", modulesError);

      return NextResponse.json(
        {
          error: "Unable to load course modules.",
        },
        {
          status: 500,
        },
      );
    }

    // ==========================================================
    // 12. COURSE MAP
    // ==========================================================

    const courseMap = new Map(
      (courses ?? []).map((course) => [course.id, course]),
    );

    // ==========================================================
    // 13. MODULE MAP
    // ==========================================================

    const modulesByCourse = new Map();

    for (const module of modules ?? []) {
      if (!modulesByCourse.has(module.course_id)) {
        modulesByCourse.set(module.course_id, []);
      }

      modulesByCourse.get(module.course_id).push(module);
    }

    // ==========================================================
    // 14. BUILD STUDENT COURSES
    // ==========================================================

    const enrolledCourses = enrollments
      .map((enrollment) => {
        const course = courseMap.get(enrollment.course_id);

        // ------------------------------------------------------
        // Course may have been archived/unpublished after the
        // student enrolled.
        // ------------------------------------------------------

        if (!course) {
          return null;
        }

        const courseModules = modulesByCourse.get(course.id) ?? [];

        return {
          enrollment: {
            id: enrollment.id,
            enrollmentNumber: enrollment.enrollment_number,
            status: enrollment.status,
            createdAt: enrollment.created_at,
            updatedAt: enrollment.updated_at,
          },

          course: {
            ...course,

            modules: courseModules,

            moduleCount: courseModules.length,
          },
        };
      })
      .filter(Boolean);

    // ==========================================================
    // 15. RESPONSE
    // ==========================================================

    return NextResponse.json({
      success: true,

      student: {
        id: student.id,
        studentNumber: student.student_number,
        firstName: student.first_name,
        lastName: student.last_name,
        otherName: student.other_name,
      },

      courses: enrolledCourses,
    });
  } catch (error) {
    console.error("Academy courses API fatal error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to load academy courses.",
      },
      {
        status: 500,
      },
    );
  }
}
