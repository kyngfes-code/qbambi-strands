import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

//////////////////////////////////////////////////////////////
// POST
// Assign Pricing To Enrollment Course
//////////////////////////////////////////////////////////////

export async function POST(req, { params }) {
  try {
    //--------------------------------------------------
    // Auth
    //--------------------------------------------------

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    //--------------------------------------------------

    const { id: enrollmentId } = await params;

    const { enrollment_course_id, pricing_id } = await req.json();

    if (!enrollment_course_id) {
      return NextResponse.json(
        {
          error: "Enrollment course is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!pricing_id) {
      return NextResponse.json(
        {
          error: "Pricing is required.",
        },
        {
          status: 400,
        },
      );
    }

    const supabase = createSupabaseAdmin();

    //--------------------------------------------------
    // Verify enrollment
    //--------------------------------------------------

    const { data: enrollment } = await supabase
      .from("academy_enrollments")
      .select("id")
      .eq("id", enrollmentId)
      .single();

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

    //--------------------------------------------------
    // Verify pricing
    //--------------------------------------------------

    const { data: pricing, error: pricingError } = await supabase
      .from("academy_course_pricing")
      .select("*")
      .eq("id", pricing_id)
      .eq("active", true)
      .single();

    if (pricingError || !pricing) {
      return NextResponse.json(
        {
          error: "Pricing not found.",
        },
        {
          status: 404,
        },
      );
    }

    //--------------------------------------------------
    // Update enrollment course
    //--------------------------------------------------

    const { error: updateCourseError } = await supabase
      .from("academy_enrollment_courses")
      .update({
        pricing_id: pricing.id,
        duration_months: pricing.duration_months,
        amount: pricing.price,
      })
      .eq("id", enrollment_course_id)
      .eq("enrollment_id", enrollmentId);

    if (updateCourseError) throw updateCourseError;

    //--------------------------------------------------
    // Recalculate total fee
    //--------------------------------------------------

    const { data: enrollmentCourses } = await supabase
      .from("academy_enrollment_courses")
      .select("amount")
      .eq("enrollment_id", enrollmentId);

    const totalCourseFee = (enrollmentCourses || []).reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    );

    //--------------------------------------------------
    // Get amount already paid
    //--------------------------------------------------

    const { data: payments } = await supabase
      .from("academy_enrollment_payments")
      .select("amount")
      .eq("enrollment_id", enrollmentId);

    const amountPaid = (payments || []).reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0,
    );

    //--------------------------------------------------
    // Update enrollment totals
    //--------------------------------------------------

    await supabase
      .from("academy_enrollments")
      .update({
        total_course_fee: totalCourseFee,
        amount_paid: amountPaid,
        balance_due: totalCourseFee - amountPaid,
        updated_at: new Date().toISOString(),
      })
      .eq("id", enrollmentId);

    //--------------------------------------------------
    // Timeline
    //--------------------------------------------------

    await supabase.from("academy_enrollment_timeline").insert({
      enrollment_id: enrollmentId,
      action: "pricing_assigned",
      description: `Assigned ${pricing.learning_mode} pricing (${pricing.duration_months} month${pricing.duration_months > 1 ? "s" : ""}).`,
      created_by: session.user.id,
    });

    //--------------------------------------------------

    return NextResponse.json({
      success: true,
      message: "Pricing assigned successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message || "Unable to assign pricing.",
      },
      {
        status: 500,
      },
    );
  }
}
