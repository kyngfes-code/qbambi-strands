import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

//////////////////////////////////////////////////////////////
// POST
// Record Enrollment Payment
//////////////////////////////////////////////////////////////

export async function POST(req, { params }) {
  try {
    //--------------------------------------------------
    // Auth
    //--------------------------------------------------

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    //--------------------------------------------------

    const { id: enrollmentId } = await params;

    const body = await req.json();

    const { amount, payment_method, payment_reference, payment_date, notes } =
      body;

    //--------------------------------------------------
    // Validation
    //--------------------------------------------------

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        {
          error: "A valid payment amount is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!payment_method) {
      return NextResponse.json(
        {
          error: "Payment method is required.",
        },
        {
          status: 400,
        },
      );
    }

    //--------------------------------------------------

    const supabase = createSupabaseAdmin();

    //--------------------------------------------------
    // Enrollment
    //--------------------------------------------------

    const { data: enrollment, error: enrollmentError } = await supabase
      .from("academy_enrollments")
      .select(
        `
          id,
          total_course_fee,
          amount_paid,
          balance_due
        `,
      )
      .eq("id", enrollmentId)
      .single();

    if (enrollmentError || !enrollment) {
      return NextResponse.json(
        {
          error: "Enrollment not found.",
        },
        {
          status: 404,
        },
      );
    }

    //--------------------------------------------------
    // Prevent overpayment
    //--------------------------------------------------

    const paymentAmount = Number(amount);

    if (paymentAmount > Number(enrollment.balance_due)) {
      return NextResponse.json(
        {
          error: "Payment exceeds outstanding balance.",
        },
        {
          status: 409,
        },
      );
    }

    //--------------------------------------------------
    // Create payment
    //--------------------------------------------------

    const { data: payment, error: paymentError } = await supabase
      .from("academy_enrollment_payments")
      .insert({
        enrollment_id: enrollmentId,

        amount: paymentAmount,

        payment_method,

        payment_reference,

        payment_date: payment_date || new Date().toISOString(),

        received_by: session.user.id,

        notes,
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    //--------------------------------------------------
    // Totals
    //--------------------------------------------------

    const balanceBefore = Number(enrollment.balance_due);

    const amountPaid = Number(enrollment.amount_paid) + paymentAmount;

    const balanceAfter = Number(enrollment.total_course_fee) - amountPaid;

    //--------------------------------------------------
    // Ledger
    //--------------------------------------------------

    await supabase.from("academy_enrollment_payment_adjustments").insert({
      enrollment_id: enrollmentId,

      payment_id: payment.id,

      adjustment_type: "payment",

      amount: paymentAmount,

      balance_before: balanceBefore,

      balance_after: balanceAfter,

      payment_method,

      payment_reference,

      description: "Enrollment payment recorded.",

      created_by: session.user.id,
    });

    //--------------------------------------------------
    // Update Enrollment
    //--------------------------------------------------

    const enrollmentStatus = balanceAfter <= 0 ? "paid" : "partially_paid";

    await supabase
      .from("academy_enrollments")
      .update({
        amount_paid: amountPaid,

        balance_due: balanceAfter,

        payment_status: enrollmentStatus,

        updated_at: new Date().toISOString(),
      })
      .eq("id", enrollmentId);

    //--------------------------------------------------
    // Timeline
    //--------------------------------------------------

    await supabase.from("academy_enrollment_timeline").insert({
      enrollment_id: enrollmentId,

      action: "payment_recorded",

      description: `Payment of ₦${paymentAmount.toLocaleString()} recorded.`,

      created_by: session.user.id,
    });

    //--------------------------------------------------

    return NextResponse.json({
      success: true,

      message: "Payment recorded successfully.",

      payment,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message || "Unable to record payment.",
      },
      {
        status: 500,
      },
    );
  }
}
