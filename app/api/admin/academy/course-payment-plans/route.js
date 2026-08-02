import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("academy_courses")
      .select(
        `
        id,
        title,
        level,
        active,
        academy_course_payment_plans (
          payment_plan_id,
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

    const courses =
      data?.map((course) => ({
        id: course.id,
        title: course.title,
        level: course.level,
        active: course.active,

        paymentPlans:
          course.academy_course_payment_plans?.map((item) => ({
            id: item.academy_payment_plans.id,
            name: item.academy_payment_plans.name,
            numberOfPayments: item.academy_payment_plans.number_of_payments,
            extraPercentage: item.academy_payment_plans.extra_percentage,
            initialPaymentPercentage:
              item.academy_payment_plans.initial_payment_percentage,
            active: item.academy_payment_plans.is_active,
          })) ?? [],
      })) ?? [];

    return NextResponse.json({
      courses,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: err.message || "Unable to load academy course payment plans.",
      },
      { status: 500 },
    );
  }
}
