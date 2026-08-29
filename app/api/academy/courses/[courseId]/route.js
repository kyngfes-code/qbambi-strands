import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request, { params }) {
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

    const { courseId } = await params;

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required." },
        { status: 400 },
      );
    }

    const userId = session.user.id;

    const supabase = createSupabaseAdmin();

    // ----------------------------------------------------------
    // STUDENT
    // ----------------------------------------------------------

    const { data: student, error: studentError } = await supabase
      .from("academy_students")
      .select(
        `
        id,
        student_number,
        first_name,
        last_name,
        other_name,
        email,
        phone,
        whatsapp,
        status,
        is_active,
        user_id
      `,
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (studentError) {
      console.error("Academy course student lookup failed:", studentError);

      return NextResponse.json(
        { error: "Unable to load academy student." },
        { status: 500 },
      );
    }

    if (!student) {
      return NextResponse.json(
        { error: "Academy student record not found." },
        { status: 404 },
      );
    }

    if (student.status !== "active" || student.is_active !== true) {
      return NextResponse.json(
        { error: "Academy student account is not active." },
        { status: 403 },
      );
    }

    // ----------------------------------------------------------
    // ENROLLMENT + COURSE
    //
    // IMPORTANT:
    // academy_enrollments DOES NOT HAVE course_id.
    // ----------------------------------------------------------

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
          duration_months,
          created_at,

          enrollment:academy_enrollments!academy_enrollment_courses_enrollment_id_fkey(
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
          ),

          course:academy_courses!academy_enrollment_courses_course_id_fkey(
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
          ),

          pricing:academy_course_pricing(
            id,
            learning_mode,
            duration_months,
            price,
            currency
          )
        `,
        )
        .eq("course_id", courseId);

    if (enrollmentCoursesError) {
      console.error(
        "Academy course enrollment lookup failed:",
        enrollmentCoursesError,
      );

      return NextResponse.json(
        { error: "Unable to load course enrollment." },
        { status: 500 },
      );
    }

    // ----------------------------------------------------------
    // SECURITY:
    // Only accept enrollment belonging to current user.
    // ----------------------------------------------------------

    const enrollmentCourse = (enrollmentCourses ?? []).find(
      (row) =>
        row.enrollment?.user_id === userId &&
        row.enrollment?.status === "enrolled",
    );

    if (!enrollmentCourse) {
      return NextResponse.json(
        {
          error: "You do not have access to this course.",
        },
        { status: 404 },
      );
    }

    const enrollment = enrollmentCourse.enrollment;
    const course = enrollmentCourse.course;

    if (!course) {
      return NextResponse.json(
        { error: "Course record not found." },
        { status: 404 },
      );
    }

    // ----------------------------------------------------------
    // MODULES
    // ----------------------------------------------------------

    const { data: modules, error: modulesError } = await supabase
      .from("academy_course_modules")
      .select("*")
      .eq("course_id", courseId)
      .order("id", {
        ascending: true,
      });

    if (modulesError) {
      console.error("Academy course modules lookup failed:", modulesError);

      return NextResponse.json(
        { error: "Unable to load course modules." },
        { status: 500 },
      );
    }

    const moduleIds = (modules ?? []).map((module) => module.id);

    // ----------------------------------------------------------
    // PROGRESS
    // ----------------------------------------------------------

    let progressRows = [];

    if (moduleIds.length) {
      const { data, error: progressError } = await supabase
        .from("academy_student_module_progress")
        .select("*")
        .eq("student_id", student.id)
        .eq("enrollment_id", enrollment.id)
        .eq("course_id", courseId)
        .in("module_id", moduleIds);

      if (progressError) {
        console.error("Academy course progress lookup failed:", progressError);

        return NextResponse.json(
          { error: "Unable to load course progress." },
          { status: 500 },
        );
      }

      progressRows = data ?? [];
    }

    const progressMap = new Map(
      progressRows.map((progress) => [progress.module_id, progress]),
    );

    const modulesWithProgress = (modules ?? []).map((module, index) => {
      const progress = progressMap.get(module.id) ?? null;

      return {
        ...module,

        moduleIndex: index + 1,

        progress: progress
          ? {
              id: progress.id,
              progressSeconds: progress.progress_seconds ?? 0,
              completed: progress.completed === true,
              startedAt: progress.started_at ?? null,
              completedAt: progress.completed_at ?? null,
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

    const totalModules = modulesWithProgress.length;

    const completedModules = modulesWithProgress.filter(
      (module) => module.progress.completed,
    ).length;

    const progressPercentage =
      totalModules > 0
        ? Math.round((completedModules / totalModules) * 100)
        : 0;

    const currentModule =
      modulesWithProgress.find((module) => !module.progress.completed) ?? null;

    // ----------------------------------------------------------
    // PAYMENT PLAN
    // ----------------------------------------------------------

    const { data: paymentPlans, error: paymentPlansError } = await supabase
      .from("academy_student_payment_plans")
      .select("*")
      .eq("enrollment_id", enrollment.id)
      .order("created_at", {
        ascending: false,
      });

    if (paymentPlansError) {
      console.error(
        "Academy course payment plan lookup failed:",
        paymentPlansError,
      );

      return NextResponse.json(
        { error: "Unable to load payment plan." },
        { status: 500 },
      );
    }

    const paymentPlan = paymentPlans?.[0] ?? null;

    // ----------------------------------------------------------
    // PAYMENTS
    // ----------------------------------------------------------

    const { data: payments, error: paymentsError } = await supabase
      .from("academy_enrollment_payments")
      .select("*")
      .eq("enrollment_id", enrollment.id)
      .order("payment_date", {
        ascending: false,
      });

    if (paymentsError) {
      console.error("Academy course payments lookup failed:", paymentsError);

      return NextResponse.json(
        { error: "Unable to load course payments." },
        { status: 500 },
      );
    }

    const approvedPayments = (payments ?? []).filter(
      (payment) => payment.status === "approved",
    );

    const totalPaid = approvedPayments.reduce(
      (sum, payment) => sum + Number(payment.amount ?? 0),
      0,
    );

    const totalTuition = Number(
      paymentPlan?.total_payable ??
        enrollment.total_payable ??
        enrollment.total_course_fee ??
        0,
    );

    const outstandingBalance = Math.max(totalTuition - totalPaid, 0);

    // ----------------------------------------------------------
    // RESPONSE
    // ----------------------------------------------------------

    return NextResponse.json({
      success: true,

      student,

      enrollment: {
        ...enrollmentCourse,
        enrollment,
      },

      course,

      modules: modulesWithProgress,

      currentModule,

      progress: {
        totalModules,
        completedModules,
        remainingModules: Math.max(totalModules - completedModules, 0),
        progressPercentage,
        courseCompleted: totalModules > 0 && completedModules === totalModules,
      },

      paymentPlan,

      paymentSummary: {
        totalTuition: Number(totalTuition.toFixed(2)),
        totalPaid: Number(totalPaid.toFixed(2)),
        outstandingBalance: Number(outstandingBalance.toFixed(2)),
        paymentProgress:
          totalTuition > 0
            ? Math.min(Math.round((totalPaid / totalTuition) * 100), 100)
            : 0,
      },

      payments: payments ?? [],
    });
  } catch (error) {
    console.error("Academy course dashboard fatal error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to load academy course.",
      },
      { status: 500 },
    );
  }
}
