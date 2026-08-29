import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (session.user.role !== "student") {
      return NextResponse.json(
        { error: "Academy student access required." },
        { status: 403 },
      );
    }

    const userId = session.user.id;

    const { courseId, moduleId } = await params;

    if (!courseId || !moduleId) {
      return NextResponse.json(
        {
          error: "Course ID and module ID are required.",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const requestedSeconds = Number(body?.progressSeconds ?? 0);

    const completed = body?.completed === true;

    if (!Number.isFinite(requestedSeconds) || requestedSeconds < 0) {
      return NextResponse.json(
        {
          error: "Invalid progress position.",
        },
        { status: 400 },
      );
    }

    const progressSeconds = Math.floor(requestedSeconds);

    const supabase = createSupabaseAdmin();

    // ==========================================================
    // STUDENT
    // ==========================================================

    const { data: student, error: studentError } = await supabase
      .from("academy_students")
      .select(
        `
        id,
        user_id,
        status,
        is_active
      `,
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (studentError) {
      console.error("Academy progress student lookup failed:", studentError);

      return NextResponse.json(
        {
          error: "Unable to verify student.",
        },
        { status: 500 },
      );
    }

    if (!student) {
      return NextResponse.json(
        {
          error: "Academy student record not found.",
        },
        { status: 404 },
      );
    }

    if (student.status !== "active" || student.is_active !== true) {
      return NextResponse.json(
        {
          error: "Academy student account is not active.",
        },
        { status: 403 },
      );
    }

    // ==========================================================
    // MODULE
    // ==========================================================

    const { data: module, error: moduleError } = await supabase
      .from("academy_course_modules")
      .select(
        `
        id,
        course_id,
        status
      `,
      )
      .eq("id", moduleId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (moduleError) {
      console.error("Academy progress module lookup failed:", moduleError);

      return NextResponse.json(
        {
          error: "Unable to verify module.",
        },
        { status: 500 },
      );
    }

    if (!module) {
      return NextResponse.json(
        {
          error: "Module not found.",
        },
        { status: 404 },
      );
    }

    if (module.status !== "published") {
      return NextResponse.json(
        {
          error: "This module is not available.",
        },
        { status: 403 },
      );
    }

    // ==========================================================
    // FIND STUDENT ENROLLMENT FOR THIS COURSE
    // ==========================================================

    const { data: enrollmentCourses, error: enrollmentCourseError } =
      await supabase
        .from("academy_enrollment_courses")
        .select(
          `
          enrollment_id,
          course_id
        `,
        )
        .eq("course_id", courseId);

    if (enrollmentCourseError) {
      console.error(
        "Academy progress enrollment-course lookup failed:",
        enrollmentCourseError,
      );

      return NextResponse.json(
        {
          error: "Unable to verify course enrollment.",
        },
        { status: 500 },
      );
    }

    const enrollmentIds = (enrollmentCourses ?? []).map(
      (item) => item.enrollment_id,
    );

    if (!enrollmentIds.length) {
      return NextResponse.json(
        {
          error: "You are not enrolled in this course.",
        },
        { status: 403 },
      );
    }

    // ==========================================================
    // OWNED ACTIVE ENROLLMENT
    // ==========================================================

    const { data: enrollment, error: enrollmentError } = await supabase
      .from("academy_enrollments")
      .select(
        `
          id,
          user_id,
          status
        `,
      )
      .eq("user_id", userId)
      .eq("status", "enrolled")
      .in("id", enrollmentIds)
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (enrollmentError) {
      console.error(
        "Academy progress enrollment lookup failed:",
        enrollmentError,
      );

      return NextResponse.json(
        {
          error: "Unable to verify enrollment.",
        },
        { status: 500 },
      );
    }

    if (!enrollment) {
      return NextResponse.json(
        {
          error: "You are not enrolled in this course.",
        },
        { status: 403 },
      );
    }

    // ==========================================================
    // EXISTING PROGRESS
    // ==========================================================

    const { data: existingProgress, error: existingProgressError } =
      await supabase
        .from("academy_student_module_progress")
        .select(
          `
          id,
          progress_seconds,
          completed,
          started_at,
          completed_at
        `,
        )
        .eq("student_id", student.id)
        .eq("enrollment_id", enrollment.id)
        .eq("course_id", courseId)
        .eq("module_id", moduleId)
        .maybeSingle();

    if (existingProgressError) {
      console.error(
        "Academy existing progress lookup failed:",
        existingProgressError,
      );

      return NextResponse.json(
        {
          error: "Unable to load module progress.",
        },
        { status: 500 },
      );
    }

    const now = new Date().toISOString();

    // ==========================================================
    // COMPLETED
    // ==========================================================

    if (completed) {
      const { data: savedProgress, error: saveError } = await supabase
        .from("academy_student_module_progress")
        .upsert(
          {
            student_id: student.id,
            enrollment_id: enrollment.id,
            course_id: courseId,
            module_id: moduleId,
            progress_seconds: Math.max(
              progressSeconds,
              existingProgress?.progress_seconds ?? 0,
            ),
            completed: true,
            started_at: existingProgress?.started_at ?? now,
            completed_at: existingProgress?.completed_at ?? now,
            updated_at: now,
          },
          {
            onConflict: "enrollment_id,module_id",
          },
        )
        .select(
          `
            id,
            enrollment_id,
            course_id,
            module_id,
            progress_seconds,
            completed,
            started_at,
            completed_at,
            updated_at
          `,
        )
        .single();

      if (saveError) {
        console.error("Academy module completion save failed:", saveError);

        return NextResponse.json(
          {
            error: "Unable to save module completion.",
          },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        completed: true,
        progress: savedProgress,
      });
    }

    // ==========================================================
    // NORMAL PROGRESS UPDATE
    // ==========================================================

    const safeSeconds = Math.max(
      progressSeconds,
      existingProgress?.progress_seconds ?? 0,
    );

    const { data: savedProgress, error: saveError } = await supabase
      .from("academy_student_module_progress")
      .upsert(
        {
          student_id: student.id,
          enrollment_id: enrollment.id,
          course_id: courseId,
          module_id: moduleId,
          progress_seconds: safeSeconds,
          completed: existingProgress?.completed === true,
          started_at: existingProgress?.started_at ?? now,
          completed_at: existingProgress?.completed_at ?? null,
          updated_at: now,
        },
        {
          onConflict: "enrollment_id,module_id",
        },
      )
      .select(
        `
          id,
          enrollment_id,
          course_id,
          module_id,
          progress_seconds,
          completed,
          started_at,
          completed_at,
          updated_at
        `,
      )
      .single();

    if (saveError) {
      console.error("Academy module progress save failed:", saveError);

      return NextResponse.json(
        {
          error: "Unable to save module progress.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      completed: savedProgress.completed,
      progress: savedProgress,
    });
  } catch (error) {
    console.error("Academy module progress fatal error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to save module progress.",
      },
      { status: 500 },
    );
  }
}
