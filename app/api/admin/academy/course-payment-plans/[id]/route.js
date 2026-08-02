import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

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
  };
}

/* ============================================================
   GET
   Returns:
   - Course
   - Assigned payment plans
   - All available payment plans
============================================================ */

export async function GET(req, { params }) {
  const authResult = await authorize();

  if (authResult.error) return authResult.error;

  const { supabase } = authResult;

  const { id } = await params;

  try {
    const { data: course, error: courseError } = await supabase
      .from("academy_courses")
      .select(
        `
        id,
        title,
        level,
        active,
        academy_course_payment_plans(
          payment_plan_id,
          academy_payment_plans(
            id,
            name,
            description,
            number_of_payments,
            extra_percentage,
            payment_interval_months,
            is_active
          )
        )
      `,
      )
      .eq("id", id)
      .single();

    if (courseError) throw courseError;

    const { data: plans, error: plansError } = await supabase
      .from("academy_payment_plans")
      .select("*")
      .order("number_of_payments");

    if (plansError) throw plansError;

    const assignedPlans =
      course.academy_course_payment_plans?.map(
        (item) => item.academy_payment_plans,
      ) ?? [];

    return NextResponse.json({
      course: {
        id: course.id,
        title: course.title,
        level: course.level,
        category: course.category,
        active: course.active,
      },
      assignedPlans,
      availablePlans: plans,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: err.message || "Unable to load course payment plans.",
      },
      { status: 500 },
    );
  }
}

/* ============================================================
   PUT
   Replace assigned payment plans
============================================================ */

export async function PUT(req, { params }) {
  const authResult = await authorize();

  if (authResult.error) return authResult.error;

  const { supabase } = authResult;

  const { id } = await params;

  try {
    const body = await req.json();

    const paymentPlanIds = body.paymentPlanIds ?? [];

    // remove previous assignments

    const { error: deleteError } = await supabase
      .from("academy_course_payment_plans")
      .delete()
      .eq("course_id", id);

    if (deleteError) throw deleteError;

    if (paymentPlanIds.length) {
      const rows = paymentPlanIds.map((planId) => ({
        course_id: id,
        payment_plan_id: planId,
      }));

      const { error: insertError } = await supabase
        .from("academy_course_payment_plans")
        .insert(rows);

      if (insertError) throw insertError;
    }

    return NextResponse.json({
      success: true,
      message: "Course payment plans updated successfully.",
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: err.message || "Unable to update course payment plans.",
      },
      { status: 500 },
    );
  }
}

/* ============================================================
   DELETE
   Remove every payment plan from this course
============================================================ */

export async function DELETE(req, { params }) {
  const authResult = await authorize();

  if (authResult.error) return authResult.error;

  const { supabase } = authResult;

  const { id } = await params;

  try {
    const { error } = await supabase
      .from("academy_course_payment_plans")
      .delete()
      .eq("course_id", id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: err.message || "Unable to delete course payment plans.",
      },
      { status: 500 },
    );
  }
}
