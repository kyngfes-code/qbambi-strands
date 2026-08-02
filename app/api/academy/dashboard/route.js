// app/api/academy/dashboard/route.js

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    //////////////////////////////////////////////////////
    // Authentication
    //////////////////////////////////////////////////////

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    //////////////////////////////////////////////////////
    // User
    //////////////////////////////////////////////////////

    const supabase = createSupabaseAdmin();

    const { data: student, error: studentError } = await supabase
      .from("academy_students")
      .select(
        `
          *,
    enrollment:academy_enrollments(
      *,
      course:academy_courses(*)
    )
      `,
      )
      .eq("user_id", session.user.id)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        {
          error: "Student record not found.",
        },
        {
          status: 404,
        },
      );
    }

    //////////////////////////////////////////////////////
    // Payment Plan
    //////////////////////////////////////////////////////

    const { data: paymentPlan } = await supabase
      .from("academy_student_payment_plans")
      .select("*")
      .eq("enrollment_id", student.enrollment_id)
      .maybeSingle();

    //////////////////////////////////////////////////////
    // Payment Summary
    //////////////////////////////////////////////////////

    const { data: payments } = await supabase
      .from("academy_enrollment_payments")
      .select("*")
      .eq("enrollment_id", student.enrollment_id)
      .order("payment_date", { ascending: false });

    const totalPaid =
      payments
        ?.filter((p) => p.status === "approved")
        .reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

    //////////////////////////////////////////////////////
    // Upcoming Payments
    //////////////////////////////////////////////////////

    const { data: upcomingPayments } = await supabase
      .from("academy_student_payment_schedule")
      .select("*")
      .eq("student_payment_plan_id", paymentPlan?.id)
      .in("status", ["scheduled", "pending"])
      .order("due_date", { ascending: true });

    //////////////////////////////////////////////////////
    // Next Payment
    //////////////////////////////////////////////////////

    const nextPayment =
      upcomingPayments?.find(
        (payment) =>
          payment.status === "scheduled" || payment.status === "pending",
      ) ?? null;

    //////////////////////////////////////////////////////
    // Recent Timeline
    //////////////////////////////////////////////////////

    const { data: timeline } = await supabase
      .from("academy_enrollment_timeline")
      .select("*")
      .eq("enrollment_id", student.enrollment_id)
      .order("created_at", {
        ascending: false,
      })
      .limit(10);

    //////////////////////////////////////////////////////
    // Payment History
    //////////////////////////////////////////////////////

    const recentPayments = (payments ?? []).slice(0, 5);

    //////////////////////////////////////////////////////
    // Financial Summary
    //////////////////////////////////////////////////////

    const totalTuition = Number(paymentPlan?.total_amount ?? 0);

    const outstandingBalance = Math.max(totalTuition - totalPaid, 0);

    const paymentProgress =
      totalTuition > 0 ? Math.round((totalPaid / totalTuition) * 100) : 0;

    //////////////////////////////////////////////////////
    // Response
    //////////////////////////////////////////////////////

    return NextResponse.json({
      student,

      enrollment: student.enrollment,

      paymentPlan,

      paymentSummary: {
        totalTuition,

        totalPaid,

        outstandingBalance,

        paymentProgress,
      },

      nextPayment,

      upcomingPayments,

      recentPayments,

      timeline,
    });
  } catch (error) {
    console.error("Academy Dashboard:", error);

    return NextResponse.json(
      {
        error: error.message || "Unable to load dashboard.",
      },
      {
        status: 500,
      },
    );
  }
}
