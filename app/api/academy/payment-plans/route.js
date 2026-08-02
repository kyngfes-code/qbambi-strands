import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const coursesParam = searchParams.get("courses");

    if (!coursesParam) {
      return NextResponse.json(
        {
          error: "No courses supplied.",
        },
        { status: 400 },
      );
    }

    const courseIds = coursesParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (!courseIds.length) {
      return NextResponse.json({
        paymentPlans: [],
      });
    }

    const supabase = createSupabaseAdmin();

    /**
     * Get all plan assignments
     */

    const { data: assignments, error } = await supabase
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
          additional_fee_percentage,
          monthly_interval,
          active
        )
      `,
      )
      .in("course_id", courseIds);

    if (error) throw error;

    /**
     * Keep only active plans
     */

    const rows = assignments.filter((row) => row.payment_plan?.active === true);

    /**
     * Find plans common to every selected course
     */

    const counts = {};

    rows.forEach((row) => {
      const id = row.payment_plan.id;

      if (!counts[id]) {
        counts[id] = {
          plan: row.payment_plan,
          count: 0,
          isDefault: row.is_default,
        };
      }

      counts[id].count += 1;

      if (row.is_default) {
        counts[id].isDefault = true;
      }
    });

    const paymentPlans = Object.values(counts)
      .filter((item) => item.count === courseIds.length)
      .sort((a, b) => {
        if (a.isDefault === b.isDefault) return 0;

        return a.isDefault ? -1 : 1;
      })
      .map((item) => ({
        ...item.plan,
        is_default: item.isDefault,
      }));

    return NextResponse.json({
      paymentPlans,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: err.message || "Unable to load payment plans.",
      },
      { status: 500 },
    );
  }
}
