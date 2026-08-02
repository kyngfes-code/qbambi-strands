import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

import parseAdminFilters from "@/lib/admin/parseAdminFilters";
import buildPaginationQuery, {
  buildPaginationMeta,
} from "@/lib/admin/buildPaginationQuery";

//////////////////////////////////////////////////////////////
// GET
//////////////////////////////////////////////////////////////

export async function GET(req) {
  try {
    const session = await auth();

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const filters = parseAdminFilters(req.nextUrl.searchParams);

    const supabase = createSupabaseAdmin();

    //----------------------------------------------------
    // Base Query
    //----------------------------------------------------

    let query = supabase.from("academy_course_pricing").select(
      `
        *,
        course:academy_courses(
          id,
          title,
          slug,
          level,
          active,
          sort_order
        )
      `,
      {
        count: "exact",
      },
    );

    //----------------------------------------------------
    // Status Filter
    //----------------------------------------------------

    if (filters.status === "active") {
      query = query.eq("active", true);
    }

    if (filters.status === "inactive") {
      query = query.eq("active", false);
    }

    //----------------------------------------------------
    // Learning Mode
    //----------------------------------------------------

    if (filters.learningMode && filters.learningMode !== "all") {
      query = query.eq("learning_mode", filters.learningMode);
    }

    //----------------------------------------------------
    // Course Filter
    //----------------------------------------------------

    if (filters.courseId) {
      query = query.eq("course_id", filters.courseId);
    }

    //----------------------------------------------------
    // Search
    //
    // Supabase cannot search joined table columns directly
    // with ilike, so we filter after fetch if necessary.
    //----------------------------------------------------

    //----------------------------------------------------
    // Sorting
    //----------------------------------------------------

    const sortableColumns = [
      "price",
      "duration_months",
      "learning_mode",
      "created_at",
      "active",
    ];

    if (sortableColumns.includes(filters.sortBy)) {
      query = query.order(filters.sortBy, {
        ascending: filters.sortOrder === "asc",
      });
    } else {
      query = query
        .order("sort_order", {
          foreignTable: "academy_courses",
          ascending: true,
        })
        .order("duration_months", {
          ascending: true,
        });
    }

    //----------------------------------------------------
    // Pagination
    //----------------------------------------------------

    const paginatedQuery = buildPaginationQuery(
      query,
      filters.page,
      filters.pageSize,
    );

    const { data, error, count } = await paginatedQuery;

    if (error) throw error;

    //----------------------------------------------------
    // Client-side search on joined course fields
    //----------------------------------------------------

    let pricing = data ?? [];

    if (filters.search) {
      const keyword = filters.search.toLowerCase();

      pricing = pricing.filter((item) => {
        const course = item.course ?? {};

        return (
          course.title?.toLowerCase().includes(keyword) ||
          course.slug?.toLowerCase().includes(keyword) ||
          course.level?.toLowerCase().includes(keyword)
        );
      });
    }

    return NextResponse.json({
      pricing,

      pagination: buildPaginationMeta({
        page: filters.page,
        pageSize: filters.pageSize,
        total: count ?? 0,
      }),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message || "Unable to load pricing.",
      },
      {
        status: 500,
      },
    );
  }
}

//////////////////////////////////////////////////////////////
// POST
//////////////////////////////////////////////////////////////

export async function POST(req) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const {
      course_id,
      learning_mode,
      duration_months,
      price,
      currency,
      active,
    } = body;

    if (!course_id) {
      return NextResponse.json(
        { error: "Course is required." },
        { status: 400 },
      );
    }

    if (!learning_mode) {
      return NextResponse.json(
        {
          error: "Learning mode is required.",
        },
        { status: 400 },
      );
    }

    if (!duration_months) {
      return NextResponse.json(
        {
          error: "Duration is required.",
        },
        { status: 400 },
      );
    }

    if (price === undefined || price === null) {
      return NextResponse.json(
        { error: "Price is required." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    //----------------------------------------------------
    // Duplicate Check
    //----------------------------------------------------

    const { data: existing } = await supabase
      .from("academy_course_pricing")
      .select("id")
      .eq("course_id", course_id)
      .eq("learning_mode", learning_mode)
      .eq("duration_months", Number(duration_months))
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          error:
            "Pricing already exists for this course, learning mode and duration.",
        },
        {
          status: 409,
        },
      );
    }

    //----------------------------------------------------
    // Insert
    //----------------------------------------------------

    const { data, error } = await supabase
      .from("academy_course_pricing")
      .insert({
        course_id,
        learning_mode,
        duration_months: Number(duration_months),
        price: Number(price),
        currency: currency || "NGN",
        active: active ?? true,
      })
      .select(
        `
        *,
        course:academy_courses(
          id,
          title,
          slug,
          level,
          active
        )
      `,
      )
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
        error: error.message || "Unable to create pricing.",
      },
      {
        status: 500,
      },
    );
  }
}
