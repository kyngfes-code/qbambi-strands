"use server";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import academyEnrollmentSchema from "@/lib/validations/academyEnrollmentSchema";

export async function POST(req) {
  try {
    ////////////////////////////////////////////////////////
    // AUTHENTICATION
    ////////////////////////////////////////////////////////

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const userId = session.user.id;

    ////////////////////////////////////////////////////////
    // REQUEST BODY
    ////////////////////////////////////////////////////////

    let body;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid request body.",
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////
    // VALIDATE REQUEST
    ////////////////////////////////////////////////////////

    const result = academyEnrollmentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid enrollment information.",
          issues: result.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    const data = result.data;

    ////////////////////////////////////////////////////////
    // COURSES
    ////////////////////////////////////////////////////////

    if (!Array.isArray(data.courses) || data.courses.length === 0) {
      return NextResponse.json(
        {
          error: "Please select at least one course.",
        },
        {
          status: 400,
        },
      );
    }

    if (data.courses.length > 5) {
      return NextResponse.json(
        {
          error: "Too many courses selected.",
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////
    // PAYMENT PLAN
    ////////////////////////////////////////////////////////

    if (!data.payment_plan_id) {
      return NextResponse.json(
        {
          error: "Please select a payment plan.",
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////
    // SUPABASE ADMIN CLIENT
    //
    // The RPC is restricted to service_role.
    ////////////////////////////////////////////////////////

    const supabase = createSupabaseAdmin();

    ////////////////////////////////////////////////////////
    // CALL ATOMIC DATABASE FUNCTION
    ////////////////////////////////////////////////////////

    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "create_academy_enrollment",
      {
        p_user_id: userId,

        p_first_name: data.first_name,
        p_last_name: data.last_name,
        p_other_name: data.other_name ?? null,

        p_gender: data.gender,
        p_date_of_birth: data.date_of_birth,

        p_email: data.email,
        p_phone: data.phone,
        p_whatsapp: data.whatsapp ?? null,

        p_country: data.country,
        p_state: data.state,
        p_city: data.city ?? null,
        p_street_address: data.street_address ?? null,
        p_postal_code: data.postal_code ?? null,

        p_preferred_start_date: data.preferred_start_date,
        p_learning_mode: data.learning_mode,

        p_payment_plan_id: data.payment_plan_id,

        p_emergency_contact_name: data.emergency_contact_name,
        p_emergency_contact_phone: data.emergency_contact_phone,
        p_emergency_contact_relationship: data.emergency_contact_relationship,

        p_occupation: data.occupation ?? null,
        p_education_level: data.education_level ?? null,
        p_referral_source: data.referral_source ?? null,
        p_notes: data.notes ?? null,

        /*
         * Only send the identifiers needed by the RPC.
         *
         * The RPC obtains:
         * - course_id
         * - duration
         * - price
         * - currency
         * - learning mode
         *
         * directly from the database.
         */
        p_courses: data.courses.map((course) => ({
          course_id: course.course_id,
          pricing_id: course.pricing_id,
          duration_months: course.duration_months,
        })),
      },
    );

    ////////////////////////////////////////////////////////
    // RPC ERROR
    ////////////////////////////////////////////////////////

    if (rpcError) {
      console.error("ACADEMY ENROLLMENT RPC ERROR", {
        code: rpcError.code,
        message: rpcError.message,
        details: rpcError.details,
        hint: rpcError.hint,
      });

      /*
       * PostgreSQL exceptions raised by the RPC arrive here.
       * Do not expose raw database errors to the customer.
       */

      const message = rpcError.message ?? "";

      if (message.includes("already have an existing academy enrollment")) {
        return NextResponse.json(
          {
            error: "You already have an existing academy enrollment.",
          },
          {
            status: 409,
          },
        );
      }

      if (
        message.includes("payment plan") ||
        message.includes("Payment plan")
      ) {
        return NextResponse.json(
          {
            error: "The selected payment plan is invalid or inactive.",
          },
          {
            status: 400,
          },
        );
      }

      if (
        message.includes("course") ||
        message.includes("pricing") ||
        message.includes("Pricing")
      ) {
        return NextResponse.json(
          {
            error: "One or more selected course options are invalid.",
          },
          {
            status: 400,
          },
        );
      }

      return NextResponse.json(
        {
          error: "Unable to process your enrollment. Please try again.",
        },
        {
          status: 500,
        },
      );
    }

    ////////////////////////////////////////////////////////
    // RPC SUCCESS
    ////////////////////////////////////////////////////////

    if (!rpcResult?.success) {
      console.error(
        "ACADEMY ENROLLMENT RPC RETURNED INVALID RESULT",
        rpcResult,
      );

      return NextResponse.json(
        {
          error: "Unable to complete your enrollment. Please try again.",
        },
        {
          status: 500,
        },
      );
    }

    ////////////////////////////////////////////////////////
    // SUCCESS
    ////////////////////////////////////////////////////////

    return NextResponse.json(
      {
        success: true,

        enrollmentId: rpcResult.enrollmentId,

        enrollmentNumber: rpcResult.enrollmentNumber,

        currency: rpcResult.currency,

        paymentPlan: rpcResult.paymentPlan,

        paymentSchedule: rpcResult.paymentSchedule,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("ACADEMY ENROLLMENT ROUTE ERROR", error);

    return NextResponse.json(
      {
        error: "Unable to submit your enrollment. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}
