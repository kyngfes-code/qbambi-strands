import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

//////////////////////////////////////////////////////////////
// POST
// Activate Academy Enrollment
//
// The RPC is responsible for:
// - Verifying the enrollment
// - Ensuring status is "confirmed"
// - Verifying the required payment is approved
// - Activating the student/payment plan
// - Activating the payment schedule
// - Changing enrollment status to "enrolled"
// - Recording the activation timeline
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
    //------------------------------------------------------

    const { data, error } = await supabase.rpc("activate_academy_enrollment", {
      p_enrollment_id: id,
      p_admin_id: session.user.id,
    });

    if (error) {
      console.error("activate_academy_enrollment RPC error:", error);

      return NextResponse.json(
        {
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

    const result = typeof data === "string" ? JSON.parse(data) : data;

    //------------------------------------------------------
    // Success
    //------------------------------------------------------

    return NextResponse.json({
      success: true,
      message: result?.message || "Enrollment activated successfully.",
      enrollment: result?.enrollment ?? null,
      studentId: result?.student_id ?? null,
      studentNumber: result?.student_number ?? null,
      userId: result?.user_id ?? null,
      paymentPlanId: result?.payment_plan_id ?? null,
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
