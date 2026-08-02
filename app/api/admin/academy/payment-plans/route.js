import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * ==========================================================
 * GET
 * Fetch all academy payment plans
 * ==========================================================
 */
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
      .from("academy_payment_plans")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      paymentPlans: data ?? [],
    });
  } catch (err) {
    console.error("GET academy payment plans:", err);

    return NextResponse.json(
      {
        error: err.message || "Unable to fetch payment plans.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * ==========================================================
 * POST
 * Create academy payment plan
 * ==========================================================
 */
export async function POST(req) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const {
      name,
      description,
      number_of_payments,
      initial_payment_percentage,
      extra_percentage,
      payment_interval_months,
      is_active = true,
      sort_order = 0,
    } = body;

    /**
     * Validation
     */

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Payment plan name is required." },
        { status: 400 },
      );
    }

    if (!number_of_payments || Number(number_of_payments) < 1) {
      return NextResponse.json(
        { error: "Number of payments must be at least 1." },
        { status: 400 },
      );
    }

    if (
      initial_payment_percentage == null ||
      Number(initial_payment_percentage) < 0 ||
      Number(initial_payment_percentage) > 100
    ) {
      return NextResponse.json(
        {
          error: "Initial payment percentage must be between 0 and 100.",
        },
        {
          status: 400,
        },
      );
    }

    if (extra_percentage != null && Number(extra_percentage) < 0) {
      return NextResponse.json(
        {
          error: "Additional percentage cannot be negative.",
        },
        {
          status: 400,
        },
      );
    }

    if (payment_interval_months && Number(payment_interval_months) < 1) {
      return NextResponse.json(
        {
          error: "Payment interval must be at least one month.",
        },
        {
          status: 400,
        },
      );
    }

    const supabase = createSupabaseAdmin();

    /**
     * Prevent duplicate names
     */

    const { data: existing } = await supabase
      .from("academy_payment_plans")
      .select("id")
      .ilike("name", name.trim())
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          error: "A payment plan with this name already exists.",
        },
        {
          status: 409,
        },
      );
    }

    const { data, error } = await supabase
      .from("academy_payment_plans")
      .insert({
        name: name.trim(),
        description: description || null,

        number_of_payments: Number(number_of_payments),

        initial_payment_percentage: Number(initial_payment_percentage),

        extra_percentage: Number(extra_percentage ?? 0),

        payment_interval_months: Number(payment_interval_months ?? 1),

        is_active,

        sort_order: Number(sort_order),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        paymentPlan: data,
      },
      {
        status: 201,
      },
    );
  } catch (err) {
    console.error("POST academy payment plan:", err);

    return NextResponse.json(
      {
        error: err.message || "Unable to create payment plan.",
      },
      {
        status: 500,
      },
    );
  }
}
