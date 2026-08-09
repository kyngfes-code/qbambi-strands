import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { sendAcademyInviteEmail } from "@/lib/email/send-academy-invite";

//////////////////////////////////////////////////////////////
// POST
// Approve Academy Enrollment
//////////////////////////////////////////////////////////////

export async function POST(req, { params }) {
  try {
    //------------------------------------------------------
    // Authentication
    //------------------------------------------------------

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    //------------------------------------------------------
    // Params
    //------------------------------------------------------

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Enrollment ID is required." },
        { status: 400 },
      );
    }

    //------------------------------------------------------
    // Request body
    //------------------------------------------------------

    const body = await req.json().catch(() => ({}));

    const adminNote =
      typeof body.admin_note === "string" ? body.admin_note.trim() : "";

    //------------------------------------------------------
    // Supabase
    //------------------------------------------------------

    const supabase = createSupabaseAdmin();

    //------------------------------------------------------
    // Approval RPC
    //------------------------------------------------------

    const { data, error } = await supabase.rpc("approve_academy_enrollment", {
      p_enrollment_id: id,
      p_admin_id: session.user.id,
      p_admin_note: adminNote || null,
    });

    if (error) {
      console.error("Approve Academy Enrollment RPC:", error);

      return NextResponse.json(
        {
          error: error.message || "Unable to approve enrollment.",
        },
        { status: 500 },
      );
    }

    //------------------------------------------------------
    // Normalize RPC result
    //------------------------------------------------------

    const result = typeof data === "string" ? JSON.parse(data) : data;

    //------------------------------------------------------
    // Validate result
    //------------------------------------------------------

    if (!result?.success) {
      return NextResponse.json(
        {
          error: result?.error || "Unable to approve enrollment.",
        },
        { status: 500 },
      );
    }

    if (!result.email) {
      return NextResponse.json(
        {
          error: "Enrollment was approved, but no student email was returned.",
        },
        { status: 500 },
      );
    }

    if (!result.invite_token) {
      return NextResponse.json(
        {
          error:
            "Enrollment was approved, but no invitation token was generated.",
        },
        { status: 500 },
      );
    }

    //------------------------------------------------------
    // Application URL
    //------------------------------------------------------

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;

    if (!appUrl) {
      throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
    }

    //------------------------------------------------------
    // Build invitation URL
    //------------------------------------------------------

    const inviteUrl = `${appUrl}/set-password?token=${result.invite_token}`;

    //------------------------------------------------------
    // Send Academy invitation
    //
    // Email HTML/template is handled entirely by:
    //
    // /lib/email/send-academy-invite.js
    //
    //------------------------------------------------------

    let emailResult;

    try {
      emailResult = await sendAcademyInviteEmail({
        email: result.email,
        studentNumber: result.student_number || result.enrollment_number || "—",
        inviteUrl,
      });
    } catch (emailError) {
      console.error("Academy Invitation Email:", emailError);

      //----------------------------------------------------
      // IMPORTANT:
      //
      // The approval transaction has already completed.
      // Do NOT change confirmed back to pending.
      //
      // The database state remains:
      //
      // pending -> confirmed
      // user -> student
      // invite -> created
      //
      // Email failure should be retried separately.
      //----------------------------------------------------

      return NextResponse.json(
        {
          success: true,

          warning:
            "Enrollment was approved, but the student invitation email could not be sent.",

          emailSent: false,

          enrollmentId: result.enrollment_id || id,

          userId: result.user_id || null,

          status: result.status || "confirmed",
        },
        { status: 200 },
      );
    }

    //------------------------------------------------------
    // Success
    //------------------------------------------------------

    return NextResponse.json({
      success: true,

      message: "Enrollment approved successfully and student invitation sent.",

      enrollmentId: result.enrollment_id || id,

      userId: result.user_id || null,

      status: result.status || "confirmed",

      emailSent: true,

      emailId: emailResult?.id || null,
    });
  } catch (error) {
    console.error("Approve Academy Enrollment:", error);

    return NextResponse.json(
      {
        error: error.message || "Unable to approve enrollment.",
      },
      { status: 500 },
    );
  }
}
