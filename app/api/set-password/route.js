import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req) {
  try {
    const { token, password } = await req.json();

    //--------------------------------------------------
    // Validation
    //--------------------------------------------------

    if (!token) {
      return NextResponse.json(
        {
          error: "Invitation token is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        {
          error: "Password must be at least 8 characters long.",
        },
        {
          status: 400,
        },
      );
    }

    //--------------------------------------------------
    // Supabase
    //--------------------------------------------------

    const supabase = createSupabaseAdmin();

    //--------------------------------------------------
    // Load invitation
    //--------------------------------------------------

    const { data: invite, error: inviteError } = await supabase
      .from("user_invites")
      .select("*")
      .eq("invite_token", token)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        {
          error: "Invalid invitation link.",
        },
        {
          status: 404,
        },
      );
    }

    //--------------------------------------------------
    // Status check
    //--------------------------------------------------

    if (invite.status !== "pending") {
      return NextResponse.json(
        {
          error: "This invitation has already been used.",
        },
        {
          status: 409,
        },
      );
    }

    //--------------------------------------------------
    // Expiration
    //--------------------------------------------------

    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        {
          error: "This invitation has expired.",
        },
        {
          status: 410,
        },
      );
    }

    //--------------------------------------------------
    // Verify user exists
    //--------------------------------------------------

    const { data: user, error: userLookupError } = await supabase
      .from("users")
      .select("id")
      .eq("id", invite.user_id)
      .single();

    if (userLookupError || !user) {
      return NextResponse.json(
        {
          error: "User account no longer exists.",
        },
        {
          status: 404,
        },
      );
    }

    //--------------------------------------------------
    // Hash password
    //--------------------------------------------------

    const passwordHash = await bcrypt.hash(password, 12);

    //--------------------------------------------------
    // Update user
    //--------------------------------------------------

    const { error: updateUserError } = await supabase
      .from("users")
      .update({
        password_hash: passwordHash,
        account_status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", invite.user_id);

    if (updateUserError) {
      throw updateUserError;
    }

    //--------------------------------------------------
    // Mark invitation as used
    //--------------------------------------------------

    const { error: updateInviteError } = await supabase
      .from("user_invites")
      .update({
        status: "used",
        used_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", invite.id);

    if (updateInviteError) {
      throw updateInviteError;
    }

    //--------------------------------------------------
    // Success
    //--------------------------------------------------

    return NextResponse.json({
      success: true,
      message: "Password has been created successfully.",
    });
  } catch (err) {
    console.error("Set Password:", err);

    return NextResponse.json(
      {
        error: err.message || "Unable to set password.",
      },
      {
        status: 500,
      },
    );
  }
}
