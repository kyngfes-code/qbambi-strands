import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import slugify from "slugify";

//////////////////////////////////////////////////////////////
// CONSTANTS
//////////////////////////////////////////////////////////////

const ALLOWED_STATUSES = ["draft", "published", "archived"];

//////////////////////////////////////////////////////////////
// HELPERS
//////////////////////////////////////////////////////////////

function generateCourseCode(title) {
  const prefix =
    slugify(title || "course", {
      lower: false,
      strict: true,
      trim: true,
    })
      .replace(/-/g, "")
      .slice(0, 6)
      .toUpperCase() || "COURSE";

  const random = Math.floor(1000 + Math.random() * 9000);

  return `${prefix}-${random}`;
}

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
//////////////////////////////////////////////////////////////

export async function GET(req, { params }) {
  try {
    ////////////////////////////////////////////////////////////
    // AUTH
    ////////////////////////////////////////////////////////////

    const authResult = await requireAdmin();

    if (authResult.error) {
      return authResult.error;
    }

    ////////////////////////////////////////////////////////////
    // PARAMS
    ////////////////////////////////////////////////////////////

    const { courseId } = await params;

    if (!courseId) {
      return NextResponse.json(
        {
          error: "Course ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // SUPABASE
    ////////////////////////////////////////////////////////////

    const supabase = createSupabaseAdmin();

    ////////////////////////////////////////////////////////////
    // FETCH COURSE
    ////////////////////////////////////////////////////////////

    const { data: course, error: courseError } = await supabase
      .from("academy_courses")
      .select("*")
      .eq("id", courseId)
      .maybeSingle();

    if (courseError) {
      throw courseError;
    }

    if (!course) {
      return NextResponse.json(
        {
          error: "Academy course not found.",
        },
        {
          status: 404,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // FETCH MODULES
    ////////////////////////////////////////////////////////////

    const { data: modules, error: modulesError } = await supabase
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
      .eq("course_id", courseId)
      .order("sort_order", {
        ascending: true,
      });

    if (modulesError) {
      throw modulesError;
    }

    const normalizedModules = modules ?? [];

    ////////////////////////////////////////////////////////////
    // MODULE IDS
    ////////////////////////////////////////////////////////////

    const moduleIds = normalizedModules.map((module) => module.id);

    ////////////////////////////////////////////////////////////
    // FETCH VIDEOS
    //
    // academy_module_videos does NOT have course_id.
    //
    // Course ownership is determined through:
    //
    // academy_module_videos.module_id
    //        ↓
    // academy_course_modules.id
    //        ↓
    // academy_course_modules.course_id
    //
    ////////////////////////////////////////////////////////////

    let videos = [];

    if (moduleIds.length > 0) {
      const { data: videoRows, error: videosError } = await supabase
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
        .in("module_id", moduleIds)
        .order("sort_order", {
          ascending: true,
        });

      if (videosError) {
        throw videosError;
      }

      videos = videoRows ?? [];
    }

    ////////////////////////////////////////////////////////////
    // FETCH MATERIALS
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
      .order("sort_order", {
        ascending: true,
      });

    if (materialsError) {
      throw materialsError;
    }

    const normalizedMaterials = materials ?? [];

    ////////////////////////////////////////////////////////////
    // GROUP CONTENT INTO MODULES
    ////////////////////////////////////////////////////////////

    const groupedModules = normalizedModules.map((module) => {
      const moduleVideos = videos
        .filter((video) => video.module_id === module.id)
        .sort((a, b) => {
          if (a.sort_order !== b.sort_order) {
            return a.sort_order - b.sort_order;
          }

          return a.id.localeCompare(b.id);
        });

      const moduleMaterials = normalizedMaterials
        .filter((material) => material.module_id === module.id)
        .sort((a, b) => {
          if (a.sort_order !== b.sort_order) {
            return a.sort_order - b.sort_order;
          }

          return a.id.localeCompare(b.id);
        });

      return {
        ...module,

        videos: moduleVideos,

        materials: moduleMaterials,

        videoCount: moduleVideos.length,

        materialCount: moduleMaterials.length,
      };
    });

    ////////////////////////////////////////////////////////////
    // CONTENT WITHOUT MODULE
    //
    // This should normally be empty because academy_module_videos
    // requires module_id.
    //
    ////////////////////////////////////////////////////////////

    const assignedModuleIds = new Set(moduleIds);

    const unassignedVideos = videos.filter(
      (video) => !assignedModuleIds.has(video.module_id),
    );

    const unassignedMaterials = normalizedMaterials.filter(
      (material) =>
        !material.module_id || !assignedModuleIds.has(material.module_id),
    );

    ////////////////////////////////////////////////////////////
    // COURSE VIDEO ORDER
    //
    // Course-wide video order is:
    //
    // module.sort_order
    //        +
    // video.sort_order
    //
    ////////////////////////////////////////////////////////////

    const moduleOrderMap = new Map(
      normalizedModules.map((module) => [module.id, module.sort_order]),
    );

    const orderedVideos = [...videos].sort((a, b) => {
      const moduleA = moduleOrderMap.get(a.module_id) ?? 0;
      const moduleB = moduleOrderMap.get(b.module_id) ?? 0;

      if (moduleA !== moduleB) {
        return moduleA - moduleB;
      }

      if (a.sort_order !== b.sort_order) {
        return a.sort_order - b.sort_order;
      }

      return a.id.localeCompare(b.id);
    });

    ////////////////////////////////////////////////////////////
    // RESPONSE
    ////////////////////////////////////////////////////////////

    return NextResponse.json({
      course: {
        ...course,

        modules: groupedModules,

        videos: orderedVideos,

        materials: normalizedMaterials,

        unassignedVideos,

        unassignedMaterials,

        moduleCount: normalizedModules.length,

        videoCount: videos.length,

        materialCount: normalizedMaterials.length,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/academy/courses/[courseId] error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Failed to fetch academy course.",
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
    ////////////////////////////////////////////////////////////
    // AUTH
    ////////////////////////////////////////////////////////////

    const authResult = await requireAdmin();

    if (authResult.error) {
      return authResult.error;
    }

    ////////////////////////////////////////////////////////////
    // PARAMS
    ////////////////////////////////////////////////////////////

    const { courseId } = await params;

    if (!courseId) {
      return NextResponse.json(
        {
          error: "Course ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // BODY
    ////////////////////////////////////////////////////////////

    const body = await req.json();

    const supabase = createSupabaseAdmin();

    ////////////////////////////////////////////////////////////
    // CHECK COURSE
    ////////////////////////////////////////////////////////////

    const { data: existingCourse, error: existingError } = await supabase
      .from("academy_courses")
      .select("*")
      .eq("id", courseId)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (!existingCourse) {
      return NextResponse.json(
        {
          error: "Academy course not found.",
        },
        {
          status: 404,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // ACCEPTED FIELDS
    ////////////////////////////////////////////////////////////

    const {
      course_code,
      title,
      slug,
      description,
      thumbnail_path,
      duration_minutes,
      status,
      sort_order,
    } = body;

    const updates = {};

    ////////////////////////////////////////////////////////////
    // TITLE
    ////////////////////////////////////////////////////////////

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return NextResponse.json(
          {
            error: "Course title cannot be empty.",
          },
          {
            status: 400,
          },
        );
      }

      updates.title = title.trim();
    }

    ////////////////////////////////////////////////////////////
    // COURSE CODE
    ////////////////////////////////////////////////////////////

    if (course_code !== undefined) {
      if (typeof course_code !== "string" || !course_code.trim()) {
        return NextResponse.json(
          {
            error: "Course code cannot be empty.",
          },
          {
            status: 400,
          },
        );
      }

      updates.course_code = course_code.trim().toUpperCase();
    }

    ////////////////////////////////////////////////////////////
    // SLUG
    ////////////////////////////////////////////////////////////

    if (slug !== undefined) {
      if (typeof slug !== "string" || !slug.trim()) {
        return NextResponse.json(
          {
            error: "Course slug cannot be empty.",
          },
          {
            status: 400,
          },
        );
      }

      updates.slug = slugify(slug, {
        lower: true,
        strict: true,
        trim: true,
      });
    }

    ////////////////////////////////////////////////////////////
    // DESCRIPTION
    ////////////////////////////////////////////////////////////

    if (description !== undefined) {
      updates.description =
        typeof description === "string" ? description.trim() || null : null;
    }

    ////////////////////////////////////////////////////////////
    // THUMBNAIL
    ////////////////////////////////////////////////////////////

    if (thumbnail_path !== undefined) {
      updates.thumbnail_path =
        typeof thumbnail_path === "string"
          ? thumbnail_path.trim() || null
          : null;
    }

    ////////////////////////////////////////////////////////////
    // DURATION
    ////////////////////////////////////////////////////////////

    if (duration_minutes !== undefined) {
      if (duration_minutes === null || duration_minutes === "") {
        updates.duration_minutes = null;
      } else {
        const duration = Number(duration_minutes);

        if (!Number.isInteger(duration) || duration < 0) {
          return NextResponse.json(
            {
              error: "Duration must be a valid non-negative integer.",
            },
            {
              status: 400,
            },
          );
        }

        updates.duration_minutes = duration;
      }
    }

    ////////////////////////////////////////////////////////////
    // STATUS
    ////////////////////////////////////////////////////////////

    if (status !== undefined) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return NextResponse.json(
          {
            error:
              "Invalid course status. Allowed values are draft, published, and archived.",
          },
          {
            status: 400,
          },
        );
      }

      updates.status = status;
    }

    ////////////////////////////////////////////////////////////
    // SORT ORDER
    ////////////////////////////////////////////////////////////

    if (sort_order !== undefined) {
      const order = Number(sort_order);

      if (!Number.isInteger(order) || order < 0) {
        return NextResponse.json(
          {
            error: "Sort order must be a non-negative integer.",
          },
          {
            status: 400,
          },
        );
      }

      updates.sort_order = order;
    }

    ////////////////////////////////////////////////////////////
    // NOTHING TO UPDATE
    ////////////////////////////////////////////////////////////

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        success: true,
        message: "No changes were supplied.",
        course: existingCourse,
      });
    }

    ////////////////////////////////////////////////////////////
    // DUPLICATE COURSE CODE
    ////////////////////////////////////////////////////////////

    if (updates.course_code) {
      const { data: duplicateCode, error: duplicateCodeError } = await supabase
        .from("academy_courses")
        .select("id")
        .eq("course_code", updates.course_code)
        .neq("id", courseId)
        .maybeSingle();

      if (duplicateCodeError) {
        throw duplicateCodeError;
      }

      if (duplicateCode) {
        return NextResponse.json(
          {
            error: "Another academy course already uses this course code.",
          },
          {
            status: 409,
          },
        );
      }
    }

    ////////////////////////////////////////////////////////////
    // DUPLICATE SLUG
    ////////////////////////////////////////////////////////////

    if (updates.slug) {
      const { data: duplicateSlug, error: duplicateSlugError } = await supabase
        .from("academy_courses")
        .select("id")
        .eq("slug", updates.slug)
        .neq("id", courseId)
        .maybeSingle();

      if (duplicateSlugError) {
        throw duplicateSlugError;
      }

      if (duplicateSlug) {
        return NextResponse.json(
          {
            error: "Another academy course already uses this slug.",
          },
          {
            status: 409,
          },
        );
      }
    }

    ////////////////////////////////////////////////////////////
    // UPDATE
    ////////////////////////////////////////////////////////////

    updates.updated_at = new Date().toISOString();

    const { data: updatedCourse, error: updateError } = await supabase
      .from("academy_courses")
      .update(updates)
      .eq("id", courseId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    ////////////////////////////////////////////////////////////
    // RESPONSE
    ////////////////////////////////////////////////////////////

    return NextResponse.json({
      success: true,

      message: "Academy course updated successfully.",

      course: updatedCourse,
    });
  } catch (error) {
    console.error("PATCH /api/admin/academy/courses/[courseId] error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Failed to update academy course.",
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
    ////////////////////////////////////////////////////////////
    // AUTH
    ////////////////////////////////////////////////////////////

    const authResult = await requireAdmin();

    if (authResult.error) {
      return authResult.error;
    }

    ////////////////////////////////////////////////////////////
    // PARAMS
    ////////////////////////////////////////////////////////////

    const { courseId } = await params;

    if (!courseId) {
      return NextResponse.json(
        {
          error: "Course ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // SUPABASE
    ////////////////////////////////////////////////////////////

    const supabase = createSupabaseAdmin();

    ////////////////////////////////////////////////////////////
    // CHECK COURSE
    ////////////////////////////////////////////////////////////

    const { data: course, error: courseError } = await supabase
      .from("academy_courses")
      .select(
        `
          id,
          course_code,
          title,
          status
        `,
      )
      .eq("id", courseId)
      .maybeSingle();

    if (courseError) {
      throw courseError;
    }

    if (!course) {
      return NextResponse.json(
        {
          error: "Academy course not found.",
        },
        {
          status: 404,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // DELETE COURSE
    //
    // academy_course_modules has ON DELETE CASCADE.
    //
    // academy_module_videos has:
    //
    // module_id → academy_course_modules(id)
    // ON DELETE CASCADE
    //
    // Therefore deleting the course will cascade:
    //
    // academy_courses
    //      ↓
    // academy_course_modules
    //      ↓
    // academy_module_videos
    //
    ////////////////////////////////////////////////////////////

    const { error: deleteError } = await supabase
      .from("academy_courses")
      .delete()
      .eq("id", courseId);

    if (deleteError) {
      throw deleteError;
    }

    ////////////////////////////////////////////////////////////
    // RESPONSE
    ////////////////////////////////////////////////////////////

    return NextResponse.json({
      success: true,

      message:
        "Academy course and its associated content were deleted successfully.",

      deletedCourse: {
        id: course.id,
        course_code: course.course_code,
        title: course.title,
      },
    });
  } catch (error) {
    console.error("DELETE /api/admin/academy/courses/[courseId] error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Failed to delete academy course.",
      },
      {
        status: 500,
      },
    );
  }
}
