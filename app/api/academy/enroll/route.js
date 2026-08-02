import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { createStudentPaymentPlan } from "@/lib/academy/create-student-payment-plan";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      first_name,
      last_name,
      other_name,
      gender,
      date_of_birth,

      email,
      phone,
      whatsapp,

      country,
      state,
      city,
      street_address,
      postal_code,

      preferred_start_date,
      learning_mode,
      payment_plan_id,

      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,

      occupation,
      education_level,
      referral_source,
      notes,

      total_course_fee,

      courses,
    } = body;

    //--------------------------------------------------------
    // Validation
    //--------------------------------------------------------

    if (!courses?.length) {
      return NextResponse.json(
        {
          error: "Please select at least one course.",
        },
        { status: 400 },
      );
    }

    if (!payment_plan_id) {
      return NextResponse.json(
        {
          error: "Please select a payment plan.",
        },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    //--------------------------------------------------------
    // Enrollment Number
    //--------------------------------------------------------

    const enrollment_number = `QB-${Date.now()}`;

    //--------------------------------------------------------
    // Create Enrollment
    //--------------------------------------------------------

    const { data: enrollment, error: enrollmentError } = await supabase
      .from("academy_enrollments")
      .insert({
        enrollment_number,

        first_name,
        last_name,
        other_name,

        gender,
        date_of_birth,

        email,
        phone,
        whatsapp,

        country,
        state,
        city,
        street_address,
        postal_code,

        preferred_start_date,
        learning_mode,

        payment_plan_id,

        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_relationship,

        occupation,
        education_level,
        referral_source,
        notes,

        total_course_fee,

        amount_paid: 0,

        balance_due: total_course_fee,

        payment_status: "unpaid",

        status: "pending",
      })
      .select()
      .single();

    if (enrollmentError) throw enrollmentError;

    //--------------------------------------------------------
    // Enrollment Courses
    //--------------------------------------------------------

    const enrollmentCourseRows = courses.map((course) => ({
      enrollment_id: enrollment.id,

      course_id: course.course_id,

      pricing_id: course.pricing_id,

      duration_months: course.duration_months,

      course_price: Number(course.amount),
    }));

    const { error: coursesError } = await supabase
      .from("academy_enrollment_courses")
      .insert(enrollmentCourseRows);

    if (coursesError) throw coursesError;

    //--------------------------------------------------------
    // Generate Payment Plan
    //--------------------------------------------------------

    const paymentResult = await createStudentPaymentPlan({
      enrollmentId: enrollment.id,

      paymentPlanId: payment_plan_id,

      totalCourseFee: total_course_fee,

      enrollmentDate: enrollment.created_at ?? new Date().toISOString(),
    });

    //--------------------------------------------------------
    // Sync enrollment financials
    //--------------------------------------------------------

    await supabase
      .from("academy_enrollments")
      .update({
        payment_plan_id: paymentResult.paymentPlan.payment_plan_id,

        total_course_fee: paymentResult.paymentPlan.total_course_fee,

        additional_fee_percentage:
          paymentResult.paymentPlan.additional_fee_percentage,

        total_payable: paymentResult.paymentPlan.total_payable,

        initial_payment_percentage:
          paymentResult.paymentPlan.initial_payment_percentage,

        initial_payment_amount: paymentResult.paymentPlan.deposit_amount,

        amount_paid: 0,

        balance_due: paymentResult.paymentPlan.total_payable,

        payment_status: "unpaid",
      })
      .eq("id", enrollment.id);

    //--------------------------------------------------------
    // Success
    //--------------------------------------------------------

    return NextResponse.json({
      success: true,

      enrollmentId: enrollment.id,

      enrollmentNumber: enrollment_number,

      paymentPlan: paymentResult.paymentPlan,

      paymentSchedule: paymentResult.paymentSchedule,
    });
  } catch (error) {
    console.error("Academy Enrollment Error:", error);

    return NextResponse.json(
      {
        error: error.message || "Unable to submit enrollment.",
      },
      {
        status: 500,
      },
    );
  }
}
