import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

//////////////////////////////////////////////////////////////
// ADMIN AUTH
//////////////////////////////////////////////////////////////

async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (session.user.role !== "admin") {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { session };
}

//////////////////////////////////////////////////////////////
// VERIFY COURSE + MODULE
//////////////////////////////////////////////////////////////

async function verifyCourseModule(supabase, courseId, moduleId) {
  const { data, error } = await supabase
    .from("academy_course_modules")
    .select(
      `
      id,
      course_id,
      module_code,
      title,
      status,
      course:academy_courses(
        id,
        course_code,
        title,
        slug,
        status
      )
      `,
    )
    .eq("id", moduleId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

//////////////////////////////////////////////////////////////
// GET
// /api/admin/academy/courses/[courseId]/modules/[moduleId]/materials
//////////////////////////////////////////////////////////////

export async function GET(req, { params }) {
  try {
    const adminCheck = await requireAdmin();

    if (adminCheck.error) {
      return adminCheck.error;
    }

    const { courseId, moduleId } = await params;

    if (!courseId || !moduleId) {
      return NextResponse.json(
        {
          error: "Course ID and module ID are required.",
        },
        {
          status: 400,
        },
      );
    }

    const supabase = createSupabaseAdmin();

    ////////////////////////////////////////////////////////////
    // VERIFY MODULE
    ////////////////////////////////////////////////////////////

    const module = await verifyCourseModule(supabase, courseId, moduleId);

    if (!module) {
      return NextResponse.json(
        {
          error: "Module not found or does not belong to this course.",
        },
        {
          status: 404,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // QUERY MATERIALS
    ////////////////////////////////////////////////////////////

    const { data, error } = await supabase
      .from("academy_course_materials")
      .select("*")
      .eq("course_id", courseId)
      .eq("module_id", moduleId)
      .order("sort_order", {
        ascending: true,
      })
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      materials: data ?? [],
      module,
    });
  } catch (error) {
    console.error("GET academy module materials error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to fetch academy course materials.",
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

export async function POST(req, { params }) {
  try {
    const adminCheck = await requireAdmin();

    if (adminCheck.error) {
      return adminCheck.error;
    }

    const { courseId, moduleId } = await params;

    if (!courseId || !moduleId) {
      return NextResponse.json(
        {
          error: "Course ID and module ID are required.",
        },
        {
          status: 400,
        },
      );
    }

    const body = await req.json();

    const {
      material_code,
      title,
      description,
      file_path,
      file_name,
      file_type,
      file_size_bytes,
      sort_order = 0,
      is_downloadable = true,
      is_published = false,
    } = body;

    ////////////////////////////////////////////////////////////
    // VALIDATION
    ////////////////////////////////////////////////////////////

    if (!material_code?.trim()) {
      return NextResponse.json(
        {
          error: "Material code is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!title?.trim()) {
      return NextResponse.json(
        {
          error: "Material title is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!file_path?.trim()) {
      return NextResponse.json(
        {
          error: "File path is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      file_size_bytes !== undefined &&
      file_size_bytes !== null &&
      (!Number.isFinite(Number(file_size_bytes)) || Number(file_size_bytes) < 0)
    ) {
      return NextResponse.json(
        {
          error: "File size must be a valid positive number.",
        },
        {
          status: 400,
        },
      );
    }

    if (!Number.isInteger(Number(sort_order)) || Number(sort_order) < 0) {
      return NextResponse.json(
        {
          error: "Sort order must be a non-negative integer.",
        },
        {
          status: 400,
        },
      );
    }

    const supabase = createSupabaseAdmin();

    ////////////////////////////////////////////////////////////
    // VERIFY COURSE + MODULE
    ////////////////////////////////////////////////////////////

    const module = await verifyCourseModule(supabase, courseId, moduleId);

    if (!module) {
      return NextResponse.json(
        {
          error: "Module not found or does not belong to this course.",
        },
        {
          status: 404,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // DUPLICATE MATERIAL CODE
    ////////////////////////////////////////////////////////////

    const normalizedCode = material_code.trim();

    const { data: existingMaterial, error: existingError } = await supabase
      .from("academy_course_materials")
      .select("id")
      .eq("material_code", normalizedCode)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingMaterial) {
      return NextResponse.json(
        {
          error: "A material with this material code already exists.",
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
      .from("academy_course_materials")
      .insert({
        course_id: courseId,
        module_id: moduleId,

        material_code: normalizedCode,

        title: title.trim(),

        description: description?.trim() || null,

        file_path: file_path.trim(),

        file_name: file_name?.trim() || null,

        file_type: file_type?.trim() || null,

        file_size_bytes:
          file_size_bytes === undefined || file_size_bytes === null
            ? null
            : Number(file_size_bytes),

        sort_order: Number(sort_order),

        is_downloadable: Boolean(is_downloadable),

        is_published: Boolean(is_published),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Academy course material created successfully.",
        material: data,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("POST academy module material error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to create academy course material.",
      },
      {
        status: 500,
      },
    );
  }
}
