import { NextResponse } from "next/server";
import crypto from "crypto";

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
// Creates the Bunny video object and returns temporary
// TUS upload credentials.
//
// IMPORTANT:
// The Bunny API key NEVER leaves the server.
// ////////////////////////////////////////////////////////////

export async function POST(req, { params }) {
  try {
    //////////////////////////////////////////////////////////
    // AUTH
    //////////////////////////////////////////////////////////

    const authResult = await requireAdmin();

    if (authResult.error) {
      return authResult.error;
    }

    //////////////////////////////////////////////////////////
    // PARAMS
    //////////////////////////////////////////////////////////

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

    //////////////////////////////////////////////////////////
    // ENV
    //////////////////////////////////////////////////////////

    const bunnyApiKey = process.env.BUNNY_STREAM_API_KEY;
    const bunnyLibraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
    const bunnyCdnHostname = process.env.BUNNY_CDN_HOSTNAME;

    if (!bunnyApiKey || !bunnyLibraryId) {
      console.error("Bunny Stream environment variables are missing.");

      return NextResponse.json(
        {
          error: "Bunny Stream is not configured on the server.",
        },
        {
          status: 500,
        },
      );
    }

    //////////////////////////////////////////////////////////
    // BODY
    //////////////////////////////////////////////////////////

    const body = await req.json();

    const { title, fileName } = body;

    //////////////////////////////////////////////////////////
    // VALIDATE TITLE
    //////////////////////////////////////////////////////////

    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        {
          error: "Video title is required.",
        },
        {
          status: 400,
        },
      );
    }

    //////////////////////////////////////////////////////////
    // SUPABASE
    //////////////////////////////////////////////////////////

    const supabase = createSupabaseAdmin();

    //////////////////////////////////////////////////////////
    // VERIFY COURSE
    //////////////////////////////////////////////////////////

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

    //////////////////////////////////////////////////////////
    // VERIFY MODULE
    //////////////////////////////////////////////////////////

    const { data: module, error: moduleError } = await supabase
      .from("academy_course_modules")
      .select(
        `
          id,
          course_id,
          module_code,
          title,
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
          error: "Module not found for this course.",
        },
        {
          status: 404,
        },
      );
    }

    //////////////////////////////////////////////////////////
    // CREATE BUNNY VIDEO OBJECT
    //////////////////////////////////////////////////////////

    const bunnyResponse = await fetch(
      `https://video.bunnycdn.com/library/${bunnyLibraryId}/videos`,
      {
        method: "POST",

        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          AccessKey: bunnyApiKey,
        },

        body: JSON.stringify({
          title: title.trim(),
        }),
      },
    );

    const bunnyText = await bunnyResponse.text();

    let bunnyData;

    try {
      bunnyData = bunnyText ? JSON.parse(bunnyText) : null;
    } catch {
      bunnyData = null;
    }

    if (!bunnyResponse.ok) {
      console.error(
        "Bunny create video failed:",
        bunnyResponse.status,
        bunnyText,
      );

      return NextResponse.json(
        {
          error:
            bunnyData?.message || "Failed to create video in Bunny Stream.",
        },
        {
          status: 502,
        },
      );
    }

    //////////////////////////////////////////////////////////
    // BUNNY VIDEO ID
    //////////////////////////////////////////////////////////

    const videoId = bunnyData?.guid;

    if (!videoId) {
      console.error("Bunny response did not contain a video GUID.");

      return NextResponse.json(
        {
          error: "Bunny did not return a video ID.",
        },
        {
          status: 502,
        },
      );
    }

    //////////////////////////////////////////////////////////
    // TUS EXPIRATION
    //
    // 24 hours.
    //////////////////////////////////////////////////////////

    const expirationTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

    //////////////////////////////////////////////////////////
    // TUS SIGNATURE
    //
    // Bunny requires:
    //
    // libraryId + apiKey + expirationTime + videoId
    //
    //////////////////////////////////////////////////////////

    const signature = crypto
      .createHash("sha256")
      .update(`${bunnyLibraryId}${bunnyApiKey}${expirationTime}${videoId}`)
      .digest("hex");

    //////////////////////////////////////////////////////////
    // RESPONSE
    //////////////////////////////////////////////////////////

    return NextResponse.json({
      success: true,

      videoId,

      libraryId: bunnyLibraryId,

      expirationTime,

      signature,

      endpoint: "https://video.bunnycdn.com/tusupload",

      embedUrl: `https://iframe.mediadelivery.net/embed/${bunnyLibraryId}/${videoId}`,

      cdnUrl: bunnyCdnHostname
        ? `https://${bunnyCdnHostname}/${videoId}/playlist.m3u8`
        : null,

      course,

      module,

      fileName: fileName || null,
    });
  } catch (error) {
    console.error("POST academy Bunny upload credentials error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to prepare Bunny video upload.",
      },
      {
        status: 500,
      },
    );
  }
}
