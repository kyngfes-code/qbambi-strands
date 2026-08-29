import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

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
// POST
//
// POST /api/admin/academy/courses/[courseId]/modules/reorder
//
// Expected body:
//
// {
//   "modules": [
//     {
//       "id": "module-uuid-1",
//       "sort_order": 1
//     },
//     {
//       "id": "module-uuid-2",
//       "sort_order": 2
//     }
//   ]
// }
//////////////////////////////////////////////////////////////

export async function POST(req, { params }) {
  try {
    ////////////////////////////////////////////////////////////
    // AUTH
    ////////////////////////////////////////////////////////////

    const adminCheck = await requireAdmin();

    if (adminCheck.error) {
      return adminCheck.error;
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

    const modules = body?.modules;

    if (!Array.isArray(modules)) {
      return NextResponse.json(
        {
          error: "Modules must be provided as an array.",
        },
        {
          status: 400,
        },
      );
    }

    if (modules.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No modules to reorder.",
        modules: [],
      });
    }

    ////////////////////////////////////////////////////////////
    // VALIDATE MODULE IDS
    ////////////////////////////////////////////////////////////

    const normalizedModules = modules.map((module, index) => {
      if (!module?.id) {
        throw new Error(`Module at position ${index + 1} is missing an ID.`);
      }

      return {
        id: module.id,
        sort_order:
          module.sort_order !== undefined
            ? Number(module.sort_order)
            : index + 1,
      };
    });

    ////////////////////////////////////////////////////////////
    // VALIDATE SORT ORDER
    ////////////////////////////////////////////////////////////

    for (const module of normalizedModules) {
      if (!Number.isInteger(module.sort_order) || module.sort_order < 0) {
        return NextResponse.json(
          {
            error: `Invalid sort order for module ${module.id}.`,
          },
          {
            status: 400,
          },
        );
      }
    }

    ////////////////////////////////////////////////////////////
    // SUPABASE
    ////////////////////////////////////////////////////////////

    const supabase = createSupabaseAdmin();

    ////////////////////////////////////////////////////////////
    // VERIFY COURSE
    ////////////////////////////////////////////////////////////

    const { data: course, error: courseError } = await supabase
      .from("academy_courses")
      .select(
        `
          id,
          course_code,
          title,
          slug,
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
          error: "Course not found.",
        },
        {
          status: 404,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // FETCH EXISTING MODULES
    ////////////////////////////////////////////////////////////

    const { data: existingModules, error: existingError } = await supabase
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
      .eq("course_id", courseId);

    if (existingError) {
      throw existingError;
    }

    ////////////////////////////////////////////////////////////
    // VERIFY ALL MODULES BELONG TO COURSE
    ////////////////////////////////////////////////////////////

    const existingModuleIds = new Set(
      (existingModules || []).map((module) => module.id),
    );

    for (const module of normalizedModules) {
      if (!existingModuleIds.has(module.id)) {
        return NextResponse.json(
          {
            error: `Module ${module.id} does not belong to this course.`,
          },
          {
            status: 400,
          },
        );
      }
    }

    ////////////////////////////////////////////////////////////
    // PREVENT PARTIAL REORDER
    //
    // The UI should send every module in the course.
    ////////////////////////////////////////////////////////////

    if (normalizedModules.length !== (existingModules || []).length) {
      return NextResponse.json(
        {
          error: "The reorder request must include every module in the course.",
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // PREVENT DUPLICATE MODULE IDS
    ////////////////////////////////////////////////////////////

    const uniqueModuleIds = new Set(
      normalizedModules.map((module) => module.id),
    );

    if (uniqueModuleIds.size !== normalizedModules.length) {
      return NextResponse.json(
        {
          error: "Duplicate module IDs were supplied.",
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // PREVENT DUPLICATE SORT ORDERS
    ////////////////////////////////////////////////////////////

    const sortOrders = normalizedModules.map((module) => module.sort_order);

    const uniqueSortOrders = new Set(sortOrders);

    if (uniqueSortOrders.size !== sortOrders.length) {
      return NextResponse.json(
        {
          error: "Duplicate module sort orders were supplied.",
        },
        {
          status: 400,
        },
      );
    }

    ////////////////////////////////////////////////////////////
    // UPDATE MODULES
    ////////////////////////////////////////////////////////////

    for (const module of normalizedModules) {
      const { error: updateError } = await supabase
        .from("academy_course_modules")
        .update({
          sort_order: module.sort_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", module.id)
        .eq("course_id", courseId);

      if (updateError) {
        throw updateError;
      }
    }

    ////////////////////////////////////////////////////////////
    // FETCH UPDATED MODULES
    ////////////////////////////////////////////////////////////

    const { data: updatedModules, error: fetchError } = await supabase
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

    if (fetchError) {
      throw fetchError;
    }

    ////////////////////////////////////////////////////////////
    // RESPONSE
    ////////////////////////////////////////////////////////////

    return NextResponse.json({
      success: true,
      message: "Course modules reordered successfully.",
      course,
      modules: updatedModules || [],
    });
  } catch (error) {
    console.error("POST academy module reorder error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to reorder academy course modules.",
      },
      {
        status: 500,
      },
    );
  }
}
