import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

import {
  issueRefund,
  updateEnrollmentFinancials,
} from "@/lib/admin/paymentAdjustments";

//////////////////////////////////////////////////////////////
// POST
// /api/admin/academy/payments/[id]/refund
//////////////////////////////////////////////////////////////

export async function POST(req, { params }) {
  try {
    //////////////////////////////////////////////////////////
    // Auth
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

    const { amount, refund_method, refund_reference, reason, notes } = body;

    //////////////////////////////////////////////////////////
    // Validation
    //////////////////////////////////////////////////////////

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        {
          error: "Refund amount is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!reason?.trim()) {
      return NextResponse.json(
        {
          error: "Refund reason is required.",
        },
        {
          status: 400,
        },
      );
    }

    //////////////////////////////////////////////////////////

    const supabase = createSupabaseAdmin();

    //////////////////////////////////////////////////////////
    // Fetch payment
    //////////////////////////////////////////////////////////

    const { data: payment, error: paymentError } = await supabase
      .from("academy_enrollment_payments")
      .select("*")
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
    // Already refunded?
    //////////////////////////////////////////////////////////

    if (payment.status === "refunded") {
      return NextResponse.json(
        {
          error: "This payment has already been refunded.",
        },
        {
          status: 409,
        },
      );
    }

    //////////////////////////////////////////////////////////
    // Validate amount
    //////////////////////////////////////////////////////////

    if (Number(amount) > Number(payment.amount)) {
      return NextResponse.json(
        {
          error: "Refund amount cannot exceed payment amount.",
        },
        {
          status: 400,
        },
      );
    }

    //////////////////////////////////////////////////////////
    // Create adjustment
    //////////////////////////////////////////////////////////

    const { data: adjustment, error: adjustmentError } = await issueRefund(
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
    // Update payment
    //////////////////////////////////////////////////////////

    const fullyRefunded = Number(amount) >= Number(payment.amount);

    const { error: paymentUpdateError } = await supabase
      .from("academy_enrollment_payments")
      .update({
        status: fullyRefunded ? "refunded" : "partially_refunded",

        refund_amount: Number(amount),

        refund_method,

        refund_reference,

        refunded_at: new Date().toISOString(),

        refunded_by: session.user.id,

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

      event_type: fullyRefunded ? "refund" : "partial_refund",

      title: fullyRefunded ? "Payment Refunded" : "Partial Refund",

      description: reason,

      created_by: session.user.id,
    });

    //////////////////////////////////////////////////////////
    // Update Enrollment Totals
    //////////////////////////////////////////////////////////

    await updateEnrollmentFinancials(supabase, payment.enrollment_id);

    //////////////////////////////////////////////////////////

    return NextResponse.json({
      success: true,

      adjustment,

      message: fullyRefunded
        ? "Payment refunded successfully."
        : "Partial refund recorded successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message || "Unable to refund payment.",
      },
      {
        status: 500,
      },
    );
  }
}
