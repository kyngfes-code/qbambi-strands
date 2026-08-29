import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * ============================================================
 * GET COURSE MODULES
 * ============================================================
 *
 * Access rule:
 *
 * Student
 *   ↓
 * academy_enrollments
 *   ↓
 * user_id = current user
 * course_id = requested course
 * status = enrolled
 *   ↓
 * Course modules
 *
 * A student can therefore have multiple courses at the same
 * time. Access is checked separately for each course.
 */

export async function GET(req, { params }) {
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

    const userId = session.user.id;

    const { courseId } = await params;

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

    const supabase = createSupabaseAdmin();

    // ==========================================================
    // 3. VERIFY ACADEMY STUDENT
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
      console.error("Student modules student lookup error:", studentError);

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
    // 4. STUDENT ACCOUNT STATUS
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
    // 5. VERIFY COURSE ENROLLMENT
    //
    // IMPORTANT:
    //
    // Do NOT use student.enrollment_id here.
    //
    // A student can have multiple courses.
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
        "Student modules enrollment lookup error:",
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
    // 6. LOAD COURSE
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
      console.error("Student modules course lookup error:", courseError);

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
    // 7. COURSE MUST BE PUBLISHED
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
    // 8. LOAD MODULES
    // ==========================================================
    //
    // We intentionally query academy_course_modules directly.
    //
    // This avoids depending on Supabase's nested relationship
    // syntax for the student-access path.
    //
    // The module query should only contain columns that belong
    // to academy_course_modules.
    // ==========================================================

    const { data: modules, error: modulesError } = await supabase
      .from("academy_course_modules")
      .select("*")
      .eq("course_id", courseId)
      .order("order_index", {
        ascending: true,
      })
      .order("created_at", {
        ascending: true,
      });

    if (modulesError) {
      console.error("Student modules lookup error:", modulesError);

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
    // 9. RESPONSE
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

      modules: modules ?? [],
    });
  } catch (error) {
    console.error("Student course modules API fatal error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to load course modules.",
      },
      {
        status: 500,
      },
    );
  }
}
