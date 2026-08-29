import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

//////////////////////////////////////////////////////////////
// PATCH
//////////////////////////////////////////////////////////////

export async function PATCH(req, { params }) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const body = await req.json();

    const supabase = createSupabaseAdmin();

    //-------------------------------------------------------
    // Ensure pricing exists
    //-------------------------------------------------------

    const { data: existing, error: existingError } = await supabase
      .from("academy_course_pricing")
      .select("*")
      .eq("id", id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json(
        {
          error: "Pricing record not found.",
        },
        {
          status: 404,
        },
      );
    }

    //-------------------------------------------------------
    // Build update payload
    //-------------------------------------------------------

    const updates = {};

    if (body.course_id !== undefined) updates.course_id = body.course_id;

    if (body.learning_mode !== undefined)
      updates.learning_mode = body.learning_mode;

    if (body.duration_months !== undefined)
      updates.duration_months = Number(body.duration_months);

    if (body.price !== undefined) updates.price = Number(body.price);

    if (body.currency !== undefined) updates.currency = body.currency;

    if (body.active !== undefined) updates.active = body.active;

    //-------------------------------------------------------
    // Duplicate check
    //-------------------------------------------------------

    const duplicateCourse = updates.course_id ?? existing.course_id;

    const duplicateMode = updates.learning_mode ?? existing.learning_mode;

    const duplicateDuration =
      updates.duration_months ?? existing.duration_months;

    const { data: duplicate } = await supabase
      .from("academy_course_pricing")
      .select("id")
      .eq("course_id", duplicateCourse)
      .eq("learning_mode", duplicateMode)
      .eq("duration_months", duplicateDuration)
      .neq("id", id)
      .maybeSingle();

    if (duplicate) {
      return NextResponse.json(
        {
          error:
            "Another pricing already exists with the same course, learning mode and duration.",
        },
        {
          status: 409,
        },
      );
    }

    //-------------------------------------------------------
    // Update
    //-------------------------------------------------------

    const { data, error } = await supabase
      .from("academy_course_pricing")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      pricing: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message || "Unable to update pricing.",
      },
      {
        status: 500,
      },
    );
  }
}

//////////////////////////////////////////////////////////////
// DELETE
//////////////////////////////////////////////////////////////

export async function DELETE(req, { params }) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const supabase = createSupabaseAdmin();

    //-------------------------------------------------------
    // Ensure record exists
    //-------------------------------------------------------

    const { data: pricing } = await supabase
      .from("academy_course_pricing")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (!pricing) {
      return NextResponse.json(
        {
          error: "Pricing record not found.",
        },
        {
          status: 404,
        },
      );
    }

    //-------------------------------------------------------
    // Prevent deletion if already used
    //-------------------------------------------------------

    const { count } = await supabase
      .from("academy_enrollment_courses")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("pricing_id", id);

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        {
          error:
            "This pricing has already been used by enrollments and cannot be deleted.",
        },
        {
          status: 409,
        },
      );
    }

    //-------------------------------------------------------
    // Delete
    //-------------------------------------------------------

    const { error } = await supabase
      .from("academy_course_pricing")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message || "Unable to delete pricing.",
      },
      {
        status: 500,
      },
    );
  }
}
