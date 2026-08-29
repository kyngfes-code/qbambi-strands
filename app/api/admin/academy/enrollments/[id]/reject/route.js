import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

//////////////////////////////////////////////////////////////
// POST
// Reject Academy Enrollment
//
// The rejection RPC performs the complete database transaction
// AND queues the rejection email into email_outbox.
//
// This route DOES NOT call Resend.
//
// Email delivery happens later when an admin clicks
// "Process Emails" from the Email Outbox dashboard.
//
// NO direct Resend call.
// NO sendAcademyRejectionEmail import.
// NO refund.
// NO payment history changes.
//////////////////////////////////////////////////////////////

export async function POST(req, { params }) {
  try {
    //////////////////////////////////////////////////////////
    // 1. AUTH
    //////////////////////////////////////////////////////////

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

    //////////////////////////////////////////////////////////
    // 2. ADMIN CHECK
    //////////////////////////////////////////////////////////

    const isAdmin =
      session.user.role === "admin" ||
      session.user.isAdmin === true ||
      session.user.email === process.env.ADMIN_EMAIL;

    if (!isAdmin) {
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

    //////////////////////////////////////////////////////////
    // 3. PARAMS
    //////////////////////////////////////////////////////////

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

    //////////////////////////////////////////////////////////
    // 4. BODY
    //////////////////////////////////////////////////////////

    let body;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body.",
        },
        {
          status: 400,
        },
      );
    }

    const rejectionReason =
      typeof body?.rejection_reason === "string"
        ? body.rejection_reason.trim()
        : "";

    const adminNote =
      typeof body?.admin_note === "string" ? body.admin_note.trim() : "";

    //////////////////////////////////////////////////////////
    // 5. VALIDATION
    //////////////////////////////////////////////////////////

    if (!rejectionReason) {
      return NextResponse.json(
        {
          success: false,
          error: "Rejection reason is required.",
        },
        {
          status: 400,
        },
      );
    }

    //////////////////////////////////////////////////////////
    // 6. SUPABASE ADMIN
    //////////////////////////////////////////////////////////

    const supabase = createSupabaseAdmin();

    //////////////////////////////////////////////////////////
    // 7. REJECT ENROLLMENT
    //
    // The RPC is responsible for:
    //
    // - validating the enrollment
    // - creating academy_rejected_applications
    // - deleting payment schedules
    // - deleting student payment plans
    // - deleting enrollment courses
    // - marking enrollment as rejected
    // - creating enrollment notes
    // - creating timeline entry
    // - inserting the rejection email into email_outbox
    //
    // The RPC should NOT call Resend.
    //////////////////////////////////////////////////////////

    const { data: rejectionResult, error: rejectionError } = await supabase.rpc(
      "reject_academy_enrollment",
      {
        p_enrollment_id: id,
        p_admin_id: session.user.id,
        p_rejection_reason: rejectionReason,
        p_admin_note: adminNote || null,
      },
    );

    //////////////////////////////////////////////////////////
    // 8. RPC ERROR
    //////////////////////////////////////////////////////////

    if (rejectionError) {
      console.error("Academy enrollment rejection RPC error:", rejectionError);

      const message = rejectionError.message || "Unable to reject enrollment.";

      ////////////////////////////////////////////////////////
      // Known business errors
      ////////////////////////////////////////////////////////

      if (
        message.includes("already been rejected") ||
        message.includes("cannot be rejected") ||
        message.includes("payment state") ||
        message.includes("current status")
      ) {
        return NextResponse.json(
          {
            success: false,
            error: message,
          },
          {
            status: 409,
          },
        );
      }

      ////////////////////////////////////////////////////////
      // Enrollment not found
      ////////////////////////////////////////////////////////

      if (message.toLowerCase().includes("enrollment not found")) {
        return NextResponse.json(
          {
            success: false,
            error: message,
          },
          {
            status: 404,
          },
        );
      }

      ////////////////////////////////////////////////////////
      // Unexpected database error
      ////////////////////////////////////////////////////////

      return NextResponse.json(
        {
          success: false,
          error: "Unable to reject enrollment.",
          details: process.env.NODE_ENV === "development" ? message : undefined,
        },
        {
          status: 500,
        },
      );
    }

    //////////////////////////////////////////////////////////
    // 9. NORMALIZE RPC RESPONSE
    //////////////////////////////////////////////////////////

    const result = Array.isArray(rejectionResult)
      ? rejectionResult[0]
      : rejectionResult;

    if (!result?.enrollment_id) {
      console.error(
        "Reject enrollment RPC returned an invalid result:",
        rejectionResult,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Enrollment rejection completed, but the server returned an invalid result.",
        },
        {
          status: 500,
        },
      );
    }

    //////////////////////////////////////////////////////////
    // 10. RESPONSE
    //
    // IMPORTANT:
    //
    // There is NO email sending here.
    //
    // The RPC has already inserted the email into email_outbox.
    //
    // Admin must later click:
    //
    //     Process Emails
    //
    // which invokes the email worker and Resend.
    //////////////////////////////////////////////////////////

    return NextResponse.json(
      {
        success: true,

        message:
          "Enrollment rejected successfully. The rejection email has been queued for processing.",

        enrollment: {
          id: result.enrollment_id,

          enrollment_number: result.enrollment_number ?? null,

          first_name: result.first_name ?? null,

          last_name: result.last_name ?? null,

          email: result.email ?? null,

          phone: result.phone ?? null,

          status: result.status ?? "rejected",
        },

        rejection: {
          id: result.rejection_audit_id ?? null,

          reason: result.rejection_reason ?? rejectionReason,

          admin_note: result.admin_note ?? adminNote,
        },

        email: {
          queued: result.email_queued === true,

          outbox_id: result.email_outbox_id ?? null,

          status: "pending",
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    //////////////////////////////////////////////////////////
    // 11. FATAL ERROR
    //////////////////////////////////////////////////////////

    console.error("Academy enrollment rejection error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unable to reject enrollment.",
      },
      {
        status: 500,
      },
    );
  }
}
