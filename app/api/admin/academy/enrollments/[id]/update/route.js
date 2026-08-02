import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

//////////////////////////////////////////////////////////////
// PATCH
// Update General Enrollment Information
//////////////////////////////////////////////////////////////

export async function PATCH(req, { params }) {
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

    const supabase = createSupabaseAdmin();

    //------------------------------------------------------
    // Verify Enrollment
    //------------------------------------------------------

    const { data: enrollment, error: enrollmentError } = await supabase
      .from("academy_enrollments")
      .select("id")
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
    // Allowed Fields
    //------------------------------------------------------

    const allowedFields = [
      // Student

      "first_name",
      "last_name",
      "middle_name",
      "email",
      "phone",
      "whatsapp",

      // Address

      "country",
      "state",
      "city",
      "street_address",
      "postal_code",

      // Personal

      "gender",
      "date_of_birth",
      "occupation",
      "education_level",

      // Emergency

      "emergency_contact_name",
      "emergency_contact_phone",
      "emergency_contact_relationship",

      // Training

      "preferred_start_date",
      "learning_mode",
      "payment_plan",
      "referral_source",

      // Misc

      "notes",
    ];

    //------------------------------------------------------
    // Build Update Object
    //------------------------------------------------------

    const updates = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (!Object.keys(updates).length) {
      return NextResponse.json(
        {
          error: "No valid fields supplied.",
        },
        {
          status: 400,
        },
      );
    }

    updates.updated_at = new Date().toISOString();

    //------------------------------------------------------
    // Update Enrollment
    //------------------------------------------------------

    const { data: updatedEnrollment, error: updateError } = await supabase
      .from("academy_enrollments")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    //------------------------------------------------------
    // Timeline
    //------------------------------------------------------

    await supabase.from("academy_enrollment_timeline").insert({
      enrollment_id: id,
      action: "enrollment_updated",
      description: "General enrollment information updated.",
      created_by: session.user.id,
    });

    //------------------------------------------------------

    return NextResponse.json({
      success: true,
      message: "Enrollment updated successfully.",
      enrollment: updatedEnrollment,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message || "Unable to update enrollment.",
      },
      {
        status: 500,
      },
    );
  }
}
