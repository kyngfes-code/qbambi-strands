import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
async function queryWithRetry(queryFactory, options = {}) {
  const { retries = 2, delay = 700 } = options;

  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await queryFactory();

      if (!result.error) {
        return result;
      }

      lastError = result.error;

      if (!isNetworkError(result.error)) {
        return result;
      }
    } catch (error) {
      lastError = error;

      if (!isNetworkError(error)) {
        throw error;
      }
    }

    if (attempt < retries) {
      await new Promise((resolve) =>
        setTimeout(resolve, delay * (attempt + 1)),
      );
    }
  }

  return {
    data: null,
    error: lastError,
  };
}

async function authorize() {
  const session = await auth();

  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (session.user.role !== "admin") {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    supabase: createSupabaseAdmin(),
    session,
  };
}

function isNetworkError(error) {
  const message = String(error?.message || "").toLowerCase();
  const name = String(error?.name || "").toLowerCase();

  return (
    (name === "typeerror" && message.includes("fetch failed")) ||
    message.includes("fetch failed") ||
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("econnreset") ||
    message.includes("enotfound") ||
    message.includes("etimedout") ||
    message.includes("econnrefused") ||
    message.includes("socket") ||
    message.includes("connection")
  );
}

function monthName(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(new Date(date));
}

function createMonthBuckets() {
  const buckets = [];
  const today = new Date();

  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);

    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      month: monthName(d),
      amount: 0,
      count: 0,
    });
  }

  return buckets;
}

function number(value) {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
}

export async function GET() {
  const authResult = await authorize();

  if (authResult.error) {
    return authResult.error;
  }

  const { supabase } = authResult;

  try {
    /*
    ==========================================================
    1. CORE DATA
    ==========================================================
    */

    const enrollmentResult = await queryWithRetry(() =>
      supabase.from("academy_enrollments").select("*"),
    );

    if (enrollmentResult.error) {
      console.error(
        "academy_enrollments query failed:",
        enrollmentResult.error,
      );

      const error = enrollmentResult.error;

      console.error("academy_enrollments query failed:", error);

      if (isNetworkError(error)) {
        throw error;
      }

      throw new Error(`academy_enrollments: ${error.message}`);
    }

    const enrollments = enrollmentResult.data ?? [];

    /*
    ==========================================================
    2. PAYMENTS
    ==========================================================
    */

    const paymentResult = await supabase
      .from("academy_enrollment_payments")
      .select("*");

    if (paymentResult.error) {
      console.error(
        "academy_enrollment_payments query failed:",
        paymentResult.error,
      );

      throw new Error(
        `academy_enrollment_payments: ${paymentResult.error.message}`,
      );
    }

    const payments = paymentResult.data ?? [];

    /*
    ==========================================================
    3. PAYMENT ADJUSTMENTS
    ==========================================================
    */

    const adjustmentResult = await supabase
      .from("academy_enrollment_payment_adjustments")
      .select("*");

    if (adjustmentResult.error) {
      console.error(
        "academy_enrollment_payment_adjustments query failed:",
        adjustmentResult.error,
      );

      throw new Error(
        `academy_enrollment_payment_adjustments: ${adjustmentResult.error.message}`,
      );
    }

    const adjustments = adjustmentResult.data ?? [];

    /*
    ==========================================================
    4. COURSES
    ==========================================================
    */

    const courseResult = await supabase.from("academy_courses").select("id", {
      count: "exact",
      head: true,
    });

    if (courseResult.error) {
      console.error("academy_courses query failed:", courseResult.error);

      throw new Error(`academy_courses: ${courseResult.error.message}`);
    }

    /*
    ==========================================================
    5. ACADEMY STUDENTS
    ==========================================================
    */

    const academyStudentsResult = await supabase
      .from("academy_students")
      .select("id, enrollment_id, status, is_active");

    if (academyStudentsResult.error) {
      console.error(
        "academy_students query failed:",
        academyStudentsResult.error,
      );

      throw new Error(
        `academy_students: ${academyStudentsResult.error.message}`,
      );
    }

    const academyStudents = academyStudentsResult.data ?? [];
    /*
    ==========================================================
    6. REVENUE
    ==========================================================
    */

    const approvedPayments = payments.filter(
      (payment) => payment.status === "approved",
    );

    const totalRevenue = approvedPayments.reduce(
      (sum, payment) => sum + number(payment.amount),
      0,
    );

    /*
    ==========================================================
    7. REFUNDS
    ==========================================================
    */

    const refunded = adjustments
      .filter((adjustment) => adjustment.adjustment_type === "refund")
      .reduce((sum, adjustment) => sum + number(adjustment.amount), 0);

    /*
    ==========================================================
    8. WRITE OFF
    ==========================================================
    */

    const writtenOff = adjustments
      .filter((adjustment) => adjustment.adjustment_type === "write_off")
      .reduce((sum, adjustment) => sum + number(adjustment.amount), 0);

    /*
    ==========================================================
    9. OUTSTANDING
    ==========================================================
    */

    const outstandingBalance = enrollments.reduce(
      (sum, enrollment) => sum + number(enrollment.balance_due),
      0,
    );

    /*
==========================================================
10. STUDENT STATISTICS
==========================================================
*/

    const totalStudents = academyStudents.filter(
      (student) => student.is_active === true,
    ).length;

    const activeStudents = academyStudents.filter(
      (student) => student.is_active === true && student.status === "active",
    ).length;

    const pendingEnrollments = enrollments.filter(
      (enrollment) => enrollment.status === "pending",
    ).length;

    const pendingApprovalCount = pendingEnrollments;

    const graduatedStudents = enrollments.filter(
      (enrollment) => enrollment.status === "graduated",
    ).length;

    const graduationRate =
      totalStudents > 0 ? (graduatedStudents / totalStudents) * 100 : 0;
    /*
    ==========================================================
    11. PENDING ACADEMY PAYMENTS
    ==========================================================
    */

    const pendingAcademyPaymentsResult = await supabase
      .from("academy_enrollment_payments")
      .select(
        `
          *,
          enrollment:academy_enrollments(
            id,
            enrollment_number,
            first_name,
            last_name,
            email,
            status,
            payment_status
          )
        `,
      )
      .eq("status", "pending")
      .order("created_at", {
        ascending: false,
      })
      .limit(20);

    if (pendingAcademyPaymentsResult.error) {
      console.error(
        "Pending academy payments query failed:",
        pendingAcademyPaymentsResult.error,
      );

      throw new Error(
        `pending academy payments: ${pendingAcademyPaymentsResult.error.message}`,
      );
    }

    const normalizedPendingPayments = (
      pendingAcademyPaymentsResult.data ?? []
    ).map((payment) => {
      const enrollment = payment.enrollment;

      return {
        ...payment,

        student_name:
          [enrollment?.first_name, enrollment?.last_name]
            .filter(Boolean)
            .join(" ") || "—",

        student_number: enrollment?.enrollment_number || "—",

        email: enrollment?.email || "—",

        amount: number(payment.amount),
      };
    });

    /*
    ==========================================================
     Rejected enrolment
    ==========================================================
    */

    const { data: rejectedApplications, error: rejectedApplicationsError } =
      await supabase
        .from("academy_rejected_applications")
        .select(
          `
      id,
      enrollment_id,
      enrollment_number,
      student_id,
      first_name,
      last_name,
      email,
      phone,
      rejection_reason,
      admin_note,
      rejected_by,
      rejected_at,
      created_at
    `,
        )
        .order("rejected_at", { ascending: false })
        .limit(50);

    if (rejectedApplicationsError) {
      console.error(
        "Rejected applications query error:",
        rejectedApplicationsError,
      );

      throw new Error("Unable to load rejected applications.");
    }

    /*
    ==========================================================
    12. PAYMENT VERIFIED / AWAITING ACTIVATION
    ==========================================================
    */

    const paymentVerifiedResult = await supabase
      .from("academy_enrollments")
      .select(
        `
          id,
          user_id,
          enrollment_number,
          first_name,
          last_name,
          email,
          phone,
          status,
          payment_status,
          total_course_fee,
          total_payable,
          initial_payment_amount,
          amount_paid,
          balance_due,
          initial_payment_percentage,
          created_at,
          updated_at
        `,
      )
      .eq("status", "payment_verified")
      .order("updated_at", {
        ascending: false,
      })
      .limit(20);

    if (paymentVerifiedResult.error) {
      console.error(
        "Payment verified query failed:",
        paymentVerifiedResult.error,
      );

      throw new Error(
        `payment verified enrollments: ${paymentVerifiedResult.error.message}`,
      );
    }

    const paymentVerifiedAwaitingActivation = (
      paymentVerifiedResult.data ?? []
    ).map((enrollment) => ({
      ...enrollment,

      student_name:
        [enrollment.first_name, enrollment.last_name]
          .filter(Boolean)
          .join(" ") || "—",

      student_number: enrollment.enrollment_number || "—",

      email: enrollment.email || "—",

      initial_payment_amount: number(enrollment.initial_payment_amount),

      amount_paid: number(enrollment.amount_paid),

      balance_due: number(enrollment.balance_due),
    }));

    /*
    ==========================================================
    13. MONTHLY REVENUE
    ==========================================================
    */

    const revenueBuckets = createMonthBuckets();

    approvedPayments.forEach((payment) => {
      const d = new Date(payment.payment_date || payment.created_at);

      const key = `${d.getFullYear()}-${d.getMonth()}`;

      const bucket = revenueBuckets.find((item) => item.key === key);

      if (!bucket) {
        return;
      }

      bucket.amount += number(payment.amount);

      bucket.count += 1;
    });

    /*
    ==========================================================
    14. MONTHLY ENROLLMENTS
    ==========================================================
    */

    const enrollmentBuckets = createMonthBuckets();

    enrollments.forEach((enrollment) => {
      const d = new Date(enrollment.created_at);

      const key = `${d.getFullYear()}-${d.getMonth()}`;

      const bucket = enrollmentBuckets.find((item) => item.key === key);

      if (!bucket) {
        return;
      }

      bucket.count += 1;
    });

    /*
============================================================
15. PENDING APPROVALS
============================================================
*/

    const pendingApprovalEnrollmentsResult = await supabase
      .from("academy_enrollments")
      .select("*")
      .eq("status", "pending")
      .order("created_at", {
        ascending: false,
      })
      .limit(5);

    if (pendingApprovalEnrollmentsResult.error) {
      console.error(
        "Pending approval enrollments query failed:",
        pendingApprovalEnrollmentsResult.error,
      );

      throw new Error(
        `pending approvals: ${pendingApprovalEnrollmentsResult.error.message}`,
      );
    }

    const pendingApprovalEnrollments =
      pendingApprovalEnrollmentsResult.data ?? [];

    const pendingEnrollmentIds = pendingApprovalEnrollments.map(
      (enrollment) => enrollment.id,
    );

    let pendingEnrollmentCourses = [];

    if (pendingEnrollmentIds.length > 0) {
      const pendingEnrollmentCoursesResult = await supabase
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
        .in("enrollment_id", pendingEnrollmentIds);

      if (pendingEnrollmentCoursesResult.error) {
        console.error(
          "Pending enrollment courses query failed:",
          pendingEnrollmentCoursesResult.error,
        );

        throw new Error(
          `pending approval courses: ${pendingEnrollmentCoursesResult.error.message}`,
        );
      }

      pendingEnrollmentCourses = pendingEnrollmentCoursesResult.data ?? [];
    }

    const pendingCourseIds = [
      ...new Set(
        pendingEnrollmentCourses.map((row) => row.course_id).filter(Boolean),
      ),
    ];

    let pendingCourses = [];

    if (pendingCourseIds.length > 0) {
      const pendingCoursesResult = await supabase
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
        .in("id", pendingCourseIds);

      if (pendingCoursesResult.error) {
        console.error(
          "Pending approval courses lookup failed:",
          pendingCoursesResult.error,
        );

        throw new Error(
          `pending approval course lookup: ${pendingCoursesResult.error.message}`,
        );
      }

      pendingCourses = pendingCoursesResult.data ?? [];
    }

    const pendingCourseMap = new Map(
      pendingCourses.map((course) => [course.id, course]),
    );

    const pendingCoursesByEnrollment = new Map();

    for (const row of pendingEnrollmentCourses) {
      const course = pendingCourseMap.get(row.course_id) ?? null;

      if (!pendingCoursesByEnrollment.has(row.enrollment_id)) {
        pendingCoursesByEnrollment.set(row.enrollment_id, []);
      }

      pendingCoursesByEnrollment.get(row.enrollment_id).push({
        ...row,
        course,
      });
    }

    const pendingApprovals = pendingApprovalEnrollments.map((enrollment) => ({
      ...enrollment,

      academy_enrollment_courses:
        pendingCoursesByEnrollment.get(enrollment.id) ?? [],
    }));
    /*
============================================================
16. RECENT ENROLLMENTS
============================================================
*/

    const recentEnrollmentsResult = await supabase
      .from("academy_enrollments")
      .select("*")
      .order("created_at", {
        ascending: false,
      })
      .limit(8);

    if (recentEnrollmentsResult.error) {
      console.error(
        "Recent enrollments query failed:",
        recentEnrollmentsResult.error,
      );

      throw new Error(
        `recent enrollments: ${recentEnrollmentsResult.error.message}`,
      );
    }

    const recentEnrollments = recentEnrollmentsResult.data ?? [];

    const recentEnrollmentIds = recentEnrollments.map(
      (enrollment) => enrollment.id,
    );

    let recentEnrollmentCourses = [];

    if (recentEnrollmentIds.length > 0) {
      const recentEnrollmentCoursesResult = await supabase
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
        .in("enrollment_id", recentEnrollmentIds);

      if (recentEnrollmentCoursesResult.error) {
        console.error(
          "Recent enrollment courses query failed:",
          recentEnrollmentCoursesResult.error,
        );

        throw new Error(
          `recent enrollment courses: ${recentEnrollmentCoursesResult.error.message}`,
        );
      }

      recentEnrollmentCourses = recentEnrollmentCoursesResult.data ?? [];
    }

    const recentCourseIds = [
      ...new Set(
        recentEnrollmentCourses.map((row) => row.course_id).filter(Boolean),
      ),
    ];

    let recentCourses = [];

    if (recentCourseIds.length > 0) {
      const recentCoursesResult = await supabase
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
        .in("id", recentCourseIds);

      if (recentCoursesResult.error) {
        console.error(
          "Recent courses lookup failed:",
          recentCoursesResult.error,
        );

        throw new Error(
          `recent course lookup: ${recentCoursesResult.error.message}`,
        );
      }

      recentCourses = recentCoursesResult.data ?? [];
    }

    const recentCourseMap = new Map(
      recentCourses.map((course) => [course.id, course]),
    );

    const recentCoursesByEnrollment = new Map();

    for (const row of recentEnrollmentCourses) {
      const course = recentCourseMap.get(row.course_id) ?? null;

      if (!recentCoursesByEnrollment.has(row.enrollment_id)) {
        recentCoursesByEnrollment.set(row.enrollment_id, []);
      }

      recentCoursesByEnrollment.get(row.enrollment_id).push({
        ...row,
        course,
      });
    }

    const normalizedRecentEnrollments = recentEnrollments.map((enrollment) => ({
      ...enrollment,

      academy_enrollment_courses:
        recentCoursesByEnrollment.get(enrollment.id) ?? [],
    }));
    /*
    ==========================================================
    17. RECENT PAYMENTS
    ==========================================================
    */

    const recentPaymentsResult = await supabase
      .from("academy_enrollment_payments")
      .select(
        `
          *,
          enrollment:academy_enrollments(
            id,
            enrollment_number,
            first_name,
            last_name
          )
        `,
      )
      .order("payment_date", {
        ascending: false,
      })
      .limit(8);

    if (recentPaymentsResult.error) {
      console.error(
        "Recent payments query failed:",
        recentPaymentsResult.error,
      );

      throw new Error(`recent payments: ${recentPaymentsResult.error.message}`);
    }

    /*
============================================================
18. TOP COURSES
============================================================
*/

    const enrollmentCoursesResult = await supabase.from(
      "academy_enrollment_courses",
    ).select(`
    id,
    enrollment_id,
    course_id,
    course_price,
    pricing_id,
    duration_months
  `);

    if (enrollmentCoursesResult.error) {
      console.error(
        "Enrollment courses query failed:",
        enrollmentCoursesResult.error,
      );

      throw new Error(
        `enrollment courses: ${enrollmentCoursesResult.error.message}`,
      );
    }

    const enrollmentCourseRows = enrollmentCoursesResult.data ?? [];

    const topCourseIds = [
      ...new Set(
        enrollmentCourseRows.map((row) => row.course_id).filter(Boolean),
      ),
    ];

    let topCourseData = [];

    if (topCourseIds.length > 0) {
      const topCoursesResult = await supabase
        .from("academy_courses")
        .select(
          `
      id,
      course_code,
      title,
      slug,
      status,
      duration_minutes
    `,
        )
        .in("id", topCourseIds);

      if (topCoursesResult.error) {
        console.error("Top courses lookup failed:", topCoursesResult.error);

        throw new Error(`top courses: ${topCoursesResult.error.message}`);
      }

      topCourseData = topCoursesResult.data ?? [];
    }

    const topCourseMap = new Map(
      topCourseData.map((course) => [course.id, course]),
    );

    const courseMap = new Map();

    for (const row of enrollmentCourseRows) {
      const course = topCourseMap.get(row.course_id);

      if (!course) {
        continue;
      }

      if (!courseMap.has(course.id)) {
        courseMap.set(course.id, {
          id: course.id,
          course_code: course.course_code,
          title: course.title,
          slug: course.slug,

          enrollment_count: 0,
          revenue: 0,

          learning_modes: 0,
        });
      }

      const item = courseMap.get(course.id);

      item.enrollment_count += 1;

      /*
       * Use the actual enrollment course price.
       *
       * This avoids relying on another missing
       * academy_courses relationship.
       */
      item.revenue += number(row.course_price);
    }

    const topCourses = [...courseMap.values()]
      .sort((a, b) => b.enrollment_count - a.enrollment_count)
      .slice(0, 5);
    /*
    ==========================================================
    19. RECENT ACTIVITY
    ==========================================================
    */

    const recentActivityResult = await supabase
      .from("academy_enrollment_timeline")
      .select(
        `
          *,
          enrollment:academy_enrollments(
            id,
            first_name,
            last_name
          ),
          admin:users!academy_enrollment_timeline_created_by_fkey(
            id,
            name
          )
        `,
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(10);

    if (recentActivityResult.error) {
      console.error(
        "Recent activity query failed:",
        recentActivityResult.error,
      );

      throw new Error(`recent activity: ${recentActivityResult.error.message}`);
    }

    const paymentTrend = revenueBuckets.map((month) => ({
      month: month.month,
      amount: month.amount,
      count: month.count,
    }));

    const enrollmentTrend = enrollmentBuckets.map((month) => ({
      month: month.month,
      count: month.count,
    }));

    /*
    ==========================================================
    22. MONTHLY GROWTH
    ==========================================================
    */

    const currentMonthRevenue = paymentTrend.at(-1)?.amount ?? 0;

    const previousMonthRevenue = paymentTrend.at(-2)?.amount ?? 0;

    let monthlyRevenueGrowth = 0;

    if (previousMonthRevenue > 0) {
      monthlyRevenueGrowth =
        ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) *
        100;
    }

    /*
    ==========================================================
    23. STATS
    ==========================================================
    */

    const stats = {
      totalStudents,

      pendingEnrollments,

      activeStudents,

      totalRevenue,

      outstandingBalance,

      graduationRate,

      totalEnrollments: enrollments.length,

      pendingApprovals: pendingApprovalCount,

      paymentVerifiedAwaitingActivation:
        paymentVerifiedAwaitingActivation.length,

      pendingPaymentVerifications: normalizedPendingPayments.length,

      totalCourses: courseResult.count ?? 0,

      totalRefunded: refunded,

      totalWrittenOff: writtenOff,

      paymentCount: approvedPayments.length,

      monthlyGrowth: monthlyRevenueGrowth,
    };

    /*
    ==========================================================
    24. RESPONSE
    ==========================================================
    */

    return NextResponse.json({
      stats,

      enrollmentTrend,

      paymentTrend,

      monthlyRevenue: paymentTrend,

      monthlyRevenueGrowth,

      pendingApprovals,

      pendingAcademyPayments: normalizedPendingPayments,

      paymentVerifiedAwaitingActivation,

      recentEnrollments: normalizedRecentEnrollments,
      recentPayments: recentPaymentsResult.data ?? [],

      recentActivity: recentActivityResult.data ?? [],

      rejectedApplications: rejectedApplications ?? [],

      // upcomingClasses,

      topCourses,
    });
  } catch (error) {
    console.error("Academy dashboard error:", error);

    if (isNetworkError(error)) {
      return NextResponse.json(
        {
          error: "Network connection problem.",
          code: "NETWORK_ERROR",
          retryable: true,
          message:
            "We could not connect to the academy database. Please check your internet connection and try again.",
        },
        {
          status: 503,
          headers: {
            "Retry-After": "5",
          },
        },
      );
    }

    return NextResponse.json(
      {
        error: "Unable to load academy dashboard.",
        code: "DASHBOARD_ERROR",
        retryable: false,
      },
      {
        status: 500,
      },
    );
  }
}
