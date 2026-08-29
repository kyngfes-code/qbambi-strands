import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

function getPlanName(paymentPlan) {
  if (!paymentPlan) {
    return "Academy Payment Plan";
  }

  return (
    paymentPlan.name ||
    paymentPlan.plan_name ||
    paymentPlan.title ||
    paymentPlan.label ||
    "Academy Payment Plan"
  );
}

export async function GET() {
  try {
    // --------------------------------------------------
    // Authentication
    // --------------------------------------------------

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
          code: "UNAUTHORIZED",
        },
        { status: 401 },
      );
    }

    // --------------------------------------------------
    // Must be a student
    // --------------------------------------------------

    if (session.user.role !== "student") {
      return NextResponse.json(
        {
          error: "Academy student access required.",
          code: "NOT_A_STUDENT",
        },
        { status: 403 },
      );
    }

    const supabase = createSupabaseAdmin();

    // --------------------------------------------------
    // Find current enrollment
    // --------------------------------------------------

    const { data: enrollment, error: enrollmentError } = await supabase
      .from("academy_enrollments")
      .select(
        `
        id,
        user_id,
        enrollment_number,
        first_name,
        last_name,
        email,
        status,
        payment_status,
        total_course_fee,
        total_payable,
        amount_paid,
        balance_due,
        initial_payment_amount,
        initial_payment_percentage,
        payment_plan_id
      `,
      )
      .eq("user_id", session.user.id)
      .in("status", ["confirmed", "payment_verified", "enrolled"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (enrollmentError) {
      console.error(
        "Academy payment enrollment lookup error:",
        enrollmentError,
      );

      return NextResponse.json(
        {
          error: "Unable to load your academy enrollment.",
          code: "ENROLLMENT_LOOKUP_FAILED",
        },
        { status: 500 },
      );
    }

    if (!enrollment) {
      return NextResponse.json(
        {
          error: "No active academy enrollment was found.",
          code: "ENROLLMENT_NOT_FOUND",
        },
        { status: 404 },
      );
    }

    // --------------------------------------------------
    // Already enrolled
    // --------------------------------------------------

    if (enrollment.status === "enrolled") {
      return NextResponse.json(
        {
          error: "Your academy enrollment is already active.",
          code: "ALREADY_ENROLLED",
          redirect: "/academy/dashboard",
        },
        { status: 409 },
      );
    }

    // --------------------------------------------------
    // Only confirmed/payment_verified belongs here
    // --------------------------------------------------

    if (
      enrollment.status !== "confirmed" &&
      enrollment.status !== "payment_verified"
    ) {
      return NextResponse.json(
        {
          error: "This enrollment is not currently ready for payment.",
          code: "INVALID_ENROLLMENT_STATUS",
        },
        { status: 409 },
      );
    }

    // --------------------------------------------------
    // Get academy payment plan
    // --------------------------------------------------

    let paymentPlan = null;

    if (enrollment.payment_plan_id) {
      const { data: plan, error: planError } = await supabase
        .from("academy_payment_plans")
        .select("*")
        .eq("id", enrollment.payment_plan_id)
        .maybeSingle();

      if (planError) {
        console.error("Academy payment plan lookup error:", planError);

        return NextResponse.json(
          {
            error: "Unable to load your payment plan.",
            code: "PAYMENT_PLAN_LOOKUP_FAILED",
          },
          { status: 500 },
        );
      }

      paymentPlan = plan;
    }

    // --------------------------------------------------
    // Get final student payment plan
    // --------------------------------------------------

    const { data: studentPaymentPlan, error: studentPlanError } = await supabase
      .from("academy_student_payment_plans")
      .select("*")
      .eq("enrollment_id", enrollment.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (studentPlanError) {
      console.error(
        "Academy student payment plan lookup error:",
        studentPlanError,
      );

      return NextResponse.json(
        {
          error: "Unable to load your student payment plan.",
          code: "STUDENT_PAYMENT_PLAN_LOOKUP_FAILED",
        },
        { status: 500 },
      );
    }

    // --------------------------------------------------
    // Determine total payable
    // --------------------------------------------------

    const totalPayable = Number(
      enrollment.total_payable ??
        enrollment.total_course_fee ??
        studentPaymentPlan?.total_payable ??
        studentPaymentPlan?.total_amount ??
        0,
    );

    // --------------------------------------------------
    // Determine amount already paid
    // --------------------------------------------------

    const amountPaid = Number(enrollment.amount_paid || 0);

    // --------------------------------------------------
    // Determine initial payment
    // --------------------------------------------------

    const initialPaymentAmount = Number(
      studentPaymentPlan?.initial_payment_amount ??
        enrollment.initial_payment_amount ??
        0,
    );

    // --------------------------------------------------
    // Determine payment plan type
    // --------------------------------------------------

    const isInitialPaymentPlan =
      initialPaymentAmount > 0 && initialPaymentAmount < totalPayable;

    // --------------------------------------------------
    // Determine amount required now
    // --------------------------------------------------

    const requiredAmount = isInitialPaymentPlan
      ? Math.max(initialPaymentAmount - amountPaid, 0)
      : Math.max(totalPayable - amountPaid, 0);

    // --------------------------------------------------
    // Determine balance
    // --------------------------------------------------

    const calculatedBalance = Math.max(totalPayable - amountPaid, 0);

    const balanceDue = Number(enrollment.balance_due ?? calculatedBalance);

    // --------------------------------------------------
    // Payment type
    // --------------------------------------------------

    const paymentType = isInitialPaymentPlan
      ? "initial_payment"
      : "full_payment";

    // --------------------------------------------------
    // Payment already verified
    // --------------------------------------------------

    if (enrollment.status === "payment_verified" || requiredAmount <= 0) {
      return NextResponse.json({
        success: true,

        state: "payment_verified",

        enrollment: {
          id: enrollment.id,
          enrollmentNumber: enrollment.enrollment_number,
          firstName: enrollment.first_name,
          lastName: enrollment.last_name,
          email: enrollment.email,
          status: enrollment.status,
          paymentStatus: enrollment.payment_status,
        },

        payment: {
          planName: getPlanName(paymentPlan),

          paymentType,

          totalPayable,

          amountPaid,

          balanceDue,

          initialPaymentAmount,

          requiredAmount: 0,

          isInitialPaymentPlan,
        },
      });
    }

    // --------------------------------------------------
    // Normal payment state
    // --------------------------------------------------

    return NextResponse.json({
      success: true,

      state: "payment_required",

      enrollment: {
        id: enrollment.id,
        enrollmentNumber: enrollment.enrollment_number,
        firstName: enrollment.first_name,
        lastName: enrollment.last_name,
        email: enrollment.email,
        status: enrollment.status,
        paymentStatus: enrollment.payment_status,
      },

      payment: {
        planName: getPlanName(paymentPlan),

        paymentType,

        totalPayable,

        amountPaid,

        balanceDue,

        initialPaymentAmount,

        initialPaymentPercentage: Number(
          enrollment.initial_payment_percentage || 0,
        ),

        requiredAmount,

        isInitialPaymentPlan,
      },
    });
  } catch (error) {
    console.error("Academy payment API error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to load academy payment information.",
        code: "ACADEMY_PAYMENT_ERROR",
      },
      { status: 500 },
    );
  }
}
