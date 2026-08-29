import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

//////////////////////////////////////////////////////////////
// CONSTANTS
//////////////////////////////////////////////////////////////

const ALLOWED_STATUSES = ["draft", "published", "archived"];

//////////////////////////////////////////////////////////////
// AUTH
//////////////////////////////////////////////////////////////

async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    return {
      error: NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      ),
    };
  }

  if (session.user.role !== "admin") {
    return {
      error: NextResponse.json(
        {
          error: "Forbidden",
        },
        {
          status: 403,
        },
      ),
    };
  }

  return {
    session,
  };
}

//////////////////////////////////////////////////////////////
// GET
//
// GET /api/admin/academy/courses/[courseId]/modules/[moduleId]
//
// Returns:
// - module
// - videos from academy_module_videos
// - materials from academy_course_materials
//////////////////////////////////////////////////////////////

export async function GET(req, { params }) {
  try {
    const authResult = await requireAdmin();

    if (authResult.error) {
      return authResult.error;
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
    // 1. VERIFY MODULE
    ////////////////////////////////////////////////////////////

    const { data: module, error: moduleError } = await supabase
      .from("academy_course_modules")
      .select(
        `
          id,
          course_id,
          module_code,
          title,
          description,
          sort_order,
          status,
          created_at,
          updated_at
        `,
      )
      .eq("id", moduleId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (moduleError) {
      throw moduleError;
    }

    if (!module) {
      return NextResponse.json(
        {
          error: "Academy course module not found.",
        },
        {
          status: 404,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 2. FETCH MODULE VIDEOS
    //
    // IMPORTANT:
    //
    // academy_module_videos no longer stores course_id.
    //
    // The course relationship is:
    //
    // academy_module_videos.module_id
    //        ↓
    // academy_course_modules.id
    //        ↓
    // academy_course_modules.course_id
    //
    ////////////////////////////////////////////////////////////

    const { data: videos, error: videosError } = await supabase
      .from("academy_module_videos")
      .select(
        `
          id,
          module_id,
          title,
          description,
          duration_seconds,
          sort_order,
          status,
          bunny_video_id,
          thumbnail_url,
          created_at,
          updated_at
        `,
      )
      .eq("module_id", moduleId)
      .order("sort_order", {
        ascending: true,
      })
      .order("created_at", {
        ascending: true,
      });

    if (videosError) {
      throw videosError;
    }

    ////////////////////////////////////////////////////////////
    // 3. FETCH MATERIALS
    ////////////////////////////////////////////////////////////

    const { data: materials, error: materialsError } = await supabase
      .from("academy_course_materials")
      .select(
        `
          id,
          course_id,
          module_id,
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
          created_at,
          updated_at
        `,
      )
      .eq("course_id", courseId)
      .eq("module_id", moduleId)
      .order("sort_order", {
        ascending: true,
      })
      .order("created_at", {
        ascending: true,
      });

    if (materialsError) {
      throw materialsError;
    }

    ////////////////////////////////////////////////////////////
    // 4. NORMALIZE VIDEOS
    ////////////////////////////////////////////////////////////

    const normalizedVideos = (videos || []).map((video) => ({
      ...video,

      moduleId: video.module_id,

      durationSeconds: video.duration_seconds,

      sortOrder: video.sort_order,

      bunnyVideoId: video.bunny_video_id,

      thumbnailUrl: video.thumbnail_url,
    }));

    ////////////////////////////////////////////////////////////
    // 5. RETURN
    ////////////////////////////////////////////////////////////

    return NextResponse.json({
      success: true,

      module: {
        ...module,

        videos: normalizedVideos,

        materials: materials || [],

        videoCount: normalizedVideos.length,

        materialCount: materials?.length || 0,
      },
    });
  } catch (error) {
    console.error("GET academy module error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Failed to fetch academy course module.",
      },
      {
        status: 500,
      },
    );
  }
}

//////////////////////////////////////////////////////////////
// PATCH
//
// Updates the module itself.
//
// Video records are managed separately through
// academy_module_videos.
//////////////////////////////////////////////////////////////

export async function PATCH(req, { params }) {
  try {
    const authResult = await requireAdmin();

    if (authResult.error) {
      return authResult.error;
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

    const supabase = createSupabaseAdmin();

    ////////////////////////////////////////////////////////////
    // 1. VERIFY MODULE
    ////////////////////////////////////////////////////////////

    const { data: existingModule, error: existingError } = await supabase
      .from("academy_course_modules")
      .select("*")
      .eq("id", moduleId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (!existingModule) {
      return NextResponse.json(
        {
          error: "Academy course module not found.",
        },
        {
          status: 404,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 2. BUILD UPDATE
    ////////////////////////////////////////////////////////////

    const updates = {};

    ////////////////////////////////////////////////////////////
    // MODULE CODE
    ////////////////////////////////////////////////////////////

    if (body.module_code !== undefined) {
      if (typeof body.module_code !== "string" || !body.module_code.trim()) {
        return NextResponse.json(
          {
            error: "Module code cannot be empty.",
          },
          {
            status: 400,
          },
        );
      }

      updates.module_code = body.module_code.trim().toUpperCase();
    }

    ////////////////////////////////////////////////////////////
    // TITLE
    ////////////////////////////////////////////////////////////

    if (body.title !== undefined) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        return NextResponse.json(
          {
            error: "Module title cannot be empty.",
          },
          {
            status: 400,
          },
        );
      }

      updates.title = body.title.trim();
    }

    ////////////////////////////////////////////////////////////
    // DESCRIPTION
    ////////////////////////////////////////////////////////////

    if (body.description !== undefined) {
      updates.description =
        typeof body.description === "string" && body.description.trim()
          ? body.description.trim()
          : null;
    }

    ////////////////////////////////////////////////////////////
    // SORT ORDER
    ////////////////////////////////////////////////////////////

    if (body.sort_order !== undefined) {
      const sortOrder = Number(body.sort_order);

      if (!Number.isInteger(sortOrder) || sortOrder < 0) {
        return NextResponse.json(
          {
            error: "Sort order must be a non-negative integer.",
          },
          {
            status: 400,
          },
        );
      }

      updates.sort_order = sortOrder;
    }

    ////////////////////////////////////////////////////////////
    // STATUS
    ////////////////////////////////////////////////////////////

    if (body.status !== undefined) {
      if (!ALLOWED_STATUSES.includes(body.status)) {
        return NextResponse.json(
          {
            error:
              "Invalid module status. Allowed values are draft, published, and archived.",
          },
          {
            status: 400,
          },
        );
      }

      updates.status = body.status;
    }

    ////////////////////////////////////////////////////////////
    // NOTHING TO UPDATE
    ////////////////////////////////////////////////////////////

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        success: true,

        message: "No changes were supplied.",

        module: existingModule,
      });
    }

    ////////////////////////////////////////////////////////////
    // 3. CHECK DUPLICATE MODULE CODE
    ////////////////////////////////////////////////////////////

    if (
      updates.module_code &&
      updates.module_code !== existingModule.module_code
    ) {
      const { data: duplicateCode, error: duplicateCodeError } = await supabase
        .from("academy_course_modules")
        .select("id")
        .eq("module_code", updates.module_code)
        .neq("id", moduleId)
        .maybeSingle();

      if (duplicateCodeError) {
        throw duplicateCodeError;
      }

      if (duplicateCode) {
        return NextResponse.json(
          {
            error: "Another module already uses this module code.",
          },
          {
            status: 409,
          },
        );
      }
    }

    ////////////////////////////////////////////////////////////
    // 4. CHECK DUPLICATE SORT ORDER
    //
    // Sort order must be unique within this course.
    ////////////////////////////////////////////////////////////

    if (
      updates.sort_order !== undefined &&
      updates.sort_order !== existingModule.sort_order
    ) {
      const { data: duplicateSortOrder, error: duplicateSortError } =
        await supabase
          .from("academy_course_modules")
          .select("id")
          .eq("course_id", courseId)
          .eq("sort_order", updates.sort_order)
          .neq("id", moduleId)
          .maybeSingle();

      if (duplicateSortError) {
        throw duplicateSortError;
      }

      if (duplicateSortOrder) {
        return NextResponse.json(
          {
            error:
              "Another module already uses this sort order in this course.",
          },
          {
            status: 409,
          },
        );
      }
    }

    ////////////////////////////////////////////////////////////
    // 5. UPDATE
    ////////////////////////////////////////////////////////////

    updates.updated_at = new Date().toISOString();

    const { data: updatedModule, error: updateError } = await supabase
      .from("academy_course_modules")
      .update(updates)
      .eq("id", moduleId)
      .eq("course_id", courseId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    ////////////////////////////////////////////////////////////
    // 6. RETURN
    ////////////////////////////////////////////////////////////

    return NextResponse.json({
      success: true,

      message: "Academy course module updated successfully.",

      module: updatedModule,
    });
  } catch (error) {
    console.error("PATCH academy module error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Failed to update academy course module.",
      },
      {
        status: 500,
      },
    );
  }
}

//////////////////////////////////////////////////////////////
// DELETE
//
// Deleting a module will cascade into:
//
// academy_module_videos
//
// because:
//
// academy_module_videos_module_fkey
// ON DELETE CASCADE
//
// Materials depend on their own FK behavior.
//////////////////////////////////////////////////////////////

export async function DELETE(req, { params }) {
  try {
    const authResult = await requireAdmin();

    if (authResult.error) {
      return authResult.error;
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
    // 1. VERIFY MODULE
    ////////////////////////////////////////////////////////////

    const { data: module, error: moduleError } = await supabase
      .from("academy_course_modules")
      .select(
        `
            id,
            course_id,
            module_code,
            title,
            sort_order,
            status
          `,
      )
      .eq("id", moduleId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (moduleError) {
      throw moduleError;
    }

    if (!module) {
      return NextResponse.json(
        {
          error: "Academy course module not found.",
        },
        {
          status: 404,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 2. DELETE MODULE
    //
    // academy_module_videos.module_id has:
    //
    // ON DELETE CASCADE
    //
    // Therefore associated module videos are automatically
    // deleted by PostgreSQL.
    ////////////////////////////////////////////////////////////

    const { error: deleteError } = await supabase
      .from("academy_course_modules")
      .delete()
      .eq("id", moduleId)
      .eq("course_id", courseId);

    if (deleteError) {
      throw deleteError;
    }

    ////////////////////////////////////////////////////////////
    // 3. RETURN
    ////////////////////////////////////////////////////////////

    return NextResponse.json({
      success: true,

      message:
        "Academy course module and its associated videos were deleted successfully.",

      deletedModule: {
        id: module.id,

        module_code: module.module_code,

        title: module.title,

        sort_order: module.sort_order,

        status: module.status,
      },
    });
  } catch (error) {
    console.error("DELETE academy module error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Failed to delete academy course module.",
      },
      {
        status: 500,
      },
    );
  }
}
