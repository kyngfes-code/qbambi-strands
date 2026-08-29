import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

//////////////////////////////////////////////////////////////
// ALLOWED SORT COLUMNS
//////////////////////////////////////////////////////////////

const ALLOWED_SORT_COLUMNS = [
  "created_at",
  "updated_at",
  "status",
  "payment_status",
  "first_name",
  "last_name",
  "enrollment_number",
  "preferred_start_date",
  "amount_paid",
  "balance_due",
  "total_course_fee",
  "total_payable",
  "initial_payment_amount",
];

//////////////////////////////////////////////////////////////
// GET
// List Academy Enrollments
//////////////////////////////////////////////////////////////

export async function GET(req) {
  try {
    //////////////////////////////////////////////////////////
    // AUTHENTICATION
    //////////////////////////////////////////////////////////

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        {
          error: "Forbidden",
        },
        {
          status: 403,
        },
      );
    }

    //////////////////////////////////////////////////////////
    // URL / QUERY PARAMETERS
    //////////////////////////////////////////////////////////

    const { searchParams } = new URL(req.url);

    //////////////////////////////////////////////////////////
    // PAGINATION
    //////////////////////////////////////////////////////////

    const rawPage = Number(searchParams.get("page") || 1);
    const rawPageSize = Number(searchParams.get("pageSize") || 20);

    const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

    const pageSize =
      Number.isInteger(rawPageSize) && rawPageSize > 0 && rawPageSize <= 100
        ? rawPageSize
        : 20;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    //////////////////////////////////////////////////////////
    // SEARCH
    //////////////////////////////////////////////////////////

    const search = (searchParams.get("search") || "").trim();

    //////////////////////////////////////////////////////////
    // FILTERS
    //////////////////////////////////////////////////////////

    const status = (searchParams.get("status") || "").trim();

    const learningMode = (searchParams.get("learningMode") || "").trim();

    const paymentPlan = (searchParams.get("paymentPlan") || "").trim();

    const dateFrom = (searchParams.get("dateFrom") || "").trim();

    const dateTo = (searchParams.get("dateTo") || "").trim();

    //////////////////////////////////////////////////////////
    // SORTING
    //////////////////////////////////////////////////////////

    const requestedSort = (searchParams.get("sortBy") || "created_at").trim();

    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const sortColumn = ALLOWED_SORT_COLUMNS.includes(requestedSort)
      ? requestedSort
      : "created_at";

    //////////////////////////////////////////////////////////
    // SUPABASE
    //////////////////////////////////////////////////////////

    const supabase = createSupabaseAdmin();

    //////////////////////////////////////////////////////////
    // BASE QUERY
    //////////////////////////////////////////////////////////
    //
    // We intentionally keep this query based directly on
    // academy_enrollments.
    //
    // The enrollment table already contains:
    //
    // - payment_plan_id
    // - total_course_fee
    // - amount_paid
    // - balance_due
    // - total_payable
    // - initial_payment_amount
    // - payment_status
    //
    //////////////////////////////////////////////////////////

    let query = supabase.from("academy_enrollments").select(
      `
          *,
          payment_plan:academy_payment_plans(
            id,
            name,
            description,
            number_of_payments,
            initial_payment_percentage,
            extra_percentage,
            payment_interval_months,
            is_active
          )
        `,
      {
        count: "exact",
      },
    );

    //////////////////////////////////////////////////////////
    // SEARCH
    //////////////////////////////////////////////////////////

    if (search) {
      const escapedSearch = search
        .replaceAll(",", "\\,")
        .replaceAll("%", "\\%");

      query = query.or(
        [
          `first_name.ilike.%${escapedSearch}%`,
          `last_name.ilike.%${escapedSearch}%`,
          `other_name.ilike.%${escapedSearch}%`,
          `email.ilike.%${escapedSearch}%`,
          `phone.ilike.%${escapedSearch}%`,
          `whatsapp.ilike.%${escapedSearch}%`,
          `enrollment_number.ilike.%${escapedSearch}%`,
          `city.ilike.%${escapedSearch}%`,
          `state.ilike.%${escapedSearch}%`,
        ].join(","),
      );
    }

    //////////////////////////////////////////////////////////
    // STATUS
    //////////////////////////////////////////////////////////

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    //////////////////////////////////////////////////////////
    // LEARNING MODE
    //////////////////////////////////////////////////////////

    if (learningMode && learningMode !== "all") {
      query = query.eq("learning_mode", learningMode);
    }

    //////////////////////////////////////////////////////////
    // PAYMENT PLAN
    //////////////////////////////////////////////////////////
    //
    // academy_enrollments.payment_plan_id references
    // academy_payment_plans.id.
    //
    //////////////////////////////////////////////////////////

    if (paymentPlan && paymentPlan !== "all") {
      query = query.eq("payment_plan_id", paymentPlan);
    }

    //////////////////////////////////////////////////////////
    // DATE FROM
    //////////////////////////////////////////////////////////

    if (dateFrom) {
      query = query.gte("created_at", `${dateFrom}T00:00:00.000Z`);
    }

    //////////////////////////////////////////////////////////
    // DATE TO
    //////////////////////////////////////////////////////////

    if (dateTo) {
      const nextDay = new Date(`${dateTo}T00:00:00.000Z`);

      nextDay.setUTCDate(nextDay.getUTCDate() + 1);

      query = query.lt("created_at", nextDay.toISOString());
    }

    //////////////////////////////////////////////////////////
    // CORRECT DATE TO
    //////////////////////////////////////////////////////////
    //
    // Replace the previous dateTo condition with an inclusive
    // end-of-day boundary.
    //
    //////////////////////////////////////////////////////////

    if (dateTo) {
      // Supabase cannot remove a previous filter easily,
      // so the date filtering is handled using an explicit
      // next-day boundary in the query construction above
      // only when dateTo is present.
    }

    //////////////////////////////////////////////////////////
    // SORT
    //////////////////////////////////////////////////////////

    query = query.order(sortColumn, {
      ascending: sortOrder === "asc",
    });

    //////////////////////////////////////////////////////////
    // PAGINATION
    //////////////////////////////////////////////////////////

    query = query.range(from, to);

    //////////////////////////////////////////////////////////
    // EXECUTE
    //////////////////////////////////////////////////////////

    const { data, error, count } = await query;

    if (error) {
      console.error("Academy enrollments Supabase error:", error);

      throw error;
    }

    //////////////////////////////////////////////////////////
    // NORMALIZE RESULTS
    //////////////////////////////////////////////////////////

    const enrollments = (data ?? []).map((enrollment) => {
      const plan = enrollment.payment_plan ?? null;

      return {
        ...enrollment,

        // Convenient UI value.
        payment_plan: plan?.name ?? null,

        // Keep the complete object available.
        payment_plan_details: plan,

        // Ensure numeric financial fields are numbers.
        total_course_fee: Number(enrollment.total_course_fee ?? 0),

        amount_paid: Number(enrollment.amount_paid ?? 0),

        balance_due: Number(enrollment.balance_due ?? 0),

        total_payable: Number(enrollment.total_payable ?? 0),

        initial_payment_amount: Number(enrollment.initial_payment_amount ?? 0),

        additional_fee_percentage: Number(
          enrollment.additional_fee_percentage ?? 0,
        ),

        initial_payment_percentage: Number(
          enrollment.initial_payment_percentage ?? 0,
        ),
      };
    });

    //////////////////////////////////////////////////////////
    // RESPONSE
    //////////////////////////////////////////////////////////

    return NextResponse.json({
      success: true,

      enrollments,

      pagination: {
        page,
        pageSize,
        total: count ?? 0,
        totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
      },
    });
  } catch (error) {
    console.error("Academy enrollments API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unable to fetch academy enrollments.",
      },
      {
        status: 500,
      },
    );
  }
}
