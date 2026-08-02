import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

//////////////////////////////////////////////////////////////
// POST
// Add Admin Note
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

    const { id: enrollmentId } = await params;

    const body = await req.json();

    const { note } = body;

    if (!note?.trim()) {
      return NextResponse.json(
        {
          error: "Note is required.",
        },
        {
          status: 400,
        },
      );
    }

    const supabase = createSupabaseAdmin();

    //------------------------------------------------------
    // Verify Enrollment Exists
    //------------------------------------------------------

    const { data: enrollment, error: enrollmentError } = await supabase
      .from("academy_enrollments")
      .select("id")
      .eq("id", enrollmentId)
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
    // Create Note
    //------------------------------------------------------

    const { data: createdNote, error: noteError } = await supabase
      .from("academy_enrollment_notes")
      .insert({
        enrollment_id: enrollmentId,
        note: note.trim(),
        created_by: session.user.id,
      })
      .select(
        `
          *,
          admin:users(
            id,
            first_name,
            last_name
          )
        `,
      )
      .single();

    if (noteError) throw noteError;

    //------------------------------------------------------
    // Timeline
    //------------------------------------------------------

    await supabase.from("academy_enrollment_timeline").insert({
      enrollment_id: enrollmentId,
      action: "admin_note_added",
      description: "Administrator added a note.",
      created_by: session.user.id,
    });

    //------------------------------------------------------

    return NextResponse.json({
      success: true,
      message: "Note added successfully.",
      note: createdNote,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message || "Unable to add note.",
      },
      {
        status: 500,
      },
    );
  }
}
