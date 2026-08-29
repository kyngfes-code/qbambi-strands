import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
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

    // Adjust this if your session uses a different admin property.
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
    // 3. Supabase
    // ============================================================

    const supabase = createSupabaseAdmin();

    // ============================================================
    // 4. Load email outbox
    // ============================================================

    const { data, error } = await supabase
      .from("email_outbox")
      .select(
        `
          id,
          to_email,
          subject,
          email_type,
          status,
          attempts,
          last_error,
          sent_at,
          next_attempt_at,
          created_at,
          updated_at,
          provider_message_id
        `,
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Admin email outbox lookup failed:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Unable to load email outbox.",
          details: error.message,
        },
        { status: 500 },
      );
    }

    // ============================================================
    // 5. Return
    // ============================================================

    return NextResponse.json({
      success: true,
      emails: data || [],
    });
  } catch (error) {
    console.error("Admin email outbox fatal error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unable to load email outbox.",
      },
      { status: 500 },
    );
  }
}
