import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    //--------------------------------------------------
    // Authentication
    //--------------------------------------------------

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          redirectTo: "/signin",
        },
        {
          status: 401,
        },
      );
    }

    //--------------------------------------------------
    // Normal user
    //--------------------------------------------------

    if (session.user.role !== "student") {
      return NextResponse.json({
        redirectTo: "/account",
      });
    }

    const supabase = createSupabaseAdmin();

    //--------------------------------------------------
    // Find academy enrollment
    //--------------------------------------------------

    const { data: enrollment, error: enrollmentError } = await supabase
      .from("academy_enrollments")
      .select(
        `
          id,
          user_id,
          status
        `,
      )
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (enrollmentError) {
      console.error("Auth redirect enrollment lookup error:", enrollmentError);

      return NextResponse.json(
        {
          error: "Unable to determine academy account status.",
        },
        {
          status: 500,
        },
      );
    }

    //--------------------------------------------------
    // Student account exists but no academy enrollment
    //--------------------------------------------------

    if (!enrollment) {
      return NextResponse.json({
        redirectTo: "/account",
      });
    }

    //--------------------------------------------------
    // Confirmed = payment required
    //--------------------------------------------------

    if (enrollment.status === "confirmed") {
      return NextResponse.json({
        redirectTo: "/academy/payment",
      });
    }

    //--------------------------------------------------
    // Enrolled = dashboard access
    //--------------------------------------------------

    if (enrollment.status === "enrolled") {
      //------------------------------------------------
      // Also verify active academy student
      //------------------------------------------------

      const { data: student, error: studentError } = await supabase
        .from("academy_students")
        .select(
          `
            id,
            status,
            is_active
          `,
        )
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (studentError) {
        console.error("Auth redirect student lookup error:", studentError);

        return NextResponse.json(
          {
            error: "Unable to verify academy student status.",
          },
          {
            status: 500,
          },
        );
      }

      //------------------------------------------------
      // Enrollment says enrolled but student record
      // isn't active yet.
      //------------------------------------------------

      if (
        !student ||
        student.status !== "active" ||
        student.is_active !== true
      ) {
        return NextResponse.json({
          redirectTo: "/account",
        });
      }

      return NextResponse.json({
        redirectTo: "/academy/dashboard",
      });
    }

    //--------------------------------------------------
    // Any unexpected academy state
    //--------------------------------------------------

    return NextResponse.json({
      redirectTo: "/account",
    });
  } catch (error) {
    console.error("Auth redirect error:", error);

    return NextResponse.json(
      {
        error: error.message || "Unable to determine redirect.",
      },
      {
        status: 500,
      },
    );
  }
}
