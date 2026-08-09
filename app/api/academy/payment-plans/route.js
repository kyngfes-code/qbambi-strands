import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseAdmin } from "@/lib/supabase-admin";

const querySchema = z.object({
  courses: z
    .string()
    .min(1)
    .transform((value) => [
      ...new Set(
        value
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean),
      ),
    ])
    .refine((ids) => ids.length > 0, {
      message: "No courses supplied.",
    })
    .refine((ids) => ids.length <= 20, {
      message: "Too many courses selected.",
    }),
});

export async function GET(req) {
  try {
    //////////////////////////////////////////////////////
    // Validate Query
    //////////////////////////////////////////////////////

    const { searchParams } = new URL(req.url);

    const parsed = querySchema.safeParse({
      courses: searchParams.get("courses") ?? "",
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0].message,
        },
        {
          status: 400,
        },
      );
    }

    const courseIds = parsed.data.courses;

    //////////////////////////////////////////////////////
    // Database
    //////////////////////////////////////////////////////

    const supabase = createSupabaseAdmin();

    //////////////////////////////////////////////////////
    // Verify submitted courses exist
    //////////////////////////////////////////////////////

    const { data: existingCourses, error: courseError } = await supabase
      .from("academy_courses")
      .select("id")
      .eq("active", true)
      .in("id", courseIds);

    if (courseError) {
      throw courseError;
    }

    if (!existingCourses || existingCourses.length !== courseIds.length) {
      return NextResponse.json(
        {
          error: "One or more selected courses are invalid.",
        },
        {
          status: 400,
        },
      );
    }

    //////////////////////////////////////////////////////
    // Payment Plan Assignments
    //////////////////////////////////////////////////////

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
      throw assignmentError;
    }

    //////////////////////////////////////////////////////
    // Find plans common to every selected course
    //////////////////////////////////////////////////////

    const plans = {};

    for (const row of assignments ?? []) {
      const paymentPlan = Array.isArray(row.payment_plan)
        ? row.payment_plan[0]
        : row.payment_plan;

      if (!paymentPlan || paymentPlan.is_active !== true) {
        continue;
      }

      const id = paymentPlan.id;

      if (!plans[id]) {
        plans[id] = {
          plan: paymentPlan,
          count: 0,
          isDefault: false,
        };
      }

      plans[id].count++;

      if (row.is_default) {
        plans[id].isDefault = true;
      }
    }

    //////////////////////////////////////////////////////
    // Response
    //////////////////////////////////////////////////////

    const paymentPlans = Object.values(plans)
      .filter((item) => item.count === courseIds.length)
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
      .map((item) => ({
        ...item.plan,
        is_default: item.isDefault,
      }));

    return NextResponse.json(
      {
        paymentPlans,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("ACADEMY PAYMENT PLANS ERROR");
    console.error(error);

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
