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

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
            status,
            sort_order
          )
        `,
      {
        count: "exact",
      },
    );

    //----------------------------------------------------
    // Pricing Status Filter
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

    if (error) {
      throw error;
    }

    //----------------------------------------------------
    // Client-side Course Search
    //----------------------------------------------------

    let pricing = data ?? [];

    if (filters.search) {
      const keyword = filters.search.toLowerCase();

      pricing = pricing.filter((item) => {
        const course = item.course ?? {};

        return (
          course.title?.toLowerCase().includes(keyword) ||
          course.slug?.toLowerCase().includes(keyword)
        );
      });
    }

    //----------------------------------------------------
    // Response
    //----------------------------------------------------

    return NextResponse.json({
      pricing,

      pagination: buildPaginationMeta({
        page: filters.page,
        pageSize: filters.pageSize,
        total: count ?? 0,
      }),
    });
  } catch (error) {
    console.error("GET course pricing error:", error);

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

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    //----------------------------------------------------
    // Validation
    //----------------------------------------------------

    if (!course_id) {
      return NextResponse.json(
        {
          error: "Course is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!learning_mode) {
      return NextResponse.json(
        {
          error: "Learning mode is required.",
        },
        {
          status: 400,
        },
      );
    }

    const parsedDuration = Number(duration_months);

    if (!Number.isInteger(parsedDuration) || parsedDuration <= 0) {
      return NextResponse.json(
        {
          error: "Duration must be a positive whole number.",
        },
        {
          status: 400,
        },
      );
    }

    const parsedPrice = Number(price);

    if (
      price === undefined ||
      price === null ||
      price === "" ||
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0
    ) {
      return NextResponse.json(
        {
          error: "Price must be a valid non-negative number.",
        },
        {
          status: 400,
        },
      );
    }

    const supabase = createSupabaseAdmin();

    //----------------------------------------------------
    // Verify Course Exists
    //----------------------------------------------------

    const { data: course, error: courseError } = await supabase
      .from("academy_courses")
      .select(
        `
          id,
          title,
          slug,
          status,
          sort_order
        `,
      )
      .eq("id", course_id)
      .maybeSingle();

    if (courseError) {
      throw courseError;
    }

    if (!course) {
      return NextResponse.json(
        {
          error: "The selected academy course does not exist.",
        },
        {
          status: 404,
        },
      );
    }

    //----------------------------------------------------
    // Duplicate Check
    //----------------------------------------------------

    const { data: existing, error: duplicateError } = await supabase
      .from("academy_course_pricing")
      .select("id")
      .eq("course_id", course_id)
      .eq("learning_mode", learning_mode)
      .eq("duration_months", parsedDuration)
      .maybeSingle();

    if (duplicateError) {
      throw duplicateError;
    }

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
    // Insert Pricing
    //----------------------------------------------------

    const { data, error } = await supabase
      .from("academy_course_pricing")
      .insert({
        course_id,
        learning_mode,
        duration_months: parsedDuration,
        price: parsedPrice,
        currency: currency || "NGN",
        active: active === undefined ? true : Boolean(active),
      })
      .select(
        `
          *,
          course:academy_courses(
            id,
            title,
            slug,
            status,
            sort_order
          )
        `,
      )
      .single();

    if (error) {
      throw error;
    }

    //----------------------------------------------------
    // Response
    //----------------------------------------------------

    return NextResponse.json({
      success: true,
      pricing: data,
    });
  } catch (error) {
    console.error("POST course pricing error:", error);

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
