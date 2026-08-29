import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

//////////////////////////////////////////////////////////////
// AUTHORIZATION
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
  };
}

//////////////////////////////////////////////////////////////
// GET
//
// Returns:
// - Course
// - Assigned payment plans
// - All available payment plans
//////////////////////////////////////////////////////////////

export async function GET(req, { params }) {
  const authResult = await authorize();

  if (authResult.error) {
    return authResult.error;
  }

  const { supabase } = authResult;

  const { id } = await params;

  try {
    //////////////////////////////////////////////////////////
    // Get course + assigned payment plans
    //////////////////////////////////////////////////////////

    const { data: course, error: courseError } = await supabase
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
          sort_order,
          created_at,
          updated_at,

          academy_course_payment_plans(
            id,
            payment_plan_id,
            is_default,
            active,
            order_index,
            created_at,

            academy_payment_plans(
              id,
              name,
              description,
              number_of_payments,
              extra_percentage,
              initial_payment_percentage,
              payment_interval_months,
              is_active
            )
          )
        `,
      )
      .eq("id", id)
      .single();

    if (courseError) {
      throw courseError;
    }

    //////////////////////////////////////////////////////////
    // Get all available payment plans
    //////////////////////////////////////////////////////////

    const { data: plans, error: plansError } = await supabase
      .from("academy_payment_plans")
      .select(
        `
          id,
          name,
          description,
          number_of_payments,
          extra_percentage,
          initial_payment_percentage,
          payment_interval_months,
          is_active,
          created_at,
          updated_at
        `,
      )
      .order("number_of_payments", {
        ascending: true,
      });

    if (plansError) {
      throw plansError;
    }

    //////////////////////////////////////////////////////////
    // Normalize assigned plans
    //////////////////////////////////////////////////////////

    const assignedPlans =
      course.academy_course_payment_plans?.map((item) => ({
        assignmentId: item.id,
        paymentPlanId: item.payment_plan_id,

        isDefault: item.is_default,
        active: item.active,
        orderIndex: item.order_index,

        createdAt: item.created_at,

        plan: item.academy_payment_plans
          ? {
              id: item.academy_payment_plans.id,
              name: item.academy_payment_plans.name,
              description: item.academy_payment_plans.description,

              numberOfPayments: item.academy_payment_plans.number_of_payments,

              extraPercentage: item.academy_payment_plans.extra_percentage,

              initialPaymentPercentage:
                item.academy_payment_plans.initial_payment_percentage,

              paymentIntervalMonths:
                item.academy_payment_plans.payment_interval_months,

              active: item.academy_payment_plans.is_active,
            }
          : null,
      })) ?? [];

    //////////////////////////////////////////////////////////
    // Normalize course
    //////////////////////////////////////////////////////////

    const normalizedCourse = {
      id: course.id,
      courseCode: course.course_code,
      title: course.title,
      slug: course.slug,
      description: course.description,
      thumbnailPath: course.thumbnail_path,
      durationMinutes: course.duration_minutes,

      // academy_courses now uses status
      status: course.status,

      sortOrder: course.sort_order,

      createdAt: course.created_at,
      updatedAt: course.updated_at,
    };

    //////////////////////////////////////////////////////////
    // Response
    //////////////////////////////////////////////////////////

    return NextResponse.json({
      course: normalizedCourse,
      assignedPlans,
      availablePlans: plans ?? [],
    });
  } catch (err) {
    console.error("GET course payment plans error:", err);

    return NextResponse.json(
      {
        error: err.message || "Unable to load course payment plans.",
      },
      {
        status: 500,
      },
    );
  }
}

//////////////////////////////////////////////////////////////
// PUT
//
// Replace all assigned payment plans for the course.
//
// Expected body:
//
// {
//   "paymentPlanIds": [
//     "uuid-1",
//     "uuid-2"
//   ]
// }
//////////////////////////////////////////////////////////////

export async function PUT(req, { params }) {
  const authResult = await authorize();

  if (authResult.error) {
    return authResult.error;
  }

  const { supabase } = authResult;

  const { id } = await params;

  try {
    const body = await req.json();

    const paymentPlanIds = Array.isArray(body.paymentPlanIds)
      ? body.paymentPlanIds
      : [];

    //////////////////////////////////////////////////////////
    // Make sure the course exists
    //////////////////////////////////////////////////////////

    const { data: course, error: courseError } = await supabase
      .from("academy_courses")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (courseError) {
      throw courseError;
    }

    if (!course) {
      return NextResponse.json(
        {
          error: "Course not found.",
        },
        {
          status: 404,
        },
      );
    }

    //////////////////////////////////////////////////////////
    // Remove existing assignments
    //////////////////////////////////////////////////////////

    const { error: deleteError } = await supabase
      .from("academy_course_payment_plans")
      .delete()
      .eq("course_id", id);

    if (deleteError) {
      throw deleteError;
    }

    //////////////////////////////////////////////////////////
    // Nothing to insert
    //////////////////////////////////////////////////////////

    if (!paymentPlanIds.length) {
      return NextResponse.json({
        success: true,
        message: "All payment plans have been removed from this course.",
      });
    }

    //////////////////////////////////////////////////////////
    // Verify payment plans exist
    //////////////////////////////////////////////////////////

    const { data: existingPlans, error: plansError } = await supabase
      .from("academy_payment_plans")
      .select("id")
      .in("id", paymentPlanIds);

    if (plansError) {
      throw plansError;
    }

    const existingPlanIds = new Set(
      (existingPlans ?? []).map((plan) => plan.id),
    );

    const invalidPlanIds = paymentPlanIds.filter(
      (planId) => !existingPlanIds.has(planId),
    );

    if (invalidPlanIds.length) {
      return NextResponse.json(
        {
          error: "One or more selected payment plans do not exist.",
          invalidPlanIds,
        },
        {
          status: 400,
        },
      );
    }

    //////////////////////////////////////////////////////////
    // Remove duplicate IDs from request
    //////////////////////////////////////////////////////////

    const uniquePaymentPlanIds = [...new Set(paymentPlanIds)];

    //////////////////////////////////////////////////////////
    // Create assignments
    //////////////////////////////////////////////////////////

    const rows = uniquePaymentPlanIds.map((paymentPlanId, index) => ({
      course_id: id,
      payment_plan_id: paymentPlanId,

      // First assigned plan becomes default
      is_default: index === 0,

      active: true,

      order_index: index,
    }));

    const { error: insertError } = await supabase
      .from("academy_course_payment_plans")
      .insert(rows);

    if (insertError) {
      throw insertError;
    }

    //////////////////////////////////////////////////////////
    // Response
    //////////////////////////////////////////////////////////

    return NextResponse.json({
      success: true,
      message: "Course payment plans updated successfully.",
    });
  } catch (err) {
    console.error("PUT course payment plans error:", err);

    return NextResponse.json(
      {
        error: err.message || "Unable to update course payment plans.",
      },
      {
        status: 500,
      },
    );
  }
}

//////////////////////////////////////////////////////////////
// DELETE
//
// Remove every payment-plan assignment from this course.
//////////////////////////////////////////////////////////////

export async function DELETE(req, { params }) {
  const authResult = await authorize();

  if (authResult.error) {
    return authResult.error;
  }

  const { supabase } = authResult;

  const { id } = await params;

  try {
    //////////////////////////////////////////////////////////
    // Make sure course exists
    //////////////////////////////////////////////////////////

    const { data: course, error: courseError } = await supabase
      .from("academy_courses")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (courseError) {
      throw courseError;
    }

    if (!course) {
      return NextResponse.json(
        {
          error: "Course not found.",
        },
        {
          status: 404,
        },
      );
    }

    //////////////////////////////////////////////////////////
    // Remove assignments
    //////////////////////////////////////////////////////////

    const { error } = await supabase
      .from("academy_course_payment_plans")
      .delete()
      .eq("course_id", id);

    if (error) {
      throw error;
    }

    //////////////////////////////////////////////////////////
    // Response
    //////////////////////////////////////////////////////////

    return NextResponse.json({
      success: true,
      message: "All payment plans have been removed from this course.",
    });
  } catch (err) {
    console.error("DELETE course payment plans error:", err);

    return NextResponse.json(
      {
        error: err.message || "Unable to delete course payment plans.",
      },
      {
        status: 500,
      },
    );
  }
}
