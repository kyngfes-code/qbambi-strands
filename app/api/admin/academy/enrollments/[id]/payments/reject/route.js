import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req, { params }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 2. Admin authorization
    ////////////////////////////////////////////////////////////

    /*
     * Adjust these roles if your application uses a different
     * admin role structure.
     */

    const allowedRoles = ["admin", "super_admin"];

    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        {
          error: "Forbidden.",
        },
        {
          status: 403,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 3. Enrollment ID
    ////////////////////////////////////////////////////////////

    const { id: enrollmentId } = await params;

    if (!enrollmentId) {
      return NextResponse.json(
        {
          error: "Enrollment ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 4. Request body
    ////////////////////////////////////////////////////////////

    const body = await req.json().catch(() => ({}));

    const { paymentId, rejectionReason, adminNote } = body;

    if (!paymentId) {
      return NextResponse.json(
        {
          error: "Payment ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 5. Rejection reason
    ////////////////////////////////////////////////////////////

    const reason =
      typeof rejectionReason === "string" ? rejectionReason.trim() : "";

    if (!reason) {
      return NextResponse.json(
        {
          error: "Payment rejection reason is required.",
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 6. Supabase
    ////////////////////////////////////////////////////////////

    const supabase = createSupabaseAdmin();

    ////////////////////////////////////////////////////////////
    // 7. Verify payment belongs to enrollment
    ////////////////////////////////////////////////////////////

    const { data: payment, error: paymentLookupError } = await supabase
      .from("academy_enrollment_payments")
      .select(
        `
          id,
          enrollment_id,
          amount,
          payment_method,
          payment_reference,
          status,
          receipt_url,
          receipt_filename
        `,
      )
      .eq("id", paymentId)
      .eq("enrollment_id", enrollmentId)
      .maybeSingle();

    if (paymentLookupError) {
      console.error("Academy payment lookup error:", paymentLookupError);

      return NextResponse.json(
        {
          error: "Unable to load payment.",
        },
        {
          status: 500,
        },
      );
    }

    if (!payment) {
      return NextResponse.json(
        {
          error: "Payment not found for this enrollment.",
        },
        {
          status: 404,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 8. Payment must still be pending
    ////////////////////////////////////////////////////////////

    if (payment.status !== "pending") {
      return NextResponse.json(
        {
          error: `This payment has already been ${payment.status}.`,
        },
        {
          status: 409,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 9. Verify enrollment exists
    ////////////////////////////////////////////////////////////

    const { data: enrollment, error: enrollmentError } = await supabase
      .from("academy_enrollments")
      .select(
        `
          id,
          enrollment_number,
          status,
          payment_status,
          user_id
        `,
      )
      .eq("id", enrollmentId)
      .maybeSingle();

    if (enrollmentError) {
      console.error("Academy enrollment lookup error:", enrollmentError);

      return NextResponse.json(
        {
          error: "Unable to load enrollment.",
        },
        {
          status: 500,
        },
      );
    }

    if (!enrollment) {
      return NextResponse.json(
        {
          error: "Enrollment not found.",
        },
        {
          status: 404,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 10. Enrollment must be confirmed
    ////////////////////////////////////////////////////////////

    /*
     * Payment rejection should happen while the enrollment is
     * waiting for payment.
     *
     * We deliberately do NOT move the enrollment to rejected.
     *
     * The student can submit another valid payment.
     */

    if (enrollment.status !== "confirmed") {
      return NextResponse.json(
        {
          error: `Payment cannot be rejected because the enrollment status is "${enrollment.status}".`,
        },
        {
          status: 409,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 11. Reject payment
    ////////////////////////////////////////////////////////////

    const now = new Date().toISOString();

    const { data: updatedPayment, error: updatePaymentError } = await supabase
      .from("academy_enrollment_payments")
      .update({
        status: "rejected",
        reviewed_by: session.user.id,
        reviewed_at: now,
        rejection_reason: reason,
        admin_note:
          typeof adminNote === "string" ? adminNote.trim() || null : null,
        updated_at: now,
      })
      .eq("id", payment.id)
      .eq("enrollment_id", enrollmentId)
      .eq("status", "pending")
      .select(
        `
          id,
          enrollment_id,
          amount,
          payment_method,
          payment_reference,
          status,
          rejection_reason,
          admin_note,
          reviewed_by,
          reviewed_at,
          updated_at
        `,
      )
      .maybeSingle();

    if (updatePaymentError) {
      console.error("Academy payment rejection error:", updatePaymentError);

      return NextResponse.json(
        {
          error: "Unable to reject payment.",
        },
        {
          status: 500,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 12. Prevent race condition
    ////////////////////////////////////////////////////////////

    if (!updatedPayment) {
      return NextResponse.json(
        {
          error: "This payment has already been processed.",
        },
        {
          status: 409,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 13. Timeline
    ////////////////////////////////////////////////////////////

    const { error: timelineError } = await supabase
      .from("academy_enrollment_timeline")
      .insert({
        enrollment_id: enrollmentId,
        event_type: "payment_rejected",
        title: "Payment Rejected",
        description: `Payment of ${payment.amount} was rejected. Reason: ${reason}`,
        created_by: session.user.id,
      });

    /*
     * Timeline failure should not undo the payment rejection.
     * Log it for investigation instead.
     */

    if (timelineError) {
      console.error("Academy payment rejection timeline error:", timelineError);
    }

    ////////////////////////////////////////////////////////////
    // 14. Return success
    ////////////////////////////////////////////////////////////

    return NextResponse.json({
      success: true,

      message: "Payment rejected successfully.",

      payment: updatedPayment,

      enrollment: {
        id: enrollment.id,
        enrollment_number: enrollment.enrollment_number,
        status: enrollment.status,
        payment_status: enrollment.payment_status,
      },
    });
  } catch (error) {
    ////////////////////////////////////////////////////////////
    // Unexpected error
    ////////////////////////////////////////////////////////////

    console.error("Academy payment rejection route error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to reject academy payment.",
      },
      {
        status: 500,
      },
    );
  }
}
