import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { sendAcademyInviteEmail } from "@/lib/email/send-academy-invite";

export async function POST(req, { params }) {
  try {
    //----------------------------------------------------------
    // Authentication
    //----------------------------------------------------------

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    //----------------------------------------------------------
    // Params
    //----------------------------------------------------------

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

    //----------------------------------------------------------
    // RPC
    //----------------------------------------------------------

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase.rpc("activate_academy_enrollment", {
      p_enrollment_id: id,
      p_admin_id: session.user.id,
    });

    if (error) {
      throw error;
    }

    //----------------------------------------------------------
    // RPC returns JSON
    //----------------------------------------------------------

    const result = typeof data === "string" ? JSON.parse(data) : data;

    //----------------------------------------------------------
    // Invite URL
    //----------------------------------------------------------

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/set-password?token=${result.invite_token}`;

    //----------------------------------------------------------
    // Send Email
    //----------------------------------------------------------

    await sendAcademyInviteEmail({
      email: result.email,
      studentNumber: result.student_number,
      inviteUrl,
    });

    //----------------------------------------------------------
    // Success
    //----------------------------------------------------------

    return NextResponse.json({
      success: true,
      studentId: result.student_id,
      studentNumber: result.student_number,
      userId: result.user_id,
    });
  } catch (error) {
    console.error("Activate Academy Enrollment:", error);

    return NextResponse.json(
      {
        error: error.message || "Unable to activate enrollment.",
      },
      {
        status: 500,
      },
    );
  }
}
