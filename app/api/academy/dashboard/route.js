// app/api/academy/dashboard/route.js

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

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
      console.error("Academy dashboard role denied:", {
        userId,
        role: session.user.role,
      });

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
    // 4. LOAD ACADEMY STUDENT
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
          user_id,
          created_at,
          updated_at
        `,
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (studentError) {
      console.error("Academy dashboard student lookup error:", studentError);

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

    // ==========================================================
    // 5. STUDENT STATUS
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
    // 6. LOAD ENROLLMENTS
    //
    // IMPORTANT:
    //
    // academy_enrollments DOES NOT contain course_id.
    //
    // Courses are connected through:
    //
    // academy_enrollments
    //        ↓
    // academy_enrollment_courses
    //        ↓
    // academy_courses
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
      .order("created_at", {
        ascending: false,
      });

    if (enrollmentsError) {
      console.error(
        "Academy dashboard enrollments lookup error:",
        enrollmentsError,
      );

      return NextResponse.json(
        {
          error: "Unable to load academy enrollments.",
        },
        {
          status: 500,
        },
      );
    }

    // ==========================================================
    // 7. ONLY ENROLLED ENROLLMENTS
    // ==========================================================

    const enrolledRows = (enrollments ?? []).filter(
      (enrollment) => enrollment.status === "enrolled",
    );

    // ==========================================================
    // 8. NO ACTIVE ENROLLMENTS
    // ==========================================================

    if (!enrolledRows.length) {
      return NextResponse.json({
        success: true,

        student,

        summary: {
          totalCourses: 0,
          completedCourses: 0,
          activeCourses: 0,
          overallProgress: 0,
        },

        courses: [],

        recentPayments: [],

        recentActivity: [],
      });
    }

    const enrollmentIds = enrolledRows.map((enrollment) => enrollment.id);

    // ==========================================================
    // 9. LOAD ENROLLMENT COURSES
    //
    // This is the ONLY place we obtain course_id.
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
          duration_months,
          created_at,

          course:academy_courses(
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
        .in("enrollment_id", enrollmentIds);

    if (enrollmentCoursesError) {
      console.error(
        "Academy dashboard enrollment courses lookup error:",
        enrollmentCoursesError,
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

    const enrollmentCourseRows = enrollmentCourses ?? [];

    // ==========================================================
    // 10. COURSE IDS
    // ==========================================================

    const courseIds = [
      ...new Set(
        enrollmentCourseRows.map((row) => row.course_id).filter(Boolean),
      ),
    ];

    // ==========================================================
    // 11. REMOVE ENROLLMENTS THAT HAVE NO COURSE
    // ==========================================================

    const validEnrollmentIds = new Set(
      enrollmentCourseRows.map((row) => row.enrollment_id),
    );

    const validEnrolledRows = enrolledRows.filter((enrollment) =>
      validEnrollmentIds.has(enrollment.id),
    );

    if (!validEnrolledRows.length || !courseIds.length) {
      return NextResponse.json({
        success: true,

        student,

        summary: {
          totalCourses: 0,
          completedCourses: 0,
          activeCourses: 0,
          overallProgress: 0,
        },

        courses: [],

        recentPayments: [],

        recentActivity: [],
      });
    }

    // ==========================================================
    // 12. GROUP COURSES BY ENROLLMENT
    // ==========================================================

    const coursesByEnrollment = new Map();

    for (const row of enrollmentCourseRows) {
      if (!coursesByEnrollment.has(row.enrollment_id)) {
        coursesByEnrollment.set(row.enrollment_id, []);
      }

      coursesByEnrollment.get(row.enrollment_id).push({
        enrollmentCourseId: row.id,
        courseId: row.course_id,
        coursePrice: Number(row.course_price ?? 0),
        pricingId: row.pricing_id ?? null,
        durationMonths: row.duration_months ?? null,
        course: row.course ?? null,
        pricing: row.pricing ?? null,
      });
    }

    // ==========================================================
    // 13. LOAD COURSE MODULES
    //
    // IMPORTANT:
    //
    // Do NOT use order_index because that column does not exist.
    //
    // We fetch the modules and sort them safely in JavaScript.
    // ==========================================================

    const { data: modules, error: modulesError } = await supabase
      .from("academy_course_modules")
      .select("*")
      .in("course_id", courseIds);

    if (modulesError) {
      console.error("Academy dashboard modules lookup error:", modulesError);

      return NextResponse.json(
        {
          error: "Unable to load academy course modules.",
        },
        {
          status: 500,
        },
      );
    }

    // ==========================================================
    // 14. SORT MODULES
    //
    // Supports whichever common ordering column exists.
    // No database column is assumed.
    // ==========================================================

    const sortedModules = [...(modules ?? [])].sort((a, b) => {
      const aOrder = Number(
        a.order ??
          a.position ??
          a.module_number ??
          a.sort_order ??
          a.sequence ??
          999999,
      );

      const bOrder = Number(
        b.order ??
          b.position ??
          b.module_number ??
          b.sort_order ??
          b.sequence ??
          999999,
      );

      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;

      const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;

      return aCreated - bCreated;
    });

    // ==========================================================
    // 15. GROUP MODULES BY COURSE
    // ==========================================================

    const modulesByCourse = new Map();

    for (const module of sortedModules) {
      if (!modulesByCourse.has(module.course_id)) {
        modulesByCourse.set(module.course_id, []);
      }

      modulesByCourse.get(module.course_id).push(module);
    }

    // ==========================================================
    // 16. LOAD MODULE PROGRESS
    // ==========================================================

    const { data: progressRows, error: progressError } = await supabase
      .from("academy_student_module_progress")
      .select("*")
      .eq("student_id", student.id)
      .in("enrollment_id", enrollmentIds)
      .in("course_id", courseIds);

    if (progressError) {
      console.error(
        "Academy dashboard module progress lookup error:",
        progressError,
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

    // ==========================================================
    // 17. PROGRESS MAP
    // ==========================================================

    const progressMap = new Map();

    for (const progress of progressRows ?? []) {
      const key = `${progress.enrollment_id}:${progress.module_id}`;

      progressMap.set(key, progress);
    }

    // ==========================================================
    // 18. LOAD STUDENT PAYMENT PLANS
    // ==========================================================

    const { data: paymentPlans, error: paymentPlansError } = await supabase
      .from("academy_student_payment_plans")
      .select("*")
      .in("enrollment_id", enrollmentIds)
      .order("created_at", {
        ascending: false,
      });

    if (paymentPlansError) {
      console.error(
        "Academy dashboard payment plans lookup error:",
        paymentPlansError,
      );

      return NextResponse.json(
        {
          error: "Unable to load student payment plans.",
        },
        {
          status: 500,
        },
      );
    }

    // ==========================================================
    // 19. PAYMENT PLAN MAP
    // ==========================================================

    const paymentPlanMap = new Map();

    for (const plan of paymentPlans ?? []) {
      if (!paymentPlanMap.has(plan.enrollment_id)) {
        paymentPlanMap.set(plan.enrollment_id, plan);
      }
    }

    // ==========================================================
    // 20. LOAD PAYMENTS
    // ==========================================================

    const { data: payments, error: paymentsError } = await supabase
      .from("academy_enrollment_payments")
      .select("*")
      .in("enrollment_id", enrollmentIds)
      .order("payment_date", {
        ascending: false,
      });

    if (paymentsError) {
      console.error("Academy dashboard payments lookup error:", paymentsError);

      return NextResponse.json(
        {
          error: "Unable to load academy payments.",
        },
        {
          status: 500,
        },
      );
    }

    // ==========================================================
    // 21. PAYMENT PLAN IDS
    // ==========================================================

    const paymentPlanIds = [
      ...new Set((paymentPlans ?? []).map((plan) => plan.id).filter(Boolean)),
    ];

    // ==========================================================
    // 22. PAYMENT SCHEDULE
    // ==========================================================

    let paymentSchedule = [];

    if (paymentPlanIds.length) {
      const { data: scheduleData, error: scheduleError } = await supabase
        .from("academy_student_payment_schedule")
        .select("*")
        .in("student_payment_plan_id", paymentPlanIds)
        .in("status", ["pending", "partially_paid", "overdue"])
        .order("due_date", {
          ascending: true,
        });

      if (scheduleError) {
        console.error(
          "Academy dashboard payment schedule lookup error:",
          scheduleError,
        );

        return NextResponse.json(
          {
            error: "Unable to load payment schedules.",
          },
          {
            status: 500,
          },
        );
      }

      paymentSchedule = scheduleData ?? [];
    }

    // ==========================================================
    // 23. SCHEDULE MAP
    // ==========================================================

    const scheduleByPlan = new Map();

    for (const schedule of paymentSchedule) {
      if (!scheduleByPlan.has(schedule.student_payment_plan_id)) {
        scheduleByPlan.set(schedule.student_payment_plan_id, []);
      }

      scheduleByPlan.get(schedule.student_payment_plan_id).push(schedule);
    }

    // ==========================================================
    // 24. PAYMENTS MAP
    // ==========================================================

    const paymentsByEnrollment = new Map();

    for (const payment of payments ?? []) {
      if (!paymentsByEnrollment.has(payment.enrollment_id)) {
        paymentsByEnrollment.set(payment.enrollment_id, []);
      }

      paymentsByEnrollment.get(payment.enrollment_id).push(payment);
    }

    // ==========================================================
    // 25. TIMELINE
    // ==========================================================

    const { data: timelineRows, error: timelineError } = await supabase
      .from("academy_enrollment_timeline")
      .select("*")
      .in("enrollment_id", enrollmentIds)
      .order("created_at", {
        ascending: false,
      })
      .limit(100);

    if (timelineError) {
      console.error("Academy dashboard timeline lookup error:", timelineError);
    }

    // ==========================================================
    // 26. TIMELINE MAP
    // ==========================================================

    const timelineByEnrollment = new Map();

    for (const item of timelineRows ?? []) {
      if (!timelineByEnrollment.has(item.enrollment_id)) {
        timelineByEnrollment.set(item.enrollment_id, []);
      }

      timelineByEnrollment.get(item.enrollment_id).push(item);
    }

    // ==========================================================
    // 27. BUILD DASHBOARD COURSES
    // ==========================================================

    const dashboardCourses = [];

    for (const enrollment of validEnrolledRows) {
      const assignedCourses = coursesByEnrollment.get(enrollment.id) ?? [];

      for (const assignedCourse of assignedCourses) {
        const course = assignedCourse.course;

        if (!course) {
          continue;
        }

        // --------------------------------------------------------
        // MODULES
        // --------------------------------------------------------

        const courseModules =
          modulesByCourse.get(assignedCourse.courseId) ?? [];

        const moduleRows = courseModules.map((module, index) => {
          const progressKey = `${enrollment.id}:${module.id}`;

          const progress = progressMap.get(progressKey) ?? null;

          return {
            ...module,

            moduleIndex: index + 1,

            progress: progress
              ? {
                  id: progress.id ?? null,
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

        // --------------------------------------------------------
        // PROGRESS
        // --------------------------------------------------------

        const totalModules = moduleRows.length;

        const completedModules = moduleRows.filter(
          (module) => module.progress.completed === true,
        ).length;

        const remainingModules = Math.max(totalModules - completedModules, 0);

        const progressPercentage =
          totalModules > 0
            ? Math.round((completedModules / totalModules) * 100)
            : 0;

        const courseCompleted =
          totalModules > 0 && completedModules === totalModules;

        // --------------------------------------------------------
        // CURRENT MODULE
        // --------------------------------------------------------

        const startedIncompleteModule =
          moduleRows.find(
            (module) =>
              module.progress.startedAt && module.progress.completed !== true,
          ) ?? null;

        const firstIncompleteModule =
          moduleRows.find((module) => module.progress.completed !== true) ??
          null;

        const currentModule =
          startedIncompleteModule ?? firstIncompleteModule ?? null;

        // --------------------------------------------------------
        // NEXT MODULE
        // --------------------------------------------------------

        let nextModule = null;

        if (currentModule) {
          const currentIndex = moduleRows.findIndex(
            (module) => module.id === currentModule.id,
          );

          nextModule = moduleRows[currentIndex + 1] ?? null;
        }

        // --------------------------------------------------------
        // PAYMENTS
        // --------------------------------------------------------

        const enrollmentPayments =
          paymentsByEnrollment.get(enrollment.id) ?? [];

        const approvedPayments = enrollmentPayments.filter(
          (payment) => payment.status === "approved",
        );

        const totalPaid = approvedPayments.reduce(
          (sum, payment) => sum + Number(payment.amount ?? 0),
          0,
        );

        // --------------------------------------------------------
        // PAYMENT PLAN
        // --------------------------------------------------------

        const paymentPlan = paymentPlanMap.get(enrollment.id) ?? null;

        // --------------------------------------------------------
        // TUITION
        // --------------------------------------------------------

        const totalTuition = Number(
          paymentPlan?.total_payable ??
            enrollment.total_payable ??
            enrollment.total_course_fee ??
            assignedCourse.coursePrice ??
            0,
        );

        const outstandingBalance = Math.max(totalTuition - totalPaid, 0);

        const paymentProgress =
          totalTuition > 0
            ? Math.min(Math.round((totalPaid / totalTuition) * 100), 100)
            : 0;

        // --------------------------------------------------------
        // UPCOMING PAYMENTS
        // --------------------------------------------------------

        const upcomingPayments = paymentPlan?.id
          ? (scheduleByPlan.get(paymentPlan.id) ?? [])
          : [];

        const statusPriority = {
          overdue: 0,
          pending: 1,
          partially_paid: 2,
        };

        const nextPayment =
          [...upcomingPayments].sort((a, b) => {
            const aPriority = statusPriority[a.status] ?? 99;

            const bPriority = statusPriority[b.status] ?? 99;

            if (aPriority !== bPriority) {
              return aPriority - bPriority;
            }

            const aDate = a.due_date
              ? new Date(a.due_date).getTime()
              : Number.MAX_SAFE_INTEGER;

            const bDate = b.due_date
              ? new Date(b.due_date).getTime()
              : Number.MAX_SAFE_INTEGER;

            return aDate - bDate;
          })[0] ?? null;

        // --------------------------------------------------------
        // TIMELINE
        // --------------------------------------------------------

        const timeline = (timelineByEnrollment.get(enrollment.id) ?? []).slice(
          0,
          10,
        );

        // --------------------------------------------------------
        // RECENT PAYMENTS
        // --------------------------------------------------------

        const recentPayments = enrollmentPayments.slice(0, 5);

        // --------------------------------------------------------
        // DASHBOARD COURSE
        // --------------------------------------------------------

        dashboardCourses.push({
          enrollment: {
            id: enrollment.id,
            userId: enrollment.user_id,
            enrollmentNumber: enrollment.enrollment_number ?? null,
            status: enrollment.status,
            learningMode: enrollment.learning_mode ?? null,
            createdAt: enrollment.created_at,
            updatedAt: enrollment.updated_at,
          },

          enrollmentCourse: {
            id: assignedCourse.enrollmentCourseId,
            courseId: assignedCourse.courseId,
            coursePrice: assignedCourse.coursePrice,
            pricingId: assignedCourse.pricingId,
            durationMonths: assignedCourse.durationMonths,
          },

          course,

          pricing: assignedCourse.pricing,

          progress: {
            totalModules,
            completedModules,
            remainingModules,
            progressPercentage,
            courseCompleted,
          },

          currentModule,

          nextModule,

          modules: moduleRows,

          paymentPlan,

          paymentSummary: {
            totalTuition: Number(totalTuition.toFixed(2)),

            totalPaid: Number(totalPaid.toFixed(2)),

            outstandingBalance: Number(outstandingBalance.toFixed(2)),

            paymentProgress,
          },

          nextPayment,

          upcomingPayments,

          recentPayments,

          timeline,
        });
      }
    }

    // ==========================================================
    // 28. SUMMARY
    // ==========================================================

    const totalCourses = dashboardCourses.length;

    const completedCourses = dashboardCourses.filter(
      (item) => item.progress.courseCompleted,
    ).length;

    const activeCourses = dashboardCourses.filter(
      (item) => !item.progress.courseCompleted,
    ).length;

    const overallProgress =
      totalCourses > 0
        ? Math.round(
            dashboardCourses.reduce(
              (sum, item) => sum + item.progress.progressPercentage,
              0,
            ) / totalCourses,
          )
        : 0;

    // ==========================================================
    // 29. RECENT PAYMENTS
    // ==========================================================

    const recentPayments = [...(payments ?? [])]
      .sort((a, b) => {
        const aDate = a.payment_date ? new Date(a.payment_date).getTime() : 0;

        const bDate = b.payment_date ? new Date(b.payment_date).getTime() : 0;

        return bDate - aDate;
      })
      .slice(0, 10);

    // ==========================================================
    // 30. RECENT ACTIVITY
    // ==========================================================

    const recentActivity = [...(timelineRows ?? [])]
      .sort((a, b) => {
        const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;

        const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;

        return bDate - aDate;
      })
      .slice(0, 10);

    // ==========================================================
    // 31. RESPONSE
    // ==========================================================

    return NextResponse.json({
      success: true,

      student,

      summary: {
        totalCourses,
        activeCourses,
        completedCourses,
        overallProgress,
      },

      courses: dashboardCourses,

      recentPayments,

      recentActivity,
    });
  } catch (error) {
    console.error("Academy multi-course dashboard fatal error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to load academy dashboard.",
      },
      {
        status: 500,
      },
    );
  }
}
