import { NextResponse } from "next/server";

import { createSupabaseAdmin } from "@/lib/supabase-admin";
import academyEnrollmentSchema from "@/lib/validations/academyEnrollmentSchema";

export async function POST(req) {
  try {
    /*
    ============================================================
    1. REQUEST BODY
    ============================================================
    */

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

    /*
    ============================================================
    2. VALIDATE REQUEST
    ============================================================
    */

    const result = academyEnrollmentSchema.safeParse(body);

    if (!result.success) {
      console.error(
        "ACADEMY ENROLLMENT VALIDATION ERROR",
        result.error.flatten(),
      );

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

    /*
    ============================================================
    3. BASIC COURSE VALIDATION
    ============================================================
    */

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

    /*
    ============================================================
    4. PAYMENT PLAN
    ============================================================
    */

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

    /*
    ============================================================
    5. SUPABASE ADMIN CLIENT
    ============================================================
    */

    const supabase = createSupabaseAdmin();

    /*
    ============================================================
    6. NORMALIZE EMAIL
    ============================================================
    */

    const normalizedEmail = data.email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json(
        {
          error: "A valid student email address is required.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    ============================================================
    7. RESOLVE OR CREATE WEBSITE USER
    ============================================================

    IMPORTANT BUSINESS RULE:

    public.users
      = website/login identity

    academy_enrollments
      = academy enrollment/application

    A student does NOT need:
      - an existing session
      - an existing academy account
      - an existing academy enrollment

    We ONLY use the submitted email to resolve the account.

    If the email already exists in public.users:
      -> reuse that user's id.

    If it does not exist:
      -> create the public.users row.

    Having a public.users row does NOT mean the student is
    already enrolled in the academy.
    ============================================================
    */

    let userId = null;
    let existingUser = null;

    /*
    ============================================================
    8. LOOK FOR EXISTING USER
    ============================================================
    */

    const { data: foundUser, error: userLookupError } = await supabase
      .from("users")
      .select(
        `
          id,
          name,
          email,
          first_name,
          middle_name,
          last_name,
          phone,
          role,
          account_status
        `,
      )
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (userLookupError) {
      console.error("ACADEMY ENROLLMENT USER LOOKUP ERROR", userLookupError);

      return NextResponse.json(
        {
          error: "Unable to verify your email address. Please try again.",
        },
        {
          status: 500,
        },
      );
    }

    /*
    ============================================================
    9. EXISTING WEBSITE USER
    ============================================================
    */

    if (foundUser?.id) {
      existingUser = foundUser;
      userId = foundUser.id;

      console.log("ACADEMY ENROLLMENT EXISTING USER RESOLVED", {
        userId,
        email: foundUser.email,
        accountStatus: foundUser.account_status,
      });
    }

    /*
    ============================================================
    10. CREATE USER IF ONE DOES NOT EXIST
    ============================================================

    We create the website account using the enrollment details.

    No password is generated here.

    password_hash remains NULL.

    The account can be completed/activated through the normal
    account onboarding/authentication flow later.
    ============================================================
    */

    if (!userId) {
      const fullName = [data.first_name, data.other_name, data.last_name]
        .filter(Boolean)
        .map((value) => value.trim())
        .filter(Boolean)
        .join(" ");

      const { data: newUser, error: createUserError } = await supabase
        .from("users")
        .insert({
          name: fullName || null,

          email: normalizedEmail,

          first_name: data.first_name?.trim() || null,

          middle_name: data.other_name?.trim() || null,

          last_name: data.last_name?.trim() || null,

          phone: data.phone?.trim() || null,

          role: "user",

          is_admin: false,

          email_verified: false,

          account_status: "active",

          onboarding_completed: false,
        })
        .select(
          `
            id,
            name,
            email,
            first_name,
            middle_name,
            last_name,
            phone,
            role,
            account_status
          `,
        )
        .single();

      /*
      ==========================================================
      11. HANDLE USER CREATION ERROR
      ==========================================================
      */

      if (createUserError) {
        console.error(
          "ACADEMY ENROLLMENT USER CREATION ERROR",
          createUserError,
        );

        /*
        --------------------------------------------------------
        Race condition protection.

        Because users.email is UNIQUE, another request could
        create the same email between our SELECT and INSERT.

        If that happens, retrieve the existing account and
        continue normally.
        --------------------------------------------------------
        */

        if (createUserError.code === "23505") {
          const { data: racedUser, error: racedUserLookupError } =
            await supabase
              .from("users")
              .select(
                `
                id,
                name,
                email,
                first_name,
                middle_name,
                last_name,
                phone,
                role,
                account_status
              `,
              )
              .eq("email", normalizedEmail)
              .maybeSingle();

          if (racedUserLookupError || !racedUser?.id) {
            console.error(
              "ACADEMY ENROLLMENT RACE CONDITION LOOKUP ERROR",
              racedUserLookupError,
            );

            return NextResponse.json(
              {
                error:
                  "Unable to create or locate your account. Please try again.",
              },
              {
                status: 500,
              },
            );
          }

          existingUser = racedUser;
          userId = racedUser.id;

          console.log("ACADEMY ENROLLMENT USER RESOLVED AFTER RACE", {
            userId,
            email: racedUser.email,
          });
        } else {
          return NextResponse.json(
            {
              error: "Unable to create your student account. Please try again.",
            },
            {
              status: 500,
            },
          );
        }
      } else {
        /*
        --------------------------------------------------------
        Successfully created a new public.users account.
        --------------------------------------------------------
        */

        userId = newUser.id;
      }
    }

    /*
    ============================================================
    12. FINAL USER SAFETY CHECK
    ============================================================
    */

    if (!userId) {
      console.error("ACADEMY ENROLLMENT FAILED TO RESOLVE USER", {
        email: normalizedEmail,
      });

      return NextResponse.json(
        {
          error: "Unable to establish your account. Please try again.",
        },
        {
          status: 500,
        },
      );
    }

    /*
    ============================================================
    13. CALL ATOMIC ACADEMY ENROLLMENT RPC
    ============================================================

    The RPC is now responsible for the academy transaction:

      - duplicate academy enrollment prevention
      - payment plan validation
      - course validation
      - pricing validation
      - academy_enrollments
      - academy_enrollment_courses
      - academy_student_payment_plans
      - academy_student_payment_schedule
      - financial calculations

    The RPC receives the REAL public.users.id.
    ============================================================
    */

    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "create_academy_enrollment",
      {
        p_user_id: userId,

        p_first_name: data.first_name,
        p_last_name: data.last_name,
        p_other_name: data.other_name ?? null,

        p_gender: data.gender,
        p_date_of_birth: data.date_of_birth,

        p_email: normalizedEmail,
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

        p_courses: data.courses.map((course) => ({
          course_id: course.course_id,
          pricing_id: course.pricing_id,
          duration_months: course.duration_months,
        })),
      },
    );

    /*
    ============================================================
    14. RPC ERROR
    ============================================================
    */

    if (rpcError) {
      console.error("ACADEMY ENROLLMENT RPC ERROR", {
        code: rpcError.code,
        message: rpcError.message,
        details: rpcError.details,
        hint: rpcError.hint,
      });

      const message = rpcError.message ?? "";

      const lowerMessage = message.toLowerCase();

      /*
      ----------------------------------------------------------
      DUPLICATE ACADEMY ENROLLMENT
      ----------------------------------------------------------
      */

      if (
        lowerMessage.includes("already have an existing academy enrollment")
      ) {
        return NextResponse.json(
          {
            error: "You already have an existing academy enrollment.",
          },
          {
            status: 409,
          },
        );
      }

      /*
      ----------------------------------------------------------
      PAYMENT PLAN
      ----------------------------------------------------------
      */

      if (lowerMessage.includes("payment plan")) {
        return NextResponse.json(
          {
            error: "The selected payment plan is invalid or inactive.",
          },
          {
            status: 400,
          },
        );
      }

      /*
      ----------------------------------------------------------
      COURSE / PRICING
      ----------------------------------------------------------
      */

      if (lowerMessage.includes("course") || lowerMessage.includes("pricing")) {
        return NextResponse.json(
          {
            error: "One or more selected course options are invalid.",
          },
          {
            status: 400,
          },
        );
      }

      /*
      ----------------------------------------------------------
      USER ACCOUNT
      ----------------------------------------------------------
      */

      if (
        lowerMessage.includes("user id") ||
        lowerMessage.includes("student account") ||
        lowerMessage.includes("users")
      ) {
        return NextResponse.json(
          {
            error:
              "Unable to associate your account with the academy enrollment.",
          },
          {
            status: 400,
          },
        );
      }

      /*
      ----------------------------------------------------------
      GENERIC RPC ERROR
      ----------------------------------------------------------
      */

      return NextResponse.json(
        {
          error: "Unable to process your enrollment. Please try again.",
        },
        {
          status: 500,
        },
      );
    }

    /*
    ============================================================
    15. VALIDATE RPC RESULT
    ============================================================
    */

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

    /*
    ============================================================
    16. SUCCESS
    ============================================================
    */

    return NextResponse.json(
      {
        success: true,

        enrollmentId: rpcResult.enrollmentId,

        enrollmentNumber: rpcResult.enrollmentNumber,

        currency: rpcResult.currency,

        paymentPlan: rpcResult.paymentPlan,

        paymentSchedule: rpcResult.paymentSchedule,

        /*
        --------------------------------------------------------
        Account information
        --------------------------------------------------------
        */

        accountLinked: true,

        accountCreated: !existingUser,

        userId,

        /*
        --------------------------------------------------------
        IMPORTANT:

        This does NOT mean the academy enrollment is activated.

        The RPC creates the academy enrollment with status
        "pending".
        --------------------------------------------------------
        */

        status: "pending",
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
