import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

import buildPaginationQuery from "@/lib/admin/buildPaginationQuery";
import parseAdminFilters from "@/lib/admin/parseAdminFilters";

//////////////////////////////////////////////////////////////
// Allowed Sorting
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
];

//////////////////////////////////////////////////////////////
// GET
// List Academy Enrollments
//////////////////////////////////////////////////////////////

export async function GET(req) {
  try {
    //////////////////////////////////////////////////////////
    // Authentication
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
    // Parse Filters
    //////////////////////////////////////////////////////////

    const { searchParams } = new URL(req.url);

    const filters = parseAdminFilters(searchParams);

    const { page, pageSize, search, status, learningMode, sortBy, sortOrder } =
      filters;

    //////////////////////////////////////////////////////////
    // Supabase
    //////////////////////////////////////////////////////////

    const supabase = createSupabaseAdmin();

    //////////////////////////////////////////////////////////
    // Base Query
    //////////////////////////////////////////////////////////

    let query = supabase.from("academy_enrollments").select(
      `
        *,
        enrollment_courses:academy_enrollment_courses(
          id,
          course_price,
          duration_months,
          course:academy_courses(
            id,
            title,
            level
          )
        )
      `,
      {
        count: "exact",
      },
    );

    //////////////////////////////////////////////////////////
    // Search
    //////////////////////////////////////////////////////////

    if (search) {
      query = query.or(
        [
          `first_name.ilike.%${search}%`,
          `last_name.ilike.%${search}%`,
          `email.ilike.%${search}%`,
          `phone.ilike.%${search}%`,
          `enrollment_number.ilike.%${search}%`,
        ].join(","),
      );
    }

    //////////////////////////////////////////////////////////
    // Status Filter
    //////////////////////////////////////////////////////////

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    //////////////////////////////////////////////////////////
    // Learning Mode Filter
    //////////////////////////////////////////////////////////

    if (learningMode && learningMode !== "all") {
      query = query.eq("learning_mode", learningMode);
    }

    //////////////////////////////////////////////////////////
    // Sorting
    //////////////////////////////////////////////////////////

    const sortColumn = ALLOWED_SORT_COLUMNS.includes(sortBy)
      ? sortBy
      : "created_at";

    query = query.order(sortColumn, {
      ascending: sortOrder === "asc",
    });

    //////////////////////////////////////////////////////////
    // Pagination
    //////////////////////////////////////////////////////////

    query = buildPaginationQuery(query, page, pageSize);

    //////////////////////////////////////////////////////////
    // Execute
    //////////////////////////////////////////////////////////

    const { data, error, count } = await query;

    if (error) throw error;

    //////////////////////////////////////////////////////////
    // Response
    //////////////////////////////////////////////////////////

    return NextResponse.json({
      enrollments: data ?? [],

      pagination: {
        page,
        pageSize,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      },
    });
  } catch (error) {
    console.error("Academy enrollments error:", error);

    return NextResponse.json(
      {
        error: error.message || "Unable to fetch academy enrollments.",
      },
      {
        status: 500,
      },
    );
  }
}
