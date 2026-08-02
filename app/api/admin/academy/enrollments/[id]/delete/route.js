import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

//////////////////////////////////////////////////////////////
// DELETE
// Delete Enrollment
//////////////////////////////////////////////////////////////

export async function DELETE(req, { params }) {
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

    const { id } = await params;

    const supabase = createSupabaseAdmin();

    //------------------------------------------------------
    // Verify Enrollment
    //------------------------------------------------------

    const { data: enrollment, error: enrollmentError } = await supabase
      .from("academy_enrollments")
      .select("id, status")
      .eq("id", id)
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

    //------------------------------------------------------
    // Prevent deletion of important records
    //------------------------------------------------------

    const protectedStatuses = ["active", "graduated"];

    if (protectedStatuses.includes(enrollment.status)) {
      return NextResponse.json(
        {
          error: "Active or graduated enrollments cannot be deleted.",
        },
        {
          status: 409,
        },
      );
    }

    //------------------------------------------------------
    // Delete child records
    // (Safe even if ON DELETE CASCADE exists)
    //------------------------------------------------------

    await supabase
      .from("academy_enrollment_payment_adjustments")
      .delete()
      .eq("enrollment_id", id);

    await supabase
      .from("academy_enrollment_payments")
      .delete()
      .eq("enrollment_id", id);

    await supabase
      .from("academy_enrollment_notes")
      .delete()
      .eq("enrollment_id", id);

    await supabase
      .from("academy_enrollment_timeline")
      .delete()
      .eq("enrollment_id", id);

    await supabase
      .from("academy_enrollment_courses")
      .delete()
      .eq("enrollment_id", id);

    //------------------------------------------------------
    // Delete enrollment
    //------------------------------------------------------

    const { error: deleteError } = await supabase
      .from("academy_enrollments")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    //------------------------------------------------------

    return NextResponse.json({
      success: true,
      message: "Enrollment deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message || "Unable to delete enrollment.",
      },
      {
        status: 500,
      },
    );
  }
}
