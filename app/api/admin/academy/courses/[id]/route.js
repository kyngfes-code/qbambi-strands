import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import slugify from "slugify";

async function verifyAdmin() {
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
  };
}

/* -------------------------------------------------------------------------- */
/* PATCH */
/* -------------------------------------------------------------------------- */

export async function PATCH(req, { params }) {
  try {
    const { error } = await verifyAdmin();

    if (error) return error;

    const { id } = await params;

    const body = await req.json();

    const { title, description, category, level, active, sort_order } = body;

    const supabase = createSupabaseAdmin();

    //-----------------------------------
    // Existing course
    //-----------------------------------

    const { data: existingCourse, error: fetchError } = await supabase
      .from("academy_courses")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingCourse) {
      return NextResponse.json(
        {
          error: "Course not found.",
        },
        {
          status: 404,
        },
      );
    }

    //-----------------------------------
    // Generate new slug if title changed
    //-----------------------------------

    let slug = existingCourse.slug;

    if (title && title !== existingCourse.title) {
      slug = slugify(title, {
        lower: true,
        strict: true,
        trim: true,
      });

      const { data: duplicate } = await supabase
        .from("academy_courses")
        .select("id")
        .eq("slug", slug)
        .neq("id", id)
        .maybeSingle();

      if (duplicate) {
        return NextResponse.json(
          {
            error: "Another course already uses this title.",
          },
          {
            status: 409,
          },
        );
      }
    }

    //-----------------------------------
    // Update
    //-----------------------------------

    const { data, error: updateError } = await supabase
      .from("academy_courses")
      .update({
        title,
        slug,
        description,
        category,
        level,
        active,
        sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      message: "Course updated successfully.",
      course: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to update academy course.",
      },
      {
        status: 500,
      },
    );
  }
}

/* -------------------------------------------------------------------------- */
/* DELETE */
/* -------------------------------------------------------------------------- */

export async function DELETE(req, { params }) {
  try {
    const { error } = await verifyAdmin();

    if (error) return error;

    const { id } = await params;

    const supabase = createSupabaseAdmin();

    //-----------------------------------
    // Ensure course exists
    //-----------------------------------

    const { data: course } = await supabase
      .from("academy_courses")
      .select("id,title")
      .eq("id", id)
      .maybeSingle();

    if (!course) {
      return NextResponse.json(
        {
          error: "Course not found.",
        },
        {
          status: 404,
        },
      );
    }

    //-----------------------------------
    // Delete
    //-----------------------------------

    const { error: deleteError } = await supabase
      .from("academy_courses")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      message: "Course deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to delete academy course.",
      },
      {
        status: 500,
      },
    );
  }
}
