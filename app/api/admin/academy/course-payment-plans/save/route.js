import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, plans } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "Course is required." },
        { status: 400 },
      );
    }

    if (!Array.isArray(plans)) {
      return NextResponse.json({ error: "Invalid plans." }, { status: 400 });
    }

    const enabledPlans = plans.filter((p) => p.active);

    const defaults = enabledPlans.filter((p) => p.isDefault);

    if (enabledPlans.length && defaults.length !== 1) {
      return NextResponse.json(
        {
          error: "Exactly one enabled payment plan must be marked as default.",
        },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    // Remove existing assignments

    const { error: deleteError } = await supabase
      .from("academy_course_payment_plans")
      .delete()
      .eq("course_id", courseId);

    if (deleteError) throw deleteError;

    // Insert enabled plans

    if (enabledPlans.length) {
      const rows = enabledPlans.map((plan) => ({
        course_id: courseId,
        payment_plan_id: plan.planId,
        active: true,
        is_default: plan.isDefault,
      }));

      const { error: insertError } = await supabase
        .from("academy_course_payment_plans")
        .insert(rows);

      if (insertError) throw insertError;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: err.message || "Unable to save payment plans.",
      },
      { status: 500 },
    );
  }
}
