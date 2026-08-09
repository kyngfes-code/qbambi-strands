import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

//////////////////////////////////////////////////////////////
// GET
// Fetch complete single enrollment
//////////////////////////////////////////////////////////////

export async function GET(request, { params }) {
  try {
    ////////////////////////////////////////////////////////////
    // AUTH
    ////////////////////////////////////////////////////////////

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    ////////////////////////////////////////////////////////////
    // PARAMS
    ////////////////////////////////////////////////////////////

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Enrollment ID is required." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    ////////////////////////////////////////////////////////////
    // ENROLLMENT
    ////////////////////////////////////////////////////////////

    const { data: enrollment, error: enrollmentError } = await supabase
      .from("academy_enrollments")
      .select("*")
      .eq("id", id)
      .single();

    if (enrollmentError) {
      throw enrollmentError;
    }

    ////////////////////////////////////////////////////////////
    // ENROLLMENT COURSES
    ////////////////////////////////////////////////////////////

    const { data: enrollmentCourses, error: coursesError } = await supabase
      .from("academy_enrollment_courses")
      .select(
        `
        *,
        course:academy_courses(
          id,
          title,
          slug,
          level
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
      .eq("enrollment_id", id);

    if (coursesError) {
      throw coursesError;
    }

    ////////////////////////////////////////////////////////////
    // STUDENT PAYMENT PLAN
    ////////////////////////////////////////////////////////////

    const { data: studentPaymentPlans, error: paymentPlanError } =
      await supabase
        .from("academy_student_payment_plans")
        .select(
          `
        *,
        payment_plan:academy_payment_plans(
          id,
          name,
          description,
          initial_payment_percentage,
          number_of_payments,
          payment_interval_months,
          extra_percentage,
          is_active
        )
      `,
        )
        .eq("enrollment_id", id)
        .order("created_at", {
          ascending: false,
        });

    if (paymentPlanError) {
      throw paymentPlanError;
    }

    ////////////////////////////////////////////////////////////
    // ACTIVE / LATEST STUDENT PAYMENT PLAN
    ////////////////////////////////////////////////////////////

    const studentPaymentPlan =
      studentPaymentPlans?.find((plan) => plan.status === "active") ??
      studentPaymentPlans?.[0] ??
      null;

    ////////////////////////////////////////////////////////////
    // PAYMENT PLAN DETAILS
    ////////////////////////////////////////////////////////////

    const paymentPlanDetails = studentPaymentPlan?.payment_plan ?? null;

    ////////////////////////////////////////////////////////////
    // PAYMENT SCHEDULE
    //
    // Fetch directly using student_payment_plan_id.
    ////////////////////////////////////////////////////////////

    let paymentSchedule = [];

    if (studentPaymentPlan?.id) {
      const { data: schedule, error: scheduleError } = await supabase
        .from("academy_student_payment_schedule")
        .select("*")
        .eq("student_payment_plan_id", studentPaymentPlan.id)
        .order("installment_number", {
          ascending: true,
        });

      if (scheduleError) {
        throw scheduleError;
      }

      paymentSchedule = schedule ?? [];
    }

    ////////////////////////////////////////////////////////////
    // PAYMENT HISTORY
    ////////////////////////////////////////////////////////////

    const { data: paymentHistory, error: paymentHistoryError } = await supabase
      .from("academy_enrollment_payments")
      .select("*")
      .eq("enrollment_id", id)
      .order("payment_date", {
        ascending: false,
      });

    if (paymentHistoryError) {
      throw paymentHistoryError;
    }

    ////////////////////////////////////////////////////////////
    // ADMIN NOTES
    ////////////////////////////////////////////////////////////

    const { data: adminNotes, error: notesError } = await supabase
      .from("academy_enrollment_notes")
      .select(
        `
        *,
        admin:users(
          id,
          first_name,
          last_name
        )
      `,
      )
      .eq("enrollment_id", id)
      .order("created_at", {
        ascending: false,
      });

    if (notesError) {
      throw notesError;
    }

    ////////////////////////////////////////////////////////////
    // TIMELINE
    ////////////////////////////////////////////////////////////

    const { data: timeline, error: timelineError } = await supabase
      .from("academy_enrollment_timeline")
      .select(
        `
        *,
        admin:users(
          id,
          first_name,
          last_name
        )
      `,
      )
      .eq("enrollment_id", id)
      .order("created_at", {
        ascending: false,
      });

    if (timelineError) {
      throw timelineError;
    }

    ////////////////////////////////////////////////////////////
    // PRICING OPTIONS
    ////////////////////////////////////////////////////////////

    const { data: pricingOptions, error: pricingError } = await supabase
      .from("academy_course_pricing")
      .select(
        `
        *,
        course:academy_courses(
          id,
          title,
          active
        )
      `,
      )
      .eq("active", true)
      .order("price", {
        ascending: true,
      });

    if (pricingError) {
      throw pricingError;
    }

    const baseTuition = Number(enrollment.total_course_fee ?? 0);

    const additionalFeePercentage = Number(
      enrollment.additional_fee_percentage ?? 0,
    );

    const additionalFeeAmount = Number(
      (baseTuition * (additionalFeePercentage / 100)).toFixed(2),
    );

    const totalTuition = Number(enrollment.total_payable ?? 0);

    ////////////////////////////////////////////////////////////
    // PAYMENT PLAN DISPLAY VALUE
    //
    // IMPORTANT:
    // payment_plan must be a string for the UI.
    //
    // Keep the complete object separately as
    // payment_plan_details.
    ////////////////////////////////////////////////////////////

    const paymentPlanName = paymentPlanDetails?.name ?? null;

    ////////////////////////////////////////////////////////////
    // FINAL RESPONSE
    ////////////////////////////////////////////////////////////

    return NextResponse.json({
      enrollment: {
        ...enrollment,

        ////////////////////////////////////////////////////////
        // Courses
        ////////////////////////////////////////////////////////

        courses: enrollmentCourses ?? [],

        ////////////////////////////////////////////////////////
        // Payment plan
        ////////////////////////////////////////////////////////

        student_payment_plan: studentPaymentPlan,

        payment_plan: paymentPlanName,

        payment_plan_details: paymentPlanDetails,

        payment_schedule: paymentSchedule,

        ////////////////////////////////////////////////////////
        // Financial values
        ////////////////////////////////////////////////////////

        base_tuition: baseTuition,

        additional_fee_percentage: additionalFeePercentage,

        additional_fee_amount: additionalFeeAmount,

        total_tuition: totalTuition,

        ////////////////////////////////////////////////////////
        // Other enrollment data
        ////////////////////////////////////////////////////////

        payment_history: paymentHistory ?? [],

        admin_notes: adminNotes ?? [],

        timeline: timeline ?? [],
      },

      pricingOptions: pricingOptions ?? [],
    });
  } catch (error) {
    console.error("Academy enrollment details error:", error);

    return NextResponse.json(
      {
        error: "Enrollment not found.",
      },
      {
        status: 404,
      },
    );
  }
}
