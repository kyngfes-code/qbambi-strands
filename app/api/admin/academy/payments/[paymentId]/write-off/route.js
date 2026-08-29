import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

import {
  writeOffBalance,
  updateEnrollmentFinancials,
} from "@/lib/admin/paymentAdjustments";

//////////////////////////////////////////////////////////////
// POST
// /api/admin/academy/payments/[id]/write-off
//////////////////////////////////////////////////////////////

export async function POST(req, { params }) {
  try {
    //////////////////////////////////////////////////////////
    // Authentication
    //////////////////////////////////////////////////////////

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    //////////////////////////////////////////////////////////

    const { id } = await params;

    const body = await req.json();

    const { amount, reason, notes } = body;

    //////////////////////////////////////////////////////////
    // Validation
    //////////////////////////////////////////////////////////

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        {
          error: "Write-off amount is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!reason?.trim()) {
      return NextResponse.json(
        {
          error: "Reason is required.",
        },
        {
          status: 400,
        },
      );
    }

    //////////////////////////////////////////////////////////

    const supabase = createSupabaseAdmin();

    //////////////////////////////////////////////////////////
    // Load Payment
    //////////////////////////////////////////////////////////

    const { data: payment, error: paymentError } = await supabase
      .from("academy_enrollment_payments")
      .select(
        `
        *,
        enrollment:academy_enrollments(
          id,
          total_course_fee,
          amount_paid,
          balance_due,
          payment_status
        )
        `,
      )
      .eq("id", id)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        {
          error: "Payment not found.",
        },
        {
          status: 404,
        },
      );
    }

    //////////////////////////////////////////////////////////
    // Outstanding Balance
    //////////////////////////////////////////////////////////

    const balance = Number(payment.enrollment?.balance_due || 0);

    if (balance <= 0) {
      return NextResponse.json(
        {
          error: "This enrollment has no outstanding balance.",
        },
        {
          status: 409,
        },
      );
    }

    if (Number(amount) > balance) {
      return NextResponse.json(
        {
          error: "Write-off amount cannot exceed the outstanding balance.",
        },
        {
          status: 400,
        },
      );
    }

    //////////////////////////////////////////////////////////
    // Create Adjustment
    //////////////////////////////////////////////////////////

    const { data: adjustment, error: adjustmentError } = await writeOffBalance(
      supabase,
      {
        payment,

        amount,

        reason,

        notes,

        adminId: session.user.id,
      },
    );

    if (adjustmentError) {
      throw adjustmentError;
    }

    //////////////////////////////////////////////////////////
    // Update Payment
    //////////////////////////////////////////////////////////

    const { error: paymentUpdateError } = await supabase
      .from("academy_enrollment_payments")
      .update({
        status: "written_off",

        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (paymentUpdateError) {
      throw paymentUpdateError;
    }

    //////////////////////////////////////////////////////////
    // Timeline
    //////////////////////////////////////////////////////////

    await supabase.from("academy_enrollment_timeline").insert({
      enrollment_id: payment.enrollment_id,

      event_type: "write_off",

      title: "Outstanding Balance Written Off",

      description: `${reason} (Amount: ${Number(amount).toFixed(2)})`,

      created_by: session.user.id,
    });

    //////////////////////////////////////////////////////////
    // Recalculate Financials
    //////////////////////////////////////////////////////////

    await updateEnrollmentFinancials(supabase, payment.enrollment_id);

    //////////////////////////////////////////////////////////

    return NextResponse.json({
      success: true,

      adjustment,

      message: "Outstanding balance written off successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message || "Unable to write off balance.",
      },
      {
        status: 500,
      },
    );
  }
}
