import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * GET /api/academy/payment-plans?courses=<courseId>
 *
 * Example:
 * /api/academy/payment-plans?courses=48f5df5f-968a-4a39-bace-22cf652d2997
 *
 * The endpoint returns payment plans assigned to ALL submitted courses.
 *
 * For a single-course enrollment, this simply returns all active
 * payment plans assigned to that course.
 */

const querySchema = z.object({
  courses: z
    .string()
    .trim()
    .min(1, "No courses supplied.")
    .transform((value) => {
      return [
        ...new Set(
          value
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean),
        ),
      ];
    })
    .refine((ids) => ids.length > 0, {
      message: "No courses supplied.",
    })
    .refine((ids) => ids.length <= 20, {
      message: "Too many courses selected.",
    }),
});

export async function GET(req) {
  try {
    // ==========================================================
    // REQUEST
    // ==========================================================

    const { searchParams } = new URL(req.url);

    const parsed = querySchema.safeParse({
      courses: searchParams.get("courses") ?? "",
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid request.",
        },
        {
          status: 400,
        },
      );
    }

    const courseIds = parsed.data.courses;

    // ==========================================================
    // DATABASE
    // ==========================================================

    const supabase = createSupabaseAdmin();

    // ==========================================================
    // VERIFY COURSES EXIST
    //
    // IMPORTANT:
    // academy_courses does NOT have an "active" column,
    // so do not filter by .eq("active", true).
    // ==========================================================

    const { data: existingCourses, error: courseError } = await supabase
      .from("academy_courses")
      .select("id")
      .in("id", courseIds);

    if (courseError) {
      console.error("Academy course validation error:", courseError);

      throw courseError;
    }

    // ==========================================================
    // VERIFY ALL COURSES EXIST
    // ==========================================================

    const existingCourseIds = new Set(
      (existingCourses ?? []).map((course) => String(course.id)),
    );

    const missingCourseIds = courseIds.filter(
      (courseId) => !existingCourseIds.has(String(courseId)),
    );

    if (missingCourseIds.length > 0) {
      console.error("Missing course IDs:", missingCourseIds);

      return NextResponse.json(
        {
          error: "One or more selected courses are invalid.",
          invalidCourseIds: missingCourseIds,
        },
        {
          status: 400,
        },
      );
    }

    // ==========================================================
    // LOAD PAYMENT PLAN ASSIGNMENTS
    // ==========================================================

    const { data: assignments, error: assignmentError } = await supabase
      .from("academy_course_payment_plans")
      .select(
        `
          course_id,
          is_default,
          payment_plan:academy_payment_plans (
            id,
            name,
            number_of_payments,
            initial_payment_percentage,
            extra_percentage,
            payment_interval_months,
            description,
            is_active
          )
        `,
      )
      .in("course_id", courseIds);

    if (assignmentError) {
      console.error("Academy payment-plan assignment error:", assignmentError);

      throw assignmentError;
    }

    // ==========================================================
    // FIND PLANS COMMON TO ALL SELECTED COURSES
    // ==========================================================

    const plans = new Map();

    for (const row of assignments ?? []) {
      const paymentPlan = Array.isArray(row.payment_plan)
        ? row.payment_plan[0]
        : row.payment_plan;

      // Ignore broken assignments.
      if (!paymentPlan) {
        continue;
      }

      // Only active payment plans should be returned.
      if (paymentPlan.is_active !== true) {
        continue;
      }

      const planId = String(paymentPlan.id);

      if (!plans.has(planId)) {
        plans.set(planId, {
          plan: paymentPlan,
          courseIds: new Set(),
          isDefault: false,
        });
      }

      const entry = plans.get(planId);

      entry.courseIds.add(String(row.course_id));

      if (row.is_default === true) {
        entry.isDefault = true;
      }
    }

    // ==========================================================
    // ONLY RETURN PLANS AVAILABLE FOR EVERY COURSE
    // ==========================================================

    const paymentPlans = Array.from(plans.values())
      .filter((entry) => entry.courseIds.size === courseIds.length)
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
      .map((entry) => ({
        ...entry.plan,
        is_default: entry.isDefault,
      }));

    // ==========================================================
    // RESPONSE
    // ==========================================================
    return NextResponse.json(
      {
        paymentPlans,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("========== ACADEMY PAYMENT PLANS ERROR ==========");

    console.error(error);

    console.error("=================================================");

    return NextResponse.json(
      {
        error: "Unable to load payment plans.",
      },
      {
        status: 500,
      },
    );
  }
}
