import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

//////////////////////////////////////////////////////////////
// POST
// Approve Academy Enrollment
//
// Architecture:
//
// API
//   ↓
// approve_academy_enrollment RPC
//   ↓
// DB transaction
//   ├─ Confirm enrollment
//   ├─ Create/find student
//   ├─ Create invite
//   ├─ Queue email
//   ├─ Save notes
//   └─ Save timeline
//   ↓
// COMMIT
//   ↓
// Email Worker
//   ↓
// Resend
//////////////////////////////////////////////////////////////

export async function POST(req, { params }) {
  try {
    //------------------------------------------------------
    // 1. Authentication
    //------------------------------------------------------

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        {
          error: "Forbidden",
        },
        {
          status: 403,
        },
      );
    }

    //------------------------------------------------------
    // 2. Params
    //------------------------------------------------------

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

    //------------------------------------------------------
    // 3. Request body
    //------------------------------------------------------

    const body = await req.json().catch(() => ({}));

    const adminNote =
      typeof body.admin_note === "string" ? body.admin_note.trim() : "";

    //------------------------------------------------------
    // 4. Application URL
    //
    // The RPC uses this to create the invite URL that gets
    // stored inside email_outbox.payload.
    //------------------------------------------------------

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
      console.error("NEXT_PUBLIC_APP_URL is not configured.");

      return NextResponse.json(
        {
          error: "Application URL is not configured.",
        },
        {
          status: 500,
        },
      );
    }

    //------------------------------------------------------
    // 5. Supabase
    //------------------------------------------------------

    const supabase = createSupabaseAdmin();

    //------------------------------------------------------
    // 6. Approval RPC
    //
    // IMPORTANT:
    //
    // The RPC now performs the COMPLETE database transaction,
    // including inserting the email into email_outbox.
    //
    // No Resend call happens here.
    //------------------------------------------------------

    const { data, error } = await supabase.rpc("approve_academy_enrollment", {
      p_enrollment_id: id,
      p_admin_id: session.user.id,
      p_admin_note: adminNote || null,
      p_app_url: appUrl,
    });

    //------------------------------------------------------
    // 7. RPC error
    //------------------------------------------------------

    if (error) {
      console.error("Approve Academy Enrollment RPC:", error);

      return NextResponse.json(
        {
          error: error.message || "Unable to approve enrollment.",
        },
        {
          status: 500,
        },
      );
    }

    //------------------------------------------------------
    // 8. Normalize RPC result
    //------------------------------------------------------

    let result = data;

    if (typeof data === "string") {
      try {
        result = JSON.parse(data);
      } catch (parseError) {
        console.error(
          "Unable to parse academy approval RPC result:",
          parseError,
        );

        return NextResponse.json(
          {
            error:
              "Enrollment was processed, but the server returned an invalid response.",
          },
          {
            status: 500,
          },
        );
      }
    }

    //------------------------------------------------------
    // 9. Validate RPC result
    //------------------------------------------------------

    if (!result?.success) {
      return NextResponse.json(
        {
          error: result?.error || "Unable to approve enrollment.",
        },
        {
          status: 500,
        },
      );
    }

    //------------------------------------------------------
    // 10. Success
    //
    // At this point:
    //
    // ✓ Enrollment confirmed
    // ✓ Student account created/found
    // ✓ Invite created
    // ✓ Email queued
    // ✓ Notes saved
    // ✓ Timeline saved
    // ✓ Transaction committed
    //
    // Resend has NOT been called yet.
    //------------------------------------------------------

    return NextResponse.json({
      success: true,

      message:
        "Enrollment approved successfully. Student invitation has been queued for delivery.",

      enrollmentId: result.enrollment_id || id,

      userId: result.user_id || null,

      status: result.status || "confirmed",

      emailQueued: true,

      emailOutboxId: result.email_outbox_id || null,

      payment: {
        plan: result.payment_plan || null,

        amountRequired: Number(result.initial_payment_amount || 0),

        totalPayable: Number(result.total_payable || 0),

        balanceDue: Number(result.balance_due || 0),
      },
    });
  } catch (error) {
    console.error("Approve Academy Enrollment:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to approve academy enrollment.",
      },
      {
        status: 500,
      },
    );
  }
}
