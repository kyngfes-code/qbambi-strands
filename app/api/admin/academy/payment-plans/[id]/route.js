import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * ----------------------------------------
 * GET SINGLE PAYMENT PLAN
 * ----------------------------------------
 */
export async function GET(req, { params }) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("academy_payment_plans")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: err.message || "Unable to load payment plan.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * ----------------------------------------
 * UPDATE PAYMENT PLAN
 * ----------------------------------------
 */
export async function PATCH(req, { params }) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const updates = {};

    if (body.name !== undefined) {
      if (!body.name.trim()) {
        return NextResponse.json(
          { error: "Plan name is required." },
          { status: 400 },
        );
      }

      updates.name = body.name.trim();
    }

    if (body.number_of_payments !== undefined)
      updates.number_of_payments = body.number_of_payments;

    if (body.initial_payment_percentage !== undefined)
      updates.initial_payment_percentage = body.initial_payment_percentage;

    if (body.additional_fee_percentage !== undefined)
      updates.additional_fee_percentage = body.additional_fee_percentage;

    if (body.monthly_interval !== undefined)
      updates.monthly_interval = body.monthly_interval;

    if (body.active !== undefined) updates.active = body.active;

    updates.updated_at = new Date().toISOString();

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("academy_payment_plans")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: err.message || "Unable to update payment plan.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * ----------------------------------------
 * DELETE PAYMENT PLAN
 * ----------------------------------------
 */
export async function DELETE(req, { params }) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const supabase = createSupabaseAdmin();

    const { count, error: countError } = await supabase
      .from("academy_course_payment_plans")
      .select("*", {
        head: true,
        count: "exact",
      })
      .eq("payment_plan_id", id);

    if (countError) throw countError;

    if (count > 0) {
      return NextResponse.json(
        {
          error:
            "This payment plan is assigned to one or more courses. Remove those assignments first.",
        },
        {
          status: 400,
        },
      );
    }

    const { error } = await supabase
      .from("academy_payment_plans")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: err.message || "Unable to delete payment plan.",
      },
      {
        status: 500,
      },
    );
  }
}
