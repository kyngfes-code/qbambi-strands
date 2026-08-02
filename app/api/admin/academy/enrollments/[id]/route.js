import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

//////////////////////////////////////////////////////////////
// GET
// Fetch a single enrollment
//////////////////////////////////////////////////////////////

export async function GET(request, { params }) {
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

    const supabase = createSupabaseAdmin();

    //------------------------------------------------------
    // Enrollment
    //------------------------------------------------------

    const { data: enrollment, error } = await supabase
      .from("academy_enrollments")
      .select(
        `
        *,
        courses:academy_enrollment_courses(
          *,
          course:academy_courses(
            id,
            title,
            slug,
            level
          ),
          pricing:academy_course_pricing(
            id,
            learning_mode,
            duration_months,
            price,
            currency
          )
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    //------------------------------------------------------
    // Pricing options
    //------------------------------------------------------

    const { data: pricingOptions } = await supabase
      .from("academy_course_pricing")
      .select(
        `
        *,
        course:academy_courses(
          id,
          title,
          active
        )
      `,
      )
      .eq("active", true)
      .order("price", { ascending: true });

    //------------------------------------------------------
    // Payment History
    //------------------------------------------------------

    const { data: paymentHistory } = await supabase
      .from("academy_enrollment_payments")
      .select("*")
      .eq("enrollment_id", id)
      .order("payment_date", {
        ascending: false,
      });

    //------------------------------------------------------
    // Admin Notes
    //------------------------------------------------------

    const { data: adminNotes } = await supabase
      .from("academy_enrollment_notes")
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
      .eq("enrollment_id", id)
      .order("created_at", {
        ascending: false,
      });

    //------------------------------------------------------
    // Timeline
    //------------------------------------------------------

    const { data: timeline } = await supabase
      .from("academy_enrollment_timeline")
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
      .eq("enrollment_id", id)
      .order("created_at", {
        ascending: false,
      });

    //------------------------------------------------------

    return NextResponse.json({
      enrollment: {
        ...enrollment,
        payment_history: paymentHistory ?? [],
        admin_notes: adminNotes ?? [],
        timeline: timeline ?? [],
      },

      pricingOptions: pricingOptions ?? [],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Enrollment not found.",
      },
      {
        status: 404,
      },
    );
  }
}
