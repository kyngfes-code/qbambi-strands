import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

import slugify from "slugify";

import parseAdminFilters from "@/lib/admin/parseAdminFilters";
import buildPaginationQuery from "@/lib/admin/buildPaginationQuery";

//////////////////////////////////////////////////////////////
// HELPERS
//////////////////////////////////////////////////////////////

const ALLOWED_STATUSES = ["draft", "published", "archived"];

const ALLOWED_SORTS = [
  "course_code",
  "title",
  "status",
  "duration_minutes",
  "sort_order",
  "created_at",
  "updated_at",
];

//////////////////////////////////////////////////////////////
// GET
//////////////////////////////////////////////////////////////

export async function GET(req) {
  try {
    ////////////////////////////////////////////////////////////
    // AUTH
    ////////////////////////////////////////////////////////////

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createSupabaseAdmin();

    ////////////////////////////////////////////////////////////
    // FILTERS
    ////////////////////////////////////////////////////////////

    const { searchParams } = new URL(req.url);

    const { page, pageSize, search, status, sortBy, sortOrder } =
      parseAdminFilters(searchParams);

    ////////////////////////////////////////////////////////////
    // QUERY
    ////////////////////////////////////////////////////////////

    let query = supabase.from("academy_courses").select(
      `
          id,
          course_code,
          title,
          slug,
          description,
          thumbnail_path,
          duration_minutes,
          status,
          sort_order,
          created_at,
          updated_at
        `,
      {
        count: "exact",
      },
    );

    ////////////////////////////////////////////////////////////
    // SEARCH
    ////////////////////////////////////////////////////////////

    if (search) {
      const safeSearch = search.trim();

      query = query.or(
        [
          `course_code.ilike.%${safeSearch}%`,
          `title.ilike.%${safeSearch}%`,
          `slug.ilike.%${safeSearch}%`,
          `description.ilike.%${safeSearch}%`,
        ].join(","),
      );
    }

    ////////////////////////////////////////////////////////////
    // STATUS
    ////////////////////////////////////////////////////////////

    if (ALLOWED_STATUSES.includes(status)) {
      query = query.eq("status", status);
    }

    ////////////////////////////////////////////////////////////
    // SORTING
    ////////////////////////////////////////////////////////////

    const column = ALLOWED_SORTS.includes(sortBy) ? sortBy : "sort_order";

    query = query.order(column, {
      ascending: sortOrder === "asc",
    });

    // Always use sort_order as secondary ordering
    // unless it is already the primary column.

    if (column !== "sort_order") {
      query = query.order("sort_order", {
        ascending: true,
      });
    }

    ////////////////////////////////////////////////////////////
    // PAGINATION
    ////////////////////////////////////////////////////////////

    query = buildPaginationQuery(query, page, pageSize);

    ////////////////////////////////////////////////////////////
    // EXECUTE
    ////////////////////////////////////////////////////////////

    const { data, count, error } = await query;

    if (error) {
      throw error;
    }

    ////////////////////////////////////////////////////////////
    // RESPONSE
    ////////////////////////////////////////////////////////////

    return NextResponse.json({
      courses: data ?? [],

      pagination: {
        page,
        pageSize,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/academy/courses error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Failed to fetch academy courses.",
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
    ////////////////////////////////////////////////////////////
    // AUTH
    ////////////////////////////////////////////////////////////

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    ////////////////////////////////////////////////////////////
    // BODY
    ////////////////////////////////////////////////////////////

    const body = await req.json();

    const {
      course_code,
      title,
      description = null,
      thumbnail_path = null,
      duration_minutes = null,
      status = "draft",
      sort_order = 0,
    } = body;

    ////////////////////////////////////////////////////////////
    // VALIDATION
    ////////////////////////////////////////////////////////////

    if (!course_code?.trim()) {
      return NextResponse.json(
        {
          error: "Course code is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!title?.trim()) {
      return NextResponse.json(
        {
          error: "Course title is required.",
        },
        {
          status: 400,
        },
      );
    }

    const normalizedCourseCode = course_code.trim().toUpperCase();

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          error:
            "Invalid course status. Allowed values are draft, published, or archived.",
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // DURATION
    ////////////////////////////////////////////////////////////

    let normalizedDuration = null;

    if (
      duration_minutes !== null &&
      duration_minutes !== undefined &&
      duration_minutes !== ""
    ) {
      normalizedDuration = Number(duration_minutes);

      if (!Number.isInteger(normalizedDuration) || normalizedDuration < 0) {
        return NextResponse.json(
          {
            error: "Duration must be a non-negative whole number.",
          },
          {
            status: 400,
          },
        );
      }
    }

    ////////////////////////////////////////////////////////////
    // SORT ORDER
    ////////////////////////////////////////////////////////////

    const normalizedSortOrder = Number(sort_order);

    if (!Number.isInteger(normalizedSortOrder) || normalizedSortOrder < 0) {
      return NextResponse.json(
        {
          error: "Sort order must be a non-negative whole number.",
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // SLUG
    ////////////////////////////////////////////////////////////

    const slug = slugify(title, {
      lower: true,
      strict: true,
      trim: true,
    });

    if (!slug) {
      return NextResponse.json(
        {
          error: "Unable to generate a valid course slug from the title.",
        },
        {
          status: 400,
        },
      );
    }

    const supabase = createSupabaseAdmin();

    ////////////////////////////////////////////////////////////
    // DUPLICATE COURSE CODE
    ////////////////////////////////////////////////////////////

    const { data: existingCode, error: existingCodeError } = await supabase
      .from("academy_courses")
      .select("id")
      .eq("course_code", normalizedCourseCode)
      .maybeSingle();

    if (existingCodeError) {
      throw existingCodeError;
    }

    if (existingCode) {
      return NextResponse.json(
        {
          error: "A course with this course code already exists.",
        },
        {
          status: 409,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // DUPLICATE SLUG
    ////////////////////////////////////////////////////////////

    const { data: existingSlug, error: existingSlugError } = await supabase
      .from("academy_courses")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingSlugError) {
      throw existingSlugError;
    }

    if (existingSlug) {
      return NextResponse.json(
        {
          error: "A course with this title already exists.",
        },
        {
          status: 409,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // INSERT
    ////////////////////////////////////////////////////////////

    const { data, error } = await supabase
      .from("academy_courses")
      .insert({
        course_code: normalizedCourseCode,
        title: title.trim(),
        slug,
        description: description?.trim() || null,
        thumbnail_path: thumbnail_path?.trim() || null,
        duration_minutes: normalizedDuration,
        status,
        sort_order: normalizedSortOrder,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    ////////////////////////////////////////////////////////////
    // RESPONSE
    ////////////////////////////////////////////////////////////

    return NextResponse.json(
      {
        success: true,
        message: "Course created successfully.",
        course: data,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("POST /api/admin/academy/courses error:", error);

    ////////////////////////////////////////////////////////////
    // UNIQUE CONSTRAINT FALLBACK
    ////////////////////////////////////////////////////////////

    if (error?.code === "23505") {
      return NextResponse.json(
        {
          error: "A course with this code or slug already exists.",
        },
        {
          status: 409,
        },
      );
    }

    return NextResponse.json(
      {
        error: error?.message || "Failed to create academy course.",
      },
      {
        status: 500,
      },
    );
  }
}
