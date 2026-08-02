import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

//////////////////////////////////////////////////////////////
// POST
// Approve Academy Enrollment
//////////////////////////////////////////////////////////////

export async function POST(req, { params }) {
  try {
    //------------------------------------------------------
    // Auth
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

    const { admin_note } = await req.json();

    const supabase = createSupabaseAdmin();

    //------------------------------------------------------
    // Verify enrollment exists
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
    // Already approved?
    //------------------------------------------------------

    if (enrollment.status === "approved") {
      return NextResponse.json(
        {
          error: "Enrollment has already been approved.",
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
        status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

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
      action: "approved",
      description: "Enrollment approved.",
      created_by: session.user.id,
    });

    //------------------------------------------------------

    return NextResponse.json({
      success: true,
      message: "Enrollment approved successfully.",
      enrollment: updatedEnrollment,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message || "Unable to approve enrollment.",
      },
      {
        status: 500,
      },
    );
  }
}
