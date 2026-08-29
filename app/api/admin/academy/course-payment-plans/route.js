import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
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
    // SUPABASE
    ////////////////////////////////////////////////////////////

    const supabase = createSupabaseAdmin();

    ////////////////////////////////////////////////////////////
    // FETCH COURSES + PAYMENT PLAN RELATIONSHIPS
    ////////////////////////////////////////////////////////////

    const { data, error } = await supabase
      .from("academy_courses")
      .select(
        `
        id,
        title,
        status,
        sort_order,
        academy_course_payment_plans (
          payment_plan_id,
          is_default,
          active,
          order_index,
          academy_payment_plans (
            id,
            name,
            description,
            number_of_payments,
            extra_percentage,
            initial_payment_percentage,
            is_active,
            payment_interval_months
          )
        )
      `,
      )
      .order("title", { ascending: true });

    if (error) {
      throw error;
    }

    ////////////////////////////////////////////////////////////
    // NORMALIZE RESPONSE
    ////////////////////////////////////////////////////////////

    const courses =
      data?.map((course) => {
        const paymentPlans =
          course.academy_course_payment_plans
            ?.filter((item) => item.academy_payment_plans)
            ?.sort((a, b) => {
              return Number(a.order_index ?? 0) - Number(b.order_index ?? 0);
            })
            ?.map((item) => {
              const plan = item.academy_payment_plans;

              return {
                id: plan.id,
                name: plan.name,
                description: plan.description,

                numberOfPayments: plan.number_of_payments,

                extraPercentage: plan.extra_percentage,

                initialPaymentPercentage: plan.initial_payment_percentage,

                paymentIntervalMonths: plan.payment_interval_months,

                // Payment-plan's own global status
                active: plan.is_active,

                // Course ↔ payment-plan relationship status
                coursePlanActive: item.active,

                isDefault: item.is_default,

                orderIndex: item.order_index,
              };
            }) ?? [];

        return {
          id: course.id,
          title: course.title,

          // academy_courses now uses status instead of active
          status: course.status,

          sortOrder: course.sort_order,

          // Useful booleans for the UI without storing an `active`
          // column on academy_courses.
          published: course.status === "published",
          draft: course.status === "draft",
          archived: course.status === "archived",

          paymentPlans,
        };
      }) ?? [];

    ////////////////////////////////////////////////////////////
    // RESPONSE
    ////////////////////////////////////////////////////////////

    return NextResponse.json({
      courses,
    });
  } catch (err) {
    console.error("Academy course payment plans error:", err);

    return NextResponse.json(
      {
        error: err?.message || "Unable to load academy course payment plans.",
      },
      {
        status: 500,
      },
    );
  }
}
