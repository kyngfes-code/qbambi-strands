import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * ============================================================
 * POST
 * Verify Academy Enrollment Payment
 *
 * Responsibilities:
 *
 * 1. Authenticate user
 * 2. Confirm user is an admin
 * 3. Validate enrollment ID
 * 4. Validate payment ID
 * 5. Call verify_academy_enrollment_payment RPC
 *
 * The RPC is responsible for:
 *
 * - locking the enrollment/payment
 * - validating the payment
 * - approving the payment
 * - creating payment adjustment
 * - calculating amount paid
 * - calculating balance due
 * - updating payment status
 * - changing confirmed -> payment_verified
 * - creating timeline entry
 *
 * This route DOES NOT activate the student.
 *
 * Student activation remains a separate action:
 *
 * payment_verified -> enrolled
 * ============================================================
 */

export async function POST(req, { params }) {
  try {
    // ---------------------------------------------------------
    // Authentication
    // ---------------------------------------------------------

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

    // ---------------------------------------------------------
    // Admin authorization
    // ---------------------------------------------------------

    if (session.user.role !== "admin") {
      return NextResponse.json(
        {
          error: "Forbidden.",
        },
        {
          status: 403,
        },
      );
    }

    // ---------------------------------------------------------
    // Params
    // ---------------------------------------------------------

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Enrollment ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    // ---------------------------------------------------------
    // Request body
    // ---------------------------------------------------------

    const body = await req.json().catch(() => ({}));

    const paymentId =
      typeof body.payment_id === "string" ? body.payment_id.trim() : "";

    const adminNote =
      typeof body.admin_note === "string" ? body.admin_note.trim() : "";

    // ---------------------------------------------------------
    // Validate payment ID
    // ---------------------------------------------------------

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

    // ---------------------------------------------------------
    // Supabase Admin
    // ---------------------------------------------------------

    const supabase = createSupabaseAdmin();

    // ---------------------------------------------------------
    // Verify payment through RPC
    // ---------------------------------------------------------

    const { data, error } = await supabase.rpc(
      "verify_academy_enrollment_payment",
      {
        p_enrollment_id: id,
        p_payment_id: paymentId,
        p_verified_by: session.user.id,
        p_admin_note: adminNote || null,
      },
    );

    // ---------------------------------------------------------
    // RPC error
    // ---------------------------------------------------------

    if (error) {
      console.error("Verify Academy Enrollment Payment RPC:", error);

      return NextResponse.json(
        {
          error: error.message || "Unable to verify academy payment.",
        },
        {
          status: 500,
        },
      );
    }

    // ---------------------------------------------------------
    // Normalize RPC result
    // ---------------------------------------------------------

    let result = data;

    if (typeof data === "string") {
      try {
        result = JSON.parse(data);
      } catch (parseError) {
        console.error(
          "Unable to parse academy payment verification RPC result:",
          parseError,
        );

        return NextResponse.json(
          {
            error:
              "Payment was processed, but the server returned an invalid response.",
          },
          {
            status: 500,
          },
        );
      }
    }

    // ---------------------------------------------------------
    // Validate RPC result
    // ---------------------------------------------------------

    if (!result?.success) {
      return NextResponse.json(
        {
          error: result?.error || "Unable to verify academy payment.",
        },
        {
          status: 400,
        },
      );
    }

    // ---------------------------------------------------------
    // Success
    // ---------------------------------------------------------

    return NextResponse.json({
      success: true,

      message:
        "Payment verified successfully. The enrollment is now awaiting student activation.",

      enrollment: {
        id: result.enrollment_id || id,
        status: result.status || "payment_verified",
        paymentStatus: result.payment_status || null,
      },

      payment: {
        id: result.payment_id || paymentId,
        method: result.payment_method || null,
        reference: result.payment_reference || null,
        amount: result.payment_amount ?? 0,
      },

      financial: {
        amountPaid: result.amount_paid ?? 0,
        totalPayable: result.total_payable ?? 0,
        balanceDue: result.balance_due ?? 0,
        requiredInitialPayment: result.required_initial_payment ?? 0,
      },

      activationRequired: result.activation_required === true,
    });
  } catch (error) {
    console.error("Verify Academy Enrollment Payment:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to verify academy payment.",
      },
      {
        status: 500,
      },
    );
  }
}
