import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

import slugify from "slugify";

import parseAdminFilters from "@/lib/admin/parseAdminFilters";
import buildPaginationQuery from "@/lib/admin/buildPaginationQuery";

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

    const supabase = createSupabaseAdmin();

    //--------------------------------------------------
    // Filters
    //--------------------------------------------------

    const { searchParams } = new URL(req.url);

    const { page, pageSize, search, status, sortBy, sortOrder } =
      parseAdminFilters(searchParams);

    //--------------------------------------------------
    // Query
    //--------------------------------------------------

    let query = supabase.from("academy_courses").select("*", {
      count: "exact",
    });

    //--------------------------------------------------
    // Search
    //--------------------------------------------------

    if (search) {
      query = query.or(
        [
          `title.ilike.%${search}%`,
          `level.ilike.%${search}%`,
          `slug.ilike.%${search}%`,
        ].join(","),
      );
    }

    //--------------------------------------------------
    // Status
    //--------------------------------------------------

    if (status === "active") {
      query = query.eq("active", true);
    }

    if (status === "inactive") {
      query = query.eq("active", false);
    }

    //--------------------------------------------------
    // Sorting
    //--------------------------------------------------

    const allowedSorts = [
      "title",
      "level",
      "sort_order",
      "created_at",
      "updated_at",
    ];

    const column = allowedSorts.includes(sortBy) ? sortBy : "sort_order";

    query = query.order(column, {
      ascending: sortOrder === "asc",
    });

    if (column !== "sort_order") {
      query = query.order("sort_order", {
        ascending: true,
      });
    }

    //--------------------------------------------------
    // Pagination
    //--------------------------------------------------

    query = buildPaginationQuery(query, page, pageSize);

    //--------------------------------------------------
    // Execute
    //--------------------------------------------------

    const { data, count, error } = await query;

    if (error) throw error;

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
    console.error(error);

    return NextResponse.json(
      {
        error: error.message || "Failed to fetch academy courses.",
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

    const { title, description, level, active = true, sort_order = 0 } = body;

    //--------------------------------------------------
    // Validation
    //--------------------------------------------------

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

    const slug = slugify(title, {
      lower: true,
      strict: true,
      trim: true,
    });

    const supabase = createSupabaseAdmin();

    //--------------------------------------------------
    // Duplicate slug
    //--------------------------------------------------

    const { data: existing } = await supabase
      .from("academy_courses")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          error: "A course with this title already exists.",
        },
        {
          status: 409,
        },
      );
    }

    //--------------------------------------------------
    // Insert
    //--------------------------------------------------

    const { data, error } = await supabase
      .from("academy_courses")
      .insert({
        title: title.trim(),
        slug,
        description,
        level,
        active,
        sort_order: Number(sort_order),
      })
      .select()
      .single();

    if (error) throw error;

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
    console.error(error);

    return NextResponse.json(
      {
        error: error.message || "Failed to create academy course.",
      },
      {
        status: 500,
      },
    );
  }
}
