import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

import slugify from "slugify";

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
// MODULE CODE
//////////////////////////////////////////////////////////////

function generateModuleCode(courseCode, title) {
  const coursePrefix = String(courseCode || "COURSE")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 8)
    .toUpperCase();

  const titlePrefix = slugify(title || "module", {
    lower: false,
    strict: true,
    trim: true,
  })
    .replace(/-/g, "")
    .slice(0, 8)
    .toUpperCase();

  const random = Math.floor(1000 + Math.random() * 9000);

  return `${coursePrefix}-${titlePrefix}-${random}`;
}

//////////////////////////////////////////////////////////////
// GET
//
// GET /api/admin/academy/courses/[courseId]/modules
//
// Returns:
// - course
// - modules
// - videos belonging to each module
//////////////////////////////////////////////////////////////

export async function GET(req, { params }) {
  try {
    const authResult = await requireAdmin();

    if (authResult.error) {
      return authResult.error;
    }

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

    const supabase = createSupabaseAdmin();

    ////////////////////////////////////////////////////////////
    // 1. VERIFY COURSE
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
    // 2. FETCH MODULES
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
      })
      .order("created_at", {
        ascending: true,
      });

    if (modulesError) {
      throw modulesError;
    }

    const moduleList = modules || [];

    ////////////////////////////////////////////////////////////
    // 3. FETCH MODULE VIDEOS
    //
    // IMPORTANT:
    //
    // Videos no longer contain course_id.
    //
    // Their course is determined through:
    //
    // academy_module_videos
    //        ↓
    // academy_course_modules
    //        ↓
    // academy_courses
    //
    ////////////////////////////////////////////////////////////

    const moduleIds = moduleList.map((module) => module.id).filter(Boolean);

    let videos = [];

    if (moduleIds.length > 0) {
      const { data: videoData, error: videosError } = await supabase
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
        })
        .order("created_at", {
          ascending: true,
        });

      if (videosError) {
        throw videosError;
      }

      videos = videoData || [];
    }

    ////////////////////////////////////////////////////////////
    // 4. GROUP VIDEOS BY MODULE
    ////////////////////////////////////////////////////////////

    const videosByModule = new Map();

    for (const video of videos) {
      if (!videosByModule.has(video.module_id)) {
        videosByModule.set(video.module_id, []);
      }

      videosByModule.get(video.module_id).push({
        ...video,

        // Compatibility-friendly camelCase values.
        moduleId: video.module_id,
        durationSeconds: video.duration_seconds,
        sortOrder: video.sort_order,
        bunnyVideoId: video.bunny_video_id,
        thumbnailUrl: video.thumbnail_url,
      });
    }

    ////////////////////////////////////////////////////////////
    // 5. ATTACH VIDEOS TO MODULES
    ////////////////////////////////////////////////////////////

    const modulesWithVideos = moduleList.map((module) => ({
      ...module,

      videos: videosByModule.get(module.id) || [],

      videoCount: (videosByModule.get(module.id) || []).length,
    }));

    ////////////////////////////////////////////////////////////
    // 6. RESPONSE
    ////////////////////////////////////////////////////////////

    return NextResponse.json({
      success: true,

      course,

      modules: modulesWithVideos,

      count: modulesWithVideos.length,

      videoCount: videos.length,
    });
  } catch (error) {
    console.error("GET academy modules error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Failed to fetch academy course modules.",
      },
      {
        status: 500,
      },
    );
  }
}

//////////////////////////////////////////////////////////////
// POST
//
// POST /api/admin/academy/courses/[courseId]/modules
//
// Creates a module.
//
// NOTE:
// Videos are now separate records in academy_module_videos.
// This endpoint only creates the module.
//////////////////////////////////////////////////////////////

export async function POST(req, { params }) {
  try {
    const authResult = await requireAdmin();

    if (authResult.error) {
      return authResult.error;
    }

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

    const body = await req.json();

    const {
      module_code,
      title,
      description,
      sort_order = 0,
      status = "draft",
    } = body;

    const supabase = createSupabaseAdmin();

    ////////////////////////////////////////////////////////////
    // 1. VERIFY COURSE
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
    // 2. VALIDATE TITLE
    ////////////////////////////////////////////////////////////

    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        {
          error: "Module title is required.",
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 3. VALIDATE STATUS
    ////////////////////////////////////////////////////////////

    if (!ALLOWED_STATUSES.includes(status)) {
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

    ////////////////////////////////////////////////////////////
    // 4. VALIDATE SORT ORDER
    ////////////////////////////////////////////////////////////

    const parsedSortOrder = Number(sort_order);

    if (!Number.isInteger(parsedSortOrder) || parsedSortOrder < 0) {
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
    // 5. GENERATE / NORMALIZE MODULE CODE
    ////////////////////////////////////////////////////////////

    let finalModuleCode =
      typeof module_code === "string" && module_code.trim()
        ? module_code.trim().toUpperCase()
        : generateModuleCode(course.course_code, title);

    ////////////////////////////////////////////////////////////
    // 6. CHECK MODULE CODE
    ////////////////////////////////////////////////////////////

    const { data: existingCode, error: codeError } = await supabase
      .from("academy_course_modules")
      .select("id")
      .eq("module_code", finalModuleCode)
      .maybeSingle();

    if (codeError) {
      throw codeError;
    }

    ////////////////////////////////////////////////////////////
    // 7. HANDLE DUPLICATE GENERATED CODE
    ////////////////////////////////////////////////////////////

    if (existingCode && !module_code) {
      let attempts = 0;

      while (attempts < 10) {
        const candidate = generateModuleCode(course.course_code, title);

        const { data: candidateExists, error: candidateError } = await supabase
          .from("academy_course_modules")
          .select("id")
          .eq("module_code", candidate)
          .maybeSingle();

        if (candidateError) {
          throw candidateError;
        }

        if (!candidateExists) {
          finalModuleCode = candidate;
          break;
        }

        attempts++;
      }

      if (attempts >= 10) {
        return NextResponse.json(
          {
            error: "Unable to generate a unique module code. Please try again.",
          },
          {
            status: 500,
          },
        );
      }
    }

    ////////////////////////////////////////////////////////////
    // 8. EXPLICIT DUPLICATE MODULE CODE
    ////////////////////////////////////////////////////////////

    if (existingCode && module_code) {
      return NextResponse.json(
        {
          error: "A module with this module code already exists.",
        },
        {
          status: 409,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 9. CHECK DUPLICATE SORT ORDER IN THIS COURSE
    //
    // academy_course_modules should normally have a unique
    // sort order per course.
    ////////////////////////////////////////////////////////////

    const { data: duplicateSortOrder, error: sortOrderError } = await supabase
      .from("academy_course_modules")
      .select("id")
      .eq("course_id", courseId)
      .eq("sort_order", parsedSortOrder)
      .maybeSingle();

    if (sortOrderError) {
      throw sortOrderError;
    }

    if (duplicateSortOrder) {
      return NextResponse.json(
        {
          error: "Another module already uses this sort order in this course.",
        },
        {
          status: 409,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // 10. INSERT MODULE
    ////////////////////////////////////////////////////////////

    const { data: module, error: insertError } = await supabase
      .from("academy_course_modules")
      .insert({
        course_id: courseId,

        module_code: finalModuleCode,

        title: title.trim(),

        description:
          typeof description === "string" && description.trim()
            ? description.trim()
            : null,

        sort_order: parsedSortOrder,

        status,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    ////////////////////////////////////////////////////////////
    // 11. RESPONSE
    ////////////////////////////////////////////////////////////

    return NextResponse.json(
      {
        success: true,

        message: "Academy course module created successfully.",

        module: {
          ...module,

          videos: [],

          videoCount: 0,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("POST academy module error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Failed to create academy course module.",
      },
      {
        status: 500,
      },
    );
  }
}
