import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

//////////////////////////////////////////////////////////////
// POST
// Reject Academy Enrollment
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

    const { id } = await params;

    const body = await req.json();

    const { rejection_reason, admin_note } = body;

    if (!rejection_reason?.trim()) {
      return NextResponse.json(
        {
          error: "Rejection reason is required.",
        },
        {
          status: 400,
        },
      );
    }

    const supabase = createSupabaseAdmin();

    //------------------------------------------------------
    // Verify enrollment
    //------------------------------------------------------

    const { data: enrollment, error: enrollmentError } = await supabase
      .from("academy_enrollments")
      .select("id,status")
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
    // Prevent duplicate rejection
    //------------------------------------------------------

    if (enrollment.status === "rejected") {
      return NextResponse.json(
        {
          error: "Enrollment has already been rejected.",
        },
        {
          status: 409,
        },
      );
    }

    //------------------------------------------------------
    // Update enrollment
    //------------------------------------------------------

    const { data: updatedEnrollment, error: updateError } = await supabase
      .from("academy_enrollments")
      .update({
        status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    //------------------------------------------------------
    // Save rejection note
    //------------------------------------------------------

    await supabase.from("academy_enrollment_notes").insert({
      enrollment_id: id,
      note: `Enrollment rejected.\n\nReason:\n${rejection_reason.trim()}`,
      created_by: session.user.id,
    });

    //------------------------------------------------------
    // Optional admin note
    //------------------------------------------------------

    if (admin_note?.trim()) {
      await supabase.from("academy_enrollment_notes").insert({
        enrollment_id: id,
        note: admin_note.trim(),
        created_by: session.user.id,
      });
    }

    //------------------------------------------------------
    // Timeline
    //------------------------------------------------------

    await supabase.from("academy_enrollment_timeline").insert({
      enrollment_id: id,
      action: "rejected",
      description: rejection_reason.trim(),
      created_by: session.user.id,
    });

    //------------------------------------------------------

    return NextResponse.json({
      success: true,
      message: "Enrollment rejected successfully.",
      enrollment: updatedEnrollment,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message || "Unable to reject enrollment.",
      },
      {
        status: 500,
      },
    );
  }
}
