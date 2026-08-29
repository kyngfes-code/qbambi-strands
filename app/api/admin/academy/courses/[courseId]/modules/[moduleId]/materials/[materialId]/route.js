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
// GET
//////////////////////////////////////////////////////////////

export async function GET(req, { params }) {
  try {
    const adminCheck = await requireAdmin();

    if (adminCheck.error) {
      return adminCheck.error;
    }

    const { courseId, moduleId, materialId } = await params;

    if (!courseId || !moduleId || !materialId) {
      return NextResponse.json(
        {
          error: "Course ID, module ID and material ID are required.",
        },
        {
          status: 400,
        },
      );
    }

    const supabase = createSupabaseAdmin();

    ////////////////////////////////////////////////////////////
    // FETCH MATERIAL
    ////////////////////////////////////////////////////////////

    const { data, error } = await supabase
      .from("academy_course_materials")
      .select(
        `
        *,
        module:academy_course_modules(
          id,
          course_id,
          module_code,
          title,
          description,
          sort_order,
          status
        ),
        course:academy_courses(
          id,
          course_code,
          title,
          slug,
          status
        )
        `,
      )
      .eq("id", materialId)
      .eq("course_id", courseId)
      .eq("module_id", moduleId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        {
          error: "Course material not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      material: data,
    });
  } catch (error) {
    console.error("GET academy material error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to fetch academy course material.",
      },
      {
        status: 500,
      },
    );
  }
}

//////////////////////////////////////////////////////////////
// PATCH
//////////////////////////////////////////////////////////////

export async function PATCH(req, { params }) {
  try {
    const adminCheck = await requireAdmin();

    if (adminCheck.error) {
      return adminCheck.error;
    }

    const { courseId, moduleId, materialId } = await params;

    if (!courseId || !moduleId || !materialId) {
      return NextResponse.json(
        {
          error: "Course ID, module ID and material ID are required.",
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
      sort_order,
      is_downloadable,
      is_published,
    } = body;

    const supabase = createSupabaseAdmin();

    ////////////////////////////////////////////////////////////
    // VERIFY MATERIAL
    ////////////////////////////////////////////////////////////

    const { data: existingMaterial, error: existingError } = await supabase
      .from("academy_course_materials")
      .select(
        `
        id,
        course_id,
        module_id,
        material_code,
        file_path
        `,
      )
      .eq("id", materialId)
      .eq("course_id", courseId)
      .eq("module_id", moduleId)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (!existingMaterial) {
      return NextResponse.json(
        {
          error: "Course material not found.",
        },
        {
          status: 404,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // VALIDATION
    ////////////////////////////////////////////////////////////

    if (material_code !== undefined && !material_code?.trim()) {
      return NextResponse.json(
        {
          error: "Material code cannot be empty.",
        },
        {
          status: 400,
        },
      );
    }

    if (title !== undefined && !title?.trim()) {
      return NextResponse.json(
        {
          error: "Material title cannot be empty.",
        },
        {
          status: 400,
        },
      );
    }

    if (file_path !== undefined && !file_path?.trim()) {
      return NextResponse.json(
        {
          error: "File path cannot be empty.",
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

    if (
      sort_order !== undefined &&
      (!Number.isInteger(Number(sort_order)) || Number(sort_order) < 0)
    ) {
      return NextResponse.json(
        {
          error: "Sort order must be a non-negative integer.",
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // BUILD UPDATE
    ////////////////////////////////////////////////////////////

    const updateData = {};

    if (material_code !== undefined) {
      const normalizedCode = material_code.trim();

      //////////////////////////////////////////////////////////
      // DUPLICATE CODE
      //////////////////////////////////////////////////////////

      const { data: duplicate, error: duplicateError } = await supabase
        .from("academy_course_materials")
        .select("id")
        .eq("material_code", normalizedCode)
        .neq("id", materialId)
        .maybeSingle();

      if (duplicateError) {
        throw duplicateError;
      }

      if (duplicate) {
        return NextResponse.json(
          {
            error: "Another course material already uses this material code.",
          },
          {
            status: 409,
          },
        );
      }

      updateData.material_code = normalizedCode;
    }

    if (title !== undefined) {
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (file_path !== undefined) {
      updateData.file_path = file_path.trim();
    }

    if (file_name !== undefined) {
      updateData.file_name = file_name?.trim() || null;
    }

    if (file_type !== undefined) {
      updateData.file_type = file_type?.trim() || null;
    }

    if (file_size_bytes !== undefined) {
      updateData.file_size_bytes =
        file_size_bytes === null ? null : Number(file_size_bytes);
    }

    if (sort_order !== undefined) {
      updateData.sort_order = Number(sort_order);
    }

    if (is_downloadable !== undefined) {
      updateData.is_downloadable = Boolean(is_downloadable);
    }

    if (is_published !== undefined) {
      updateData.is_published = Boolean(is_published);
    }

    updateData.updated_at = new Date().toISOString();

    ////////////////////////////////////////////////////////////
    // UPDATE
    ////////////////////////////////////////////////////////////

    const { data, error } = await supabase
      .from("academy_course_materials")
      .update(updateData)
      .eq("id", materialId)
      .eq("course_id", courseId)
      .eq("module_id", moduleId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Academy course material updated successfully.",
      material: data,
    });
  } catch (error) {
    console.error("PATCH academy material error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to update academy course material.",
      },
      {
        status: 500,
      },
    );
  }
}

//////////////////////////////////////////////////////////////
// DELETE
//////////////////////////////////////////////////////////////

export async function DELETE(req, { params }) {
  try {
    const adminCheck = await requireAdmin();

    if (adminCheck.error) {
      return adminCheck.error;
    }

    const { courseId, moduleId, materialId } = await params;

    if (!courseId || !moduleId || !materialId) {
      return NextResponse.json(
        {
          error: "Course ID, module ID and material ID are required.",
        },
        {
          status: 400,
        },
      );
    }

    const supabase = createSupabaseAdmin();

    ////////////////////////////////////////////////////////////
    // VERIFY MATERIAL
    ////////////////////////////////////////////////////////////

    const { data: existingMaterial, error: existingError } = await supabase
      .from("academy_course_materials")
      .select(
        `
        id,
        course_id,
        module_id,
        material_code,
        title,
        file_path,
        file_name
        `,
      )
      .eq("id", materialId)
      .eq("course_id", courseId)
      .eq("module_id", moduleId)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (!existingMaterial) {
      return NextResponse.json(
        {
          error: "Course material not found.",
        },
        {
          status: 404,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // DELETE DATABASE RECORD
    //
    // IMPORTANT:
    // This does not delete the physical Storage file.
    ////////////////////////////////////////////////////////////

    const { error: deleteError } = await supabase
      .from("academy_course_materials")
      .delete()
      .eq("id", materialId)
      .eq("course_id", courseId)
      .eq("module_id", moduleId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: "Academy course material deleted successfully.",
      material: existingMaterial,
    });
  } catch (error) {
    console.error("DELETE academy material error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to delete academy course material.",
      },
      {
        status: 500,
      },
    );
  }
}
