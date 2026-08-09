import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req) {
  try {
    //--------------------------------------------------
    // Request
    //--------------------------------------------------

    const body = await req.json();

    const token = typeof body.token === "string" ? body.token.trim() : "";

    const password = typeof body.password === "string" ? body.password : "";

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

    if (!password) {
      return NextResponse.json(
        {
          error: "Password is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (password.length < 8) {
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
    // Find invitation
    //
    // IMPORTANT:
    // user_invites uses "token", not "invite_token".
    //--------------------------------------------------

    const { data: invite, error: inviteError } = await supabase
      .from("user_invites")
      .select(
        `
          id,
          user_id,
          email,
          token,
          purpose,
          expires_at,
          used_at,
          metadata
        `,
      )
      .eq("token", token)
      .eq("purpose", "account_setup")
      .maybeSingle();

    if (inviteError) {
      console.error("Set Password - Invite lookup:", inviteError);

      return NextResponse.json(
        {
          error: "Unable to verify invitation.",
        },
        {
          status: 500,
        },
      );
    }

    if (!invite) {
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
    // Already used
    //
    // user_invites has no status column.
    // used_at determines whether the invitation
    // has already been consumed.
    //--------------------------------------------------

    if (invite.used_at) {
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

    if (
      !invite.expires_at ||
      new Date(invite.expires_at).getTime() < Date.now()
    ) {
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
    // Verify user
    //--------------------------------------------------

    const { data: user, error: userError } = await supabase
      .from("users")
      .select(
        `
          id,
          email,
          role,
          account_status
        `,
      )
      .eq("id", invite.user_id)
      .maybeSingle();

    if (userError) {
      console.error("Set Password - User lookup:", userError);

      return NextResponse.json(
        {
          error: "Unable to verify student account.",
        },
        {
          status: 500,
        },
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          error: "Student account no longer exists.",
        },
        {
          status: 404,
        },
      );
    }

    //--------------------------------------------------
    // Make sure this is a student account
    //--------------------------------------------------

    if (user.role !== "student") {
      return NextResponse.json(
        {
          error: "This invitation is not valid for a student account.",
        },
        {
          status: 403,
        },
      );
    }

    //--------------------------------------------------
    // Hash password
    //--------------------------------------------------

    const passwordHash = await bcrypt.hash(password, 12);

    //--------------------------------------------------
    // Update password
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

    const usedAt = new Date().toISOString();

    const { error: updateInviteError } = await supabase
      .from("user_invites")
      .update({
        used_at: usedAt,
      })
      .eq("id", invite.id)
      .is("used_at", null);

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
  } catch (error) {
    console.error("Set Password:", error);

    return NextResponse.json(
      {
        error: error.message || "Unable to create your password.",
      },
      {
        status: 500,
      },
    );
  }
}
