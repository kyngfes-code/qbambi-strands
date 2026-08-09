import { NextResponse } from "next/server";

import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req) {
  const supabase = createSupabaseAdmin();

  try {
    //--------------------------------------------------
    // Read Token
    //--------------------------------------------------

    const { searchParams } = new URL(req.url);

    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/verify-email?status=invalid", req.url),
      );
    }

    //--------------------------------------------------
    // Find Token
    //--------------------------------------------------

    const { data: verification, error } = await supabase
      .from("email_verification_tokens")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!verification) {
      return NextResponse.redirect(
        new URL("/verify-email?status=invalid", req.url),
      );
    }

    //--------------------------------------------------
    // Already Used
    //--------------------------------------------------

    if (verification.used_at) {
      return NextResponse.redirect(
        new URL("/verify-email?status=used", req.url),
      );
    }

    //--------------------------------------------------
    // Expired
    //--------------------------------------------------

    const now = new Date();

    const expires = new Date(verification.expires_at);

    if (expires < now) {
      return NextResponse.redirect(
        new URL("/verify-email?status=expired", req.url),
      );
    }

    //--------------------------------------------------
    // Update User
    //--------------------------------------------------

    const { error: updateUserError } = await supabase
      .from("users")
      .update({
        email_verified: true,

        account_status: "active",

        updated_at: new Date().toISOString(),
      })
      .eq("id", verification.user_id);

    if (updateUserError) {
      throw updateUserError;
    }

    //--------------------------------------------------
    // Mark Token Used
    //--------------------------------------------------

    const { error: tokenError } = await supabase
      .from("email_verification_tokens")
      .update({
        used_at: new Date().toISOString(),
      })
      .eq("id", verification.id);

    if (tokenError) {
      throw tokenError;
    }

    //--------------------------------------------------
    // Redirect
    //--------------------------------------------------

    return NextResponse.redirect(
      new URL("/verify-email?status=success", req.url),
    );
  } catch (err) {
    console.error("VERIFY EMAIL ERROR");
    console.error(err);

    return NextResponse.redirect(
      new URL("/verify-email?status=error", req.url),
    );
  }
}
