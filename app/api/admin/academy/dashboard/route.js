import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

//////////////////////////////////////////////////////////////
// Authorization
//////////////////////////////////////////////////////////////

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

//////////////////////////////////////////////////////////////
// Helpers
//////////////////////////////////////////////////////////////

function monthName(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(new Date(date));
}

//////////////////////////////////////////////////////////////

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

//////////////////////////////////////////////////////////////
// GET
//////////////////////////////////////////////////////////////

export async function GET() {
  const authResult = await authorize();

  if (authResult.error) return authResult.error;

  const { supabase } = authResult;

  try {
    //////////////////////////////////////////////////////////
    // Dashboard Stats
    //////////////////////////////////////////////////////////

    const [enrollmentResult, paymentResult, adjustmentResult, courseResult] =
      await Promise.all([
        supabase.from("academy_enrollments").select("*"),

        supabase.from("academy_enrollment_payments").select("*"),

        supabase.from("academy_enrollment_payment_adjustments").select("*"),

        supabase.from("academy_courses").select("id"),
      ]);

    if (enrollmentResult.error) throw enrollmentResult.error;

    if (paymentResult.error) throw paymentResult.error;

    if (adjustmentResult.error) throw adjustmentResult.error;

    if (courseResult.error) throw courseResult.error;

    //////////////////////////////////////////////////////////

    const enrollments = enrollmentResult.data ?? [];

    const payments = paymentResult.data ?? [];

    const adjustments = adjustmentResult.data ?? [];

    //////////////////////////////////////////////////////////
    // Revenue
    //////////////////////////////////////////////////////////

    const totalRevenue = payments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0,
    );

    const refunded = adjustments
      .filter((a) => a.adjustment_type === "refund")
      .reduce((sum, adjustment) => sum + Number(adjustment.amount || 0), 0);

    const writtenOff = adjustments
      .filter((a) => a.adjustment_type === "write_off")
      .reduce((sum, adjustment) => sum + Number(adjustment.amount || 0), 0);

    //////////////////////////////////////////////////////////
    // Outstanding Balance
    //////////////////////////////////////////////////////////

    const outstandingBalance = enrollments.reduce(
      (sum, enrollment) => sum + Number(enrollment.balance_due || 0),
      0,
    );

    //////////////////////////////////////////////////////////
    // Enrollment Status
    //////////////////////////////////////////////////////////

    const pendingApprovals = enrollments.filter(
      (e) => e.status === "pending",
    ).length;

    const activeStudents = enrollments.filter((e) =>
      ["confirmed", "enrolled"].includes(e.status),
    ).length;

    //////////////////////////////////////////////////////////
    // Monthly Revenue
    //////////////////////////////////////////////////////////

    const revenueBuckets = createMonthBuckets();

    payments.forEach((payment) => {
      const d = new Date(payment.payment_date || payment.created_at);

      const key = `${d.getFullYear()}-${d.getMonth()}`;

      const bucket = revenueBuckets.find((b) => b.key === key);

      if (!bucket) return;

      bucket.amount += Number(payment.amount || 0);
    });

    //////////////////////////////////////////////////////////
    // Monthly Enrollments
    //////////////////////////////////////////////////////////

    const enrollmentBuckets = createMonthBuckets();

    enrollments.forEach((enrollment) => {
      const d = new Date(enrollment.created_at);

      const key = `${d.getFullYear()}-${d.getMonth()}`;

      const bucket = enrollmentBuckets.find((b) => b.key === key);

      if (!bucket) return;

      bucket.count += 1;
    });
    //////////////////////////////////////////////////////////
    // Pending Approval List
    //////////////////////////////////////////////////////////

    const { data: pendingApprovalRows, error: pendingError } = await supabase
      .from("academy_enrollments")
      .select(
        `
            *,
            academy_enrollment_courses(
              id,
              course:academy_courses(
                id,
                title,
                level
              )
            )
          `,
      )
      .eq("status", "pending")
      .order("created_at", {
        ascending: false,
      })
      .limit(5);

    if (pendingError) throw pendingError;

    //////////////////////////////////////////////////////////
    // Recent Enrollments
    //////////////////////////////////////////////////////////

    const { data: recentEnrollments, error: recentEnrollmentError } =
      await supabase
        .from("academy_enrollments")
        .select(
          `
          *,
          academy_enrollment_courses(
            id,
            course:academy_courses(
              id,
              title,
              level
            )
          )
        `,
        )
        .order("created_at", {
          ascending: false,
        })
        .limit(8);

    if (recentEnrollmentError) throw recentEnrollmentError;

    //////////////////////////////////////////////////////////
    // Recent Payments
    //////////////////////////////////////////////////////////

    const { data: recentPayments, error: paymentHistoryError } = await supabase
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

    if (paymentHistoryError) throw paymentHistoryError;

    //////////////////////////////////////////////////////////
    // Payment Trend
    //////////////////////////////////////////////////////////

    const paymentTrend = revenueBuckets.map((month) => ({
      month: month.month,
      amount: month.amount,
    }));

    //////////////////////////////////////////////////////////
    // Enrollment Trend
    //////////////////////////////////////////////////////////

    const enrollmentTrend = enrollmentBuckets.map((month) => ({
      month: month.month,
      count: month.count,
    }));

    //////////////////////////////////////////////////////////
    // Top Courses
    //////////////////////////////////////////////////////////

    const { data: enrollmentCourses, error: enrollmentCourseError } =
      await supabase.from("academy_enrollment_courses").select(`
        id,
        enrollment_id,
        course_id,
        course:academy_courses(
          id,
          title,
          level
        ),
        pricing:academy_course_pricing(
          price
        )
      `);

    if (enrollmentCourseError) throw enrollmentCourseError;

    //////////////////////////////////////////////////////////

    const courseMap = new Map();

    enrollmentCourses.forEach((row) => {
      const id = row.course?.id;

      if (!id) return;

      if (!courseMap.has(id)) {
        courseMap.set(id, {
          id,
          title: row.course.title,
          level: row.course.level,
          enrollment_count: 0,
          revenue: 0,
          learning_modes: 0,
        });
      }

      const course = courseMap.get(id);

      course.enrollment_count++;

      course.revenue += Number(row.pricing?.price || 0);
    });

    const topCourses = [...courseMap.values()]
      .sort((a, b) => b.enrollment_count - a.enrollment_count)
      .slice(0, 5);

    //////////////////////////////////////////////////////////
    // Recent Activity
    //////////////////////////////////////////////////////////

    const { data: recentActivity, error: activityError } = await supabase
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

    if (activityError) throw activityError;

    //////////////////////////////////////////////////////////
    // Upcoming Classes
    //////////////////////////////////////////////////////////

    let upcomingClasses = [];

    const { data: classRows, error: classError } = await supabase
      .from("academy_classes")
      .select("*")
      .gte("class_date", new Date().toISOString())
      .order("class_date", {
        ascending: true,
      })
      .limit(5);

    // Ignore if the academy_classes table
    // doesn't exist yet.
    if (!classError && classRows) {
      upcomingClasses = classRows;
    }

    //////////////////////////////////////////////////////////
    // Monthly Growth
    //////////////////////////////////////////////////////////

    const currentMonthRevenue = paymentTrend.at(-1)?.amount ?? 0;

    const previousMonthRevenue = paymentTrend.at(-2)?.amount ?? 0;

    let monthlyRevenueGrowth = 0;

    if (previousMonthRevenue > 0) {
      monthlyRevenueGrowth =
        ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) *
        100;
    }

    //////////////////////////////////////////////////////////
    // Final Stats
    //////////////////////////////////////////////////////////

    const stats = {
      totalEnrollments: enrollments.length,

      activeStudents,

      pendingApprovals,

      totalCourses: courseResult.data.length,

      totalRevenue,

      outstandingBalance,

      totalRefunded: refunded,

      totalWrittenOff: writtenOff,

      paymentCount: payments.length,

      monthlyGrowth: monthlyRevenueGrowth,
    };

    //////////////////////////////////////////////////////////
    // Response
    //////////////////////////////////////////////////////////

    return NextResponse.json({
      stats,

      enrollmentTrend,

      paymentTrend,

      monthlyRevenue: paymentTrend,

      monthlyRevenueGrowth,

      pendingApprovals: pendingApprovalRows ?? [],

      recentEnrollments: recentEnrollments ?? [],

      recentPayments: recentPayments ?? [],

      recentActivity: recentActivity ?? [],

      upcomingClasses,

      topCourses,
    });
  } catch (error) {
    console.error("Academy dashboard error:", error);

    return NextResponse.json(
      {
        error: "Unable to load academy dashboard.",
      },
      {
        status: 500,
      },
    );
  }
}
