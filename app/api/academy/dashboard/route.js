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
    // 3. SUPABASE ADMIN CLIENT
    // ==========================================================

    const supabase = createSupabaseAdmin();

    // ==========================================================
    // 4. LOAD ACADEMY STUDENT
    //
    // academy_students = student profile
    //
    // academy_enrollments = many enrollment records
    //
    // IMPORTANT:
    // Do not use academy_students.enrollment_id as the
    // student's only enrollment.
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
    // 5. STUDENT ACCOUNT SECURITY
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
    // 6. LOAD ALL ENROLLMENTS
    //
    // A student can have MANY enrollments.
    //
    // We intentionally load every enrollment belonging to the
    // authenticated user.
    //
    // The page will later filter to "enrolled" for learning
    // access.
    // ==========================================================

    const { data: enrollmentRows, error: enrollmentsError } = await supabase
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

    const enrollments = enrollmentRows ?? [];

    // ==========================================================
    // 7. NO ENROLLMENTS
    // ==========================================================

    if (!enrollments.length) {
      return NextResponse.json({
        success: true,

        student,

        enrollments: [],

        courses: [],

        summary: {
          totalEnrollments: 0,
          pendingEnrollments: 0,
          confirmedEnrollments: 0,
          paymentVerifiedEnrollments: 0,
          activeEnrollments: 0,
          completedEnrollments: 0,

          totalCourses: 0,
          activeCourses: 0,
          completedCourses: 0,

          overallProgress: 0,

          totalTuition: 0,
          totalPaid: 0,
          totalOutstandingBalance: 0,
        },

        recentPayments: [],

        recentActivity: [],
      });
    }

    // ==========================================================
    // 8. ENROLLMENT IDS
    // ==========================================================

    const enrollmentIds = enrollments
      .map((enrollment) => enrollment.id)
      .filter(Boolean);

    // ==========================================================
    // 9. LOAD ENROLLMENT COURSES
    //
    // Relationship:
    //
    // academy_enrollments
    //        ↓
    // academy_enrollment_courses
    //        ↓
    // academy_courses
    //
    // academy_enrollments DOES NOT contain course_id.
    // ==========================================================

    let enrollmentCourseRows = [];

    if (enrollmentIds.length) {
      const { data, error: enrollmentCoursesError } = await supabase
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
            error: "Unable to load academy enrollment courses.",
          },
          {
            status: 500,
          },
        );
      }

      enrollmentCourseRows = data ?? [];
    }

    // ==========================================================
    // 10. COURSE IDS
    // ==========================================================

    const courseIds = [
      ...new Set(
        enrollmentCourseRows.map((row) => row.course_id).filter(Boolean),
      ),
    ];

    // ==========================================================
    // 11. GROUP ENROLLMENT COURSES
    // ==========================================================

    const coursesByEnrollment = new Map();

    for (const row of enrollmentCourseRows) {
      if (!row.enrollment_id) {
        continue;
      }

      if (!coursesByEnrollment.has(row.enrollment_id)) {
        coursesByEnrollment.set(row.enrollment_id, []);
      }

      coursesByEnrollment.get(row.enrollment_id).push({
        enrollmentCourseId: row.id,

        enrollmentId: row.enrollment_id,

        courseId: row.course_id,

        coursePrice: Number(row.course_price ?? 0),

        pricingId: row.pricing_id ?? null,

        durationMonths:
          row.duration_months !== null && row.duration_months !== undefined
            ? Number(row.duration_months)
            : null,

        createdAt: row.created_at ?? null,

        course: row.course ?? null,

        pricing: row.pricing ?? null,
      });
    }

    // ==========================================================
    // 12. LOAD COURSE MODULES
    //
    // academy_course_modules uses sort_order.
    // ==========================================================

    let moduleRows = [];

    if (courseIds.length) {
      const { data, error: modulesError } = await supabase
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

      moduleRows = data ?? [];
    }

    // ==========================================================
    // 13. SORT MODULES
    //
    // sort_order is the canonical ordering field.
    // ==========================================================

    const sortedModules = [...moduleRows].sort((a, b) => {
      const aOrder = Number(a.sort_order ?? 999999);
      const bOrder = Number(b.sort_order ?? 999999);

      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;

      const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;

      return aCreated - bCreated;
    });

    // ==========================================================
    // 14. GROUP MODULES BY COURSE
    // ==========================================================

    const modulesByCourse = new Map();

    for (const module of sortedModules) {
      if (!module.course_id) {
        continue;
      }

      if (!modulesByCourse.has(module.course_id)) {
        modulesByCourse.set(module.course_id, []);
      }

      modulesByCourse.get(module.course_id).push(module);
    }

    // ==========================================================
    // 15. LOAD STUDENT MODULE PROGRESS
    //
    // Progress is scoped by:
    //
    // student_id
    // enrollment_id
    // course_id
    // module_id
    //
    // This prevents progress from one enrollment being reused
    // for another enrollment.
    // ==========================================================

    let progressRows = [];

    if (enrollmentIds.length && courseIds.length) {
      const { data, error: progressError } = await supabase
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

      progressRows = data ?? [];
    }

    // ==========================================================
    // 16. BUILD PROGRESS MAP
    //
    // enrollment_id + module_id
    // ==========================================================

    const progressMap = new Map();

    for (const progress of progressRows) {
      if (!progress.enrollment_id || !progress.module_id) {
        continue;
      }

      const key = `${progress.enrollment_id}:${progress.module_id}`;

      progressMap.set(key, progress);
    }

    // ==========================================================
    // 17. LOAD PAYMENT PLANS
    //
    // Payment plans belong to individual enrollments.
    // ==========================================================

    let paymentPlanRows = [];

    if (enrollmentIds.length) {
      const { data, error: paymentPlansError } = await supabase
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

      paymentPlanRows = data ?? [];
    }

    // ==========================================================
    // 18. PAYMENT PLAN MAP
    //
    // First prefer the enrollment.payment_plan_id.
    //
    // Fallback to the latest plan for that enrollment.
    // ==========================================================

    const paymentPlansByEnrollment = new Map();

    for (const plan of paymentPlanRows) {
      if (!plan.enrollment_id) {
        continue;
      }

      if (!paymentPlansByEnrollment.has(plan.enrollment_id)) {
        paymentPlansByEnrollment.set(plan.enrollment_id, []);
      }

      paymentPlansByEnrollment.get(plan.enrollment_id).push(plan);
    }

    // ==========================================================
    // 19. LOAD ENROLLMENT PAYMENTS
    //
    // These records are used for PAYMENT HISTORY.
    //
    // They are NOT used as the authoritative enrollment balance.
    // ==========================================================

    let paymentRows = [];

    if (enrollmentIds.length) {
      const { data, error: paymentsError } = await supabase
        .from("academy_enrollment_payments")
        .select("*")
        .in("enrollment_id", enrollmentIds)
        .order("payment_date", {
          ascending: false,
        });

      if (paymentsError) {
        console.error(
          "Academy dashboard payments lookup error:",
          paymentsError,
        );

        return NextResponse.json(
          {
            error: "Unable to load academy payments.",
          },
          {
            status: 500,
          },
        );
      }

      paymentRows = data ?? [];
    }

    // ==========================================================
    // 20. GROUP PAYMENTS BY ENROLLMENT
    // ==========================================================

    const paymentsByEnrollment = new Map();

    for (const payment of paymentRows) {
      if (!payment.enrollment_id) {
        continue;
      }

      if (!paymentsByEnrollment.has(payment.enrollment_id)) {
        paymentsByEnrollment.set(payment.enrollment_id, []);
      }

      paymentsByEnrollment.get(payment.enrollment_id).push(payment);
    }

    // ==========================================================
    // 21. SELECT PAYMENT PLAN IDS
    // ==========================================================

    const selectedPaymentPlanIds = [];

    for (const enrollment of enrollments) {
      const plans = paymentPlansByEnrollment.get(enrollment.id) ?? [];

      if (!plans.length) {
        continue;
      }

      const selectedPlan =
        plans.find((plan) => plan.id === enrollment.payment_plan_id) ??
        plans[0];

      if (selectedPlan?.id) {
        selectedPaymentPlanIds.push(selectedPlan.id);
      }
    }

    const uniquePaymentPlanIds = [...new Set(selectedPaymentPlanIds)];

    // ==========================================================
    // 22. LOAD PAYMENT SCHEDULE
    //
    // Only unpaid / outstanding schedule entries are required
    // for the dashboard.
    // ==========================================================

    let paymentScheduleRows = [];

    if (uniquePaymentPlanIds.length) {
      const { data, error: scheduleError } = await supabase
        .from("academy_student_payment_schedule")
        .select("*")
        .in("student_payment_plan_id", uniquePaymentPlanIds)
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

      paymentScheduleRows = data ?? [];
    }

    // ==========================================================
    // 23. GROUP PAYMENT SCHEDULE
    // ==========================================================

    const scheduleByPlan = new Map();

    for (const schedule of paymentScheduleRows) {
      if (!schedule.student_payment_plan_id) {
        continue;
      }

      if (!scheduleByPlan.has(schedule.student_payment_plan_id)) {
        scheduleByPlan.set(schedule.student_payment_plan_id, []);
      }

      scheduleByPlan.get(schedule.student_payment_plan_id).push(schedule);
    }

    // ==========================================================
    // 24. LOAD ENROLLMENT TIMELINE
    //
    // Timeline belongs to individual enrollments.
    // ==========================================================

    let timelineRows = [];

    if (enrollmentIds.length) {
      const { data, error: timelineError } = await supabase
        .from("academy_enrollment_timeline")
        .select("*")
        .in("enrollment_id", enrollmentIds)
        .order("created_at", {
          ascending: false,
        });

      if (timelineError) {
        // Timeline should not destroy the whole dashboard.
        console.error(
          "Academy dashboard timeline lookup error:",
          timelineError,
        );
      } else {
        timelineRows = data ?? [];
      }
    }

    // ==========================================================
    // 25. GROUP TIMELINE BY ENROLLMENT
    // ==========================================================

    const timelineByEnrollment = new Map();

    for (const timeline of timelineRows) {
      if (!timeline.enrollment_id) {
        continue;
      }

      if (!timelineByEnrollment.has(timeline.enrollment_id)) {
        timelineByEnrollment.set(timeline.enrollment_id, []);
      }

      timelineByEnrollment.get(timeline.enrollment_id).push(timeline);
    }

    // ==========================================================
    // 26. BUILD ENROLLMENT-CENTRIC DASHBOARD
    // ==========================================================

    const dashboardEnrollments = [];

    for (const enrollment of enrollments) {
      // ========================================================
      // COURSES BELONGING TO THIS ENROLLMENT
      // ========================================================

      const assignedCourses = coursesByEnrollment.get(enrollment.id) ?? [];

      const enrollmentCoursesDashboard = [];

      // ========================================================
      // PAYMENT HISTORY
      // ========================================================

      const enrollmentPayments = paymentsByEnrollment.get(enrollment.id) ?? [];

      const recentEnrollmentPayments = enrollmentPayments.slice(0, 5);

      // ========================================================
      // PAYMENT PLAN
      // ========================================================

      const enrollmentPlans = paymentPlansByEnrollment.get(enrollment.id) ?? [];

      const paymentPlan =
        enrollmentPlans.find(
          (plan) => plan.id === enrollment.payment_plan_id,
        ) ??
        enrollmentPlans[0] ??
        null;

      // ========================================================
      // FINANCIAL SOURCE OF TRUTH
      //
      // IMPORTANT:
      //
      // academy_enrollments.amount_paid
      // academy_enrollments.balance_due
      // academy_enrollments.total_payable
      //
      // remain authoritative.
      //
      // academy_enrollment_payments is payment history.
      // ========================================================

      const totalTuition = Number(
        enrollment.total_payable ??
          enrollment.total_course_fee ??
          paymentPlan?.total_payable ??
          0,
      );

      const totalPaid = Number(enrollment.amount_paid ?? 0);

      const enrollmentBalanceDue = Number(enrollment.balance_due ?? 0);

      const outstandingBalance = Math.max(enrollmentBalanceDue, 0);

      const paymentProgress =
        totalTuition > 0
          ? Math.min(Math.round((totalPaid / totalTuition) * 100), 100)
          : 0;

      // ========================================================
      // PAYMENT SCHEDULE
      // ========================================================

      const upcomingPayments = paymentPlan?.id
        ? (scheduleByPlan.get(paymentPlan.id) ?? [])
        : [];

      // ========================================================
      // NEXT PAYMENT
      //
      // Priority:
      // overdue
      // partially_paid
      // pending
      // ========================================================

      const statusPriority = {
        overdue: 0,
        partially_paid: 1,
        pending: 2,
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

      // ========================================================
      // TIMELINE
      // ========================================================

      const timeline = (timelineByEnrollment.get(enrollment.id) ?? []).slice(
        0,
        10,
      );

      // ========================================================
      // BUILD COURSES
      // ========================================================

      for (const assignedCourse of assignedCourses) {
        const course = assignedCourse.course;

        if (!course) {
          continue;
        }

        // ======================================================
        // MODULES
        // ======================================================

        const courseModules =
          modulesByCourse.get(assignedCourse.courseId) ?? [];

        const normalizedModules = courseModules.map((module, index) => {
          const progressKey = `${enrollment.id}:${module.id}`;

          const progress = progressMap.get(progressKey) ?? null;

          return {
            ...module,

            moduleIndex: index + 1,

            progress: {
              id: progress?.id ?? null,

              progressSeconds: Number(progress?.progress_seconds ?? 0),

              completed: progress?.completed === true,

              startedAt: progress?.started_at ?? null,

              completedAt: progress?.completed_at ?? null,
            },
          };
        });

        // ======================================================
        // COURSE PROGRESS
        // ======================================================

        const totalModules = normalizedModules.length;

        const completedModules = normalizedModules.filter(
          (module) => module.progress.completed === true,
        ).length;

        const remainingModules = Math.max(totalModules - completedModules, 0);

        const progressPercentage =
          totalModules > 0
            ? Math.min(Math.round((completedModules / totalModules) * 100), 100)
            : 0;

        const courseCompleted =
          totalModules > 0 && completedModules === totalModules;

        // ======================================================
        // CURRENT MODULE
        //
        // Prefer a started but incomplete module.
        // Otherwise use the first incomplete module.
        // ======================================================

        const startedIncompleteModule =
          normalizedModules.find(
            (module) =>
              module.progress.startedAt && module.progress.completed !== true,
          ) ?? null;

        const firstIncompleteModule =
          normalizedModules.find(
            (module) => module.progress.completed !== true,
          ) ?? null;

        const currentModule =
          startedIncompleteModule ?? firstIncompleteModule ?? null;

        // ======================================================
        // NEXT MODULE
        // ======================================================

        let nextModule = null;

        if (currentModule) {
          const currentIndex = normalizedModules.findIndex(
            (module) => module.id === currentModule.id,
          );

          nextModule = normalizedModules[currentIndex + 1] ?? null;
        }

        // ======================================================
        // COURSE DASHBOARD OBJECT
        // ======================================================

        enrollmentCoursesDashboard.push({
          enrollmentCourse: {
            id: assignedCourse.enrollmentCourseId,

            enrollmentId: enrollment.id,

            courseId: assignedCourse.courseId,

            coursePrice: assignedCourse.coursePrice,

            pricingId: assignedCourse.pricingId,

            durationMonths: assignedCourse.durationMonths,

            createdAt: assignedCourse.createdAt,
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

          modules: normalizedModules,
        });
      }

      // ========================================================
      // ENROLLMENT COURSE SUMMARY
      // ========================================================

      const totalCourses = enrollmentCoursesDashboard.length;

      const completedCourses = enrollmentCoursesDashboard.filter(
        (item) => item.progress.courseCompleted === true,
      ).length;

      const activeCourses = enrollmentCoursesDashboard.filter(
        (item) => item.progress.courseCompleted !== true,
      ).length;

      const enrollmentProgress =
        totalCourses > 0
          ? Math.round(
              enrollmentCoursesDashboard.reduce(
                (sum, item) =>
                  sum + Number(item.progress.progressPercentage ?? 0),
                0,
              ) / totalCourses,
            )
          : 0;

      // ========================================================
      // ENROLLMENT OBJECT
      // ========================================================

      dashboardEnrollments.push({
        enrollment: {
          id: enrollment.id,

          userId: enrollment.user_id,

          enrollmentNumber: enrollment.enrollment_number ?? null,

          status: enrollment.status,

          learningMode: enrollment.learning_mode ?? null,

          totalCourseFee: Number(enrollment.total_course_fee ?? 0),

          amountPaid: Number(enrollment.amount_paid ?? 0),

          balanceDue: Number(enrollment.balance_due ?? 0),

          paymentStatus: enrollment.payment_status ?? null,

          paymentPlanId: enrollment.payment_plan_id ?? null,

          additionalFeePercentage:
            enrollment.additional_fee_percentage !== null &&
            enrollment.additional_fee_percentage !== undefined
              ? Number(enrollment.additional_fee_percentage)
              : null,

          totalPayable: Number(enrollment.total_payable ?? 0),

          initialPaymentAmount: Number(enrollment.initial_payment_amount ?? 0),

          initialPaymentPercentage:
            enrollment.initial_payment_percentage !== null &&
            enrollment.initial_payment_percentage !== undefined
              ? Number(enrollment.initial_payment_percentage)
              : null,

          createdAt: enrollment.created_at ?? null,

          updatedAt: enrollment.updated_at ?? null,
        },

        courses: enrollmentCoursesDashboard,

        summary: {
          totalCourses,

          activeCourses,

          completedCourses,

          overallProgress: enrollmentProgress,
        },

        paymentPlan,

        paymentSummary: {
          totalTuition: Number(totalTuition.toFixed(2)),

          totalPaid: Number(totalPaid.toFixed(2)),

          outstandingBalance: Number(outstandingBalance.toFixed(2)),

          paymentProgress,

          paymentType:
            enrollment.status === "enrolled" && outstandingBalance > 0
              ? "outstanding"
              : null,
        },

        nextPayment,

        upcomingPayments,

        recentPayments: recentEnrollmentPayments,

        timeline,
      });
    }

    // ==========================================================
    // 27. BACKWARD-COMPATIBLE COURSES
    //
    // New UI should use:
    //
    // enrollments[].courses
    //
    // Existing components can temporarily use:
    //
    // courses[]
    // ==========================================================

    const dashboardCourses = dashboardEnrollments.flatMap(
      (enrollmentDashboard) =>
        enrollmentDashboard.courses.map((courseDashboard) => ({
          enrollment: enrollmentDashboard.enrollment,

          enrollmentCourse: courseDashboard.enrollmentCourse,

          course: courseDashboard.course,

          pricing: courseDashboard.pricing,

          progress: courseDashboard.progress,

          currentModule: courseDashboard.currentModule,

          nextModule: courseDashboard.nextModule,

          modules: courseDashboard.modules,

          paymentPlan: enrollmentDashboard.paymentPlan,

          paymentSummary: enrollmentDashboard.paymentSummary,

          nextPayment: enrollmentDashboard.nextPayment,

          upcomingPayments: enrollmentDashboard.upcomingPayments,

          recentPayments: enrollmentDashboard.recentPayments,

          timeline: enrollmentDashboard.timeline,
        })),
    );

    // ==========================================================
    // 28. GLOBAL ENROLLMENT SUMMARY
    //
    // This intentionally includes all enrollment statuses.
    // ==========================================================

    const totalEnrollments = dashboardEnrollments.length;

    const pendingEnrollments = dashboardEnrollments.filter(
      (item) => item.enrollment.status === "pending",
    ).length;

    const confirmedEnrollments = dashboardEnrollments.filter(
      (item) => item.enrollment.status === "confirmed",
    ).length;

    const paymentVerifiedEnrollments = dashboardEnrollments.filter(
      (item) => item.enrollment.status === "payment_verified",
    ).length;

    const activeEnrollmentCount = dashboardEnrollments.filter(
      (item) => item.enrollment.status === "enrolled",
    ).length;

    const completedEnrollments = dashboardEnrollments.filter(
      (item) =>
        item.summary.totalCourses > 0 && item.summary.activeCourses === 0,
    ).length;

    // ==========================================================
    // 29. GLOBAL COURSE SUMMARY
    // ==========================================================

    const totalCourses = dashboardCourses.length;

    const completedCourses = dashboardCourses.filter(
      (item) => item.progress.courseCompleted === true,
    ).length;

    const activeCourses = dashboardCourses.filter(
      (item) => item.progress.courseCompleted !== true,
    ).length;

    const overallProgress =
      totalCourses > 0
        ? Math.round(
            dashboardCourses.reduce(
              (sum, item) =>
                sum + Number(item.progress.progressPercentage ?? 0),
              0,
            ) / totalCourses,
          )
        : 0;

    // ==========================================================
    // 30. GLOBAL FINANCIAL SUMMARY
    //
    // Financial source of truth:
    //
    // academy_enrollments
    // ==========================================================

    const totalTuition = dashboardEnrollments.reduce(
      (sum, enrollmentDashboard) =>
        sum + Number(enrollmentDashboard.paymentSummary.totalTuition ?? 0),
      0,
    );

    const totalPaid = dashboardEnrollments.reduce(
      (sum, enrollmentDashboard) =>
        sum + Number(enrollmentDashboard.paymentSummary.totalPaid ?? 0),
      0,
    );

    const totalOutstandingBalance = dashboardEnrollments.reduce(
      (sum, enrollmentDashboard) =>
        sum +
        Number(enrollmentDashboard.paymentSummary.outstandingBalance ?? 0),
      0,
    );

    // ==========================================================
    // 31. GLOBAL RECENT PAYMENTS
    // ==========================================================

    const recentPayments = [...paymentRows]
      .sort((a, b) => {
        const aDate = a.payment_date ? new Date(a.payment_date).getTime() : 0;

        const bDate = b.payment_date ? new Date(b.payment_date).getTime() : 0;

        return bDate - aDate;
      })
      .slice(0, 10);

    // ==========================================================
    // 32. GLOBAL RECENT ACTIVITY
    // ==========================================================

    const recentActivity = [...timelineRows]
      .sort((a, b) => {
        const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;

        const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;

        return bDate - aDate;
      })
      .slice(0, 10);

    // ==========================================================
    // 33. FINAL RESPONSE
    // ==========================================================

    return NextResponse.json({
      success: true,

      student,

      // ========================================================
      // PRIMARY ENROLLMENT-CENTRIC DATA
      // ========================================================

      enrollments: dashboardEnrollments,

      // ========================================================
      // BACKWARD COMPATIBILITY
      // ========================================================

      courses: dashboardCourses,

      // ========================================================
      // GLOBAL SUMMARY
      // ========================================================

      summary: {
        totalEnrollments,

        pendingEnrollments,

        confirmedEnrollments,

        paymentVerifiedEnrollments,

        activeEnrollments: activeEnrollmentCount,

        completedEnrollments,

        totalCourses,

        activeCourses,

        completedCourses,

        overallProgress,

        totalTuition: Number(totalTuition.toFixed(2)),

        totalPaid: Number(totalPaid.toFixed(2)),

        totalOutstandingBalance: Number(totalOutstandingBalance.toFixed(2)),
      },

      // ========================================================
      // GLOBAL RECENT DATA
      // ========================================================

      recentPayments,

      recentActivity,
    });
  } catch (error) {
    console.error("Academy enrollment-centric dashboard fatal error:", error);

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
