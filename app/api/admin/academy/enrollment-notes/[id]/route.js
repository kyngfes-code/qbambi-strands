import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

//////////////////////////////////////////////////////////////
// Helpers
//////////////////////////////////////////////////////////////

async function authorize() {
  const session = await auth();

  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (session.user.role !== "admin") {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    session,
    supabase: createSupabaseAdmin(),
  };
}

//////////////////////////////////////////////////////////////
// PATCH
// Edit Admin Note
//////////////////////////////////////////////////////////////

export async function PATCH(req, { params }) {
  const authResult = await authorize();

  if (authResult.error) return authResult.error;

  const { session, supabase } = authResult;

  const { noteId } = await params;

  try {
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

    //------------------------------------------------------
    // Verify note exists
    //------------------------------------------------------

    const { data: existing, error: existingError } = await supabase
      .from("academy_enrollment_notes")
      .select("id,enrollment_id")
      .eq("id", noteId)
      .single();

    if (existingError || !existing) {
      return NextResponse.json(
        {
          error: "Note not found.",
        },
        {
          status: 404,
        },
      );
    }

    //------------------------------------------------------
    // Update note
    //------------------------------------------------------

    const { data, error } = await supabase
      .from("academy_enrollment_notes")
      .update({
        note: note.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", noteId)
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

    if (error) throw error;

    //------------------------------------------------------
    // Timeline
    //------------------------------------------------------

    await supabase.from("academy_enrollment_timeline").insert({
      enrollment_id: existing.enrollment_id,
      action: "admin_note_updated",
      description: "Administrator updated a note.",
      created_by: session.user.id,
    });

    //------------------------------------------------------

    return NextResponse.json({
      success: true,
      message: "Note updated successfully.",
      note: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message || "Unable to update note.",
      },
      {
        status: 500,
      },
    );
  }
}

//////////////////////////////////////////////////////////////
// DELETE
// Delete Admin Note
//////////////////////////////////////////////////////////////

export async function DELETE(req, { params }) {
  const authResult = await authorize();

  if (authResult.error) return authResult.error;

  const { session, supabase } = authResult;

  const { noteId } = await params;

  try {
    //------------------------------------------------------
    // Verify note exists
    //------------------------------------------------------

    const { data: existing, error: existingError } = await supabase
      .from("academy_enrollment_notes")
      .select("id,enrollment_id")
      .eq("id", noteId)
      .single();

    if (existingError || !existing) {
      return NextResponse.json(
        {
          error: "Note not found.",
        },
        {
          status: 404,
        },
      );
    }

    //------------------------------------------------------
    // Delete note
    //------------------------------------------------------

    const { error } = await supabase
      .from("academy_enrollment_notes")
      .delete()
      .eq("id", noteId);

    if (error) throw error;

    //------------------------------------------------------
    // Timeline
    //------------------------------------------------------

    await supabase.from("academy_enrollment_timeline").insert({
      enrollment_id: existing.enrollment_id,
      action: "admin_note_deleted",
      description: "Administrator deleted a note.",
      created_by: session.user.id,
    });

    //------------------------------------------------------

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message || "Unable to delete note.",
      },
      {
        status: 500,
      },
    );
  }
}
