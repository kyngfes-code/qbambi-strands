import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

//////////////////////////////////////////////////////////////
// POST
// Activate Academy Enrollment
//
// The RPC is responsible for:
// - Verifying the enrollment is payment_verified
// - Verifying the required approved payment
// - Creating/updating the academy student
// - Using the student's STUDENT NUMBER
// - Activating the student payment plan
// - Changing enrollment status to enrolled
// - Queuing the student activation email in email_outbox
//
// Resend is NOT called from this route.
// The email worker processes email_outbox separately.
//////////////////////////////////////////////////////////////

export async function POST(req, { params }) {
  try {
    //------------------------------------------------------
    // Authentication
    //------------------------------------------------------

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden.",
        },
        {
          status: 403,
        },
      );
    }

    //------------------------------------------------------
    // Params
    //------------------------------------------------------

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Enrollment ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    //------------------------------------------------------
    // Supabase Admin
    //------------------------------------------------------

    const supabase = createSupabaseAdmin();

    //------------------------------------------------------
    // Activate Enrollment
    //
    // IMPORTANT:
    // The RPC handles the entire transaction.
    //
    // It should:
    // - validate payment_verified
    // - verify approved payments
    // - create/reuse academy_students
    // - generate student_number
    // - activate the payment plan
    // - update enrollment to enrolled
    // - queue academy_student_activation email
    //------------------------------------------------------

    const { data, error } = await supabase.rpc("activate_academy_enrollment", {
      p_enrollment_id: id,
      p_admin_id: session.user.id,
    });

    if (error) {
      console.error("activate_academy_enrollment RPC error:", error);

      return NextResponse.json(
        {
          success: false,
          error: error.message || "Unable to activate enrollment.",
        },
        {
          status: 400,
        },
      );
    }

    //------------------------------------------------------
    // RPC Result
    //------------------------------------------------------

    let result = data;

    if (typeof data === "string") {
      try {
        result = JSON.parse(data);
      } catch {
        result = {
          success: false,
          message: data,
        };
      }
    }

    //------------------------------------------------------
    // RPC-level failure
    //------------------------------------------------------

    if (result?.success === false) {
      return NextResponse.json(
        {
          success: false,
          error: result?.message || "Unable to activate enrollment.",
        },
        {
          status: 400,
        },
      );
    }

    //------------------------------------------------------
    // Success
    //------------------------------------------------------

    return NextResponse.json({
      success: true,

      message: result?.message || "Academy enrollment activated successfully.",

      enrollmentId: result?.enrollment_id ?? id,

      studentId: result?.student_id ?? null,

      // IMPORTANT:
      // This is academy_students.student_number.
      //
      // Do NOT use:
      // result.enrollment_number
      //
      studentNumber: result?.student_number ?? null,

      userId: result?.user_id ?? null,

      paymentPlanId: result?.payment_plan_id ?? null,

      amountPaid: result?.amount_paid ?? 0,

      requiredInitialPayment: result?.required_initial_payment ?? 0,

      balanceDue: result?.balance_due ?? 0,

      paymentStatus: result?.payment_status ?? null,

      status: result?.status ?? "enrolled",

      // The RPC should return this when the
      // academy_student_activation email has been
      // successfully inserted into email_outbox.
      emailQueued: result?.email_queued ?? false,

      emailOutboxId: result?.email_outbox_id ?? null,

      emailType: result?.email_type ?? "academy_student_activation",
    });
  } catch (error) {
    console.error("Activate Academy Enrollment:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unable to activate enrollment.",
      },
      {
        status: 500,
      },
    );
  }
}
