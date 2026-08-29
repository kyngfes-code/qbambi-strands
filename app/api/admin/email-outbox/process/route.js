import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  try {
    // ============================================================
    // 1. Authenticate admin
    // ============================================================

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    // ============================================================
    // 2. Verify admin
    // ============================================================

    const isAdmin =
      session.user.role === "admin" ||
      session.user.isAdmin === true ||
      session.user.email === process.env.ADMIN_EMAIL;

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden.",
        },
        { status: 403 },
      );
    }

    // ============================================================
    // 3. Validate worker secret
    // ============================================================

    const workerSecret = process.env.EMAIL_WORKER_SECRET;

    if (!workerSecret) {
      console.error(
        "Email process endpoint: EMAIL_WORKER_SECRET is not configured.",
      );

      return NextResponse.json(
        {
          success: false,
          error: "Email worker is not configured.",
        },
        { status: 500 },
      );
    }

    // ============================================================
    // 4. Determine application URL
    // ============================================================

    const appUrl =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    // ============================================================
    // 5. Call email worker
    // ============================================================

    const workerUrl = `${appUrl.replace(/\/$/, "")}/api/email-worker`;

    console.log("Admin requested email worker:", {
      admin: session.user.email,
      workerUrl,
    });

    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${workerSecret}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    // ============================================================
    // 6. Safely parse worker response
    // ============================================================

    const responseText = await response.text();

    let data = {};

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = {
        error: responseText || "Email worker returned an invalid response.",
      };
    }

    // ============================================================
    // 7. Worker failed
    // ============================================================

    if (!response.ok) {
      console.error("Email worker returned an error:", {
        status: response.status,
        data,
      });

      return NextResponse.json(
        {
          success: false,
          error: data?.error || "Email worker failed.",
          workerStatus: response.status,
          workerResponse: data,
        },
        {
          status: response.status >= 500 ? 500 : response.status,
        },
      );
    }

    // ============================================================
    // 8. Worker succeeded
    // ============================================================

    return NextResponse.json({
      success: true,
      message: "Email worker processed successfully.",

      processed: data?.processed ?? 0,
      claimed: data?.claimed ?? 0,
      sent: data?.sent ?? 0,
      retried: data?.retried ?? 0,
      failed: data?.failed ?? 0,
      skipped: data?.skipped ?? 0,
      recovered: data?.recovered ?? 0,

      testMode: data?.testMode ?? false,
      testRecipient: data?.testRecipient ?? null,

      results: data?.results ?? [],
    });
  } catch (error) {
    console.error("Admin email process endpoint failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unable to process email queue.",
      },
      { status: 500 },
    );
  }
}
