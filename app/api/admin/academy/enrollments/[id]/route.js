import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

//////////////////////////////////////////////////////////////
// GET
// Fetch complete single academy enrollment
//////////////////////////////////////////////////////////////

export async function GET(request, { params }) {
  try {
    ////////////////////////////////////////////////////////////
    // AUTH
    ////////////////////////////////////////////////////////////

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

    if (session.user.role !== "admin") {
      return NextResponse.json(
        {
          error: "Forbidden",
        },
        {
          status: 403,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // PARAMS
    ////////////////////////////////////////////////////////////

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Enrollment ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // DATABASE
    ////////////////////////////////////////////////////////////

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
      console.error("Enrollment fetch error:", enrollmentError);

      throw enrollmentError;
    }

    if (!enrollment) {
      return NextResponse.json(
        {
          error: "Enrollment not found.",
        },
        {
          status: 404,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // ENROLLMENT COURSES
    //
    // IMPORTANT:
    // academy_courses does NOT have:
    // - level
    // - active
    //
    // Therefore only request columns that actually exist.
    ////////////////////////////////////////////////////////////

    const { data: enrollmentCourses, error: coursesError } = await supabase
      .from("academy_enrollment_courses")
      .select(
        `
          *,
          course:academy_courses(
            id,
            title,
            slug
          ),
          pricing:academy_course_pricing(
            id,
            learning_mode,
            duration_months,
            price,
            currency,
            active
          )
        `,
      )
      .eq("enrollment_id", id);

    if (coursesError) {
      console.error("Enrollment courses fetch error:", coursesError);

      throw coursesError;
    }

    ////////////////////////////////////////////////////////////
    // STUDENT PAYMENT PLANS
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
      console.error("Student payment plan fetch error:", paymentPlanError);

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
        console.error("Payment schedule fetch error:", scheduleError);

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
      console.error("Payment history fetch error:", paymentHistoryError);

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
      console.error("Admin notes fetch error:", notesError);

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
      console.error("Enrollment timeline fetch error:", timelineError);

      throw timelineError;
    }

    ////////////////////////////////////////////////////////////
    // PRICING OPTIONS
    //
    // IMPORTANT:
    // Do NOT request academy_courses.active.
    //
    // academy_course_pricing.active is used here because
    // pricing itself has the active flag.
    ////////////////////////////////////////////////////////////

    const { data: pricingOptions, error: pricingError } = await supabase
      .from("academy_course_pricing")
      .select(
        `
          *,
          course:academy_courses(
            id,
            title,
            slug
          )
        `,
      )
      .eq("active", true)
      .order("price", {
        ascending: true,
      });

    if (pricingError) {
      console.error("Pricing options fetch error:", pricingError);

      throw pricingError;
    }

    ////////////////////////////////////////////////////////////
    // FINANCIAL CALCULATIONS
    ////////////////////////////////////////////////////////////

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
        // Student payment plan
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
        // Payment history
        ////////////////////////////////////////////////////////

        payment_history: paymentHistory ?? [],

        ////////////////////////////////////////////////////////
        // Admin notes
        ////////////////////////////////////////////////////////

        admin_notes: adminNotes ?? [],

        ////////////////////////////////////////////////////////
        // Timeline
        ////////////////////////////////////////////////////////

        timeline: timeline ?? [],
      },

      //////////////////////////////////////////////////////////
      // Available pricing options
      //////////////////////////////////////////////////////////

      pricingOptions: pricingOptions ?? [],
    });
  } catch (error) {
    console.error("========== ACADEMY ENROLLMENT DETAILS ERROR ==========");

    console.error(error);

    console.error("=======================================================");

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
