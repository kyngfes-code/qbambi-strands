import { NextResponse } from "next/server";
import { z } from "zod";

import { signupSchema } from "@/lib/validations/signupSchema";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

import { hashPassword } from "@/lib/auth/hashPassword";
import { generateVerificationToken } from "@/lib/auth/generateVerificationToken";
import { sendVerificationEmail } from "@/lib/auth/sendVerificationEmail";

export async function POST(req) {
  const supabase = createSupabaseAdmin();

  let createdUserId = null;
  let createdAddressId = null;
  let createdTokenId = null;

  try {
    //--------------------------------------------------
    // Validate Body
    //--------------------------------------------------

    const body = await req.json();

    const values = signupSchema.parse(body);

    //--------------------------------------------------
    // Check existing email
    //--------------------------------------------------

    const { data: existingUser, error: existingError } = await supabase
      .from("users")
      .select("id")
      .eq("email", values.email.toLowerCase())
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingUser) {
      return NextResponse.json(
        {
          error: "An account already exists with this email.",
        },
        {
          status: 409,
        },
      );
    }

    //--------------------------------------------------
    // Hash password
    //--------------------------------------------------

    const passwordHash = await hashPassword(values.password);

    //--------------------------------------------------
    // Create user
    //--------------------------------------------------

    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        first_name: values.firstName,
        middle_name: values.middleName || null,
        last_name: values.lastName,
        name: `${values.firstName} ${values.middleName ?? ""} ${values.lastName}`
          .replace(/\s+/g, " ")
          .trim(),

        email: values.email.toLowerCase(),

        phone: values.phone,

        password_hash: passwordHash,

        role: "user",

        is_admin: false,

        email_verified: false,

        account_status: "pending",
      })
      .select()
      .single();

    if (userError) {
      throw userError;
    }

    createdUserId = user.id;

    //--------------------------------------------------
    // Create default address
    //--------------------------------------------------

    const { data: address, error: addressError } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,

        full_name:
          `${values.firstName} ${values.middleName ?? ""} ${values.lastName}`
            .replace(/\s+/g, " ")
            .trim(),

        phone: values.phone,

        street: values.street,

        city: values.city,

        state: values.state,

        country: values.country,

        landmark: values.landmark || null,

        is_default: true,
      })
      .select()
      .single();

    if (addressError) {
      throw addressError;
    }

    createdAddressId = address.id;

    //--------------------------------------------------
    // Verification Token
    //--------------------------------------------------

    const verification = generateVerificationToken();

    const { data: tokenRecord, error: tokenError } = await supabase
      .from("email_verification_tokens")
      .insert({
        user_id: user.id,

        token: verification.token,

        expires_at: verification.expiresAt,
      })
      .select()
      .single();

    if (tokenError) {
      throw tokenError;
    }

    createdTokenId = tokenRecord.id;

    //--------------------------------------------------
    // Send email
    //--------------------------------------------------

    await sendVerificationEmail({
      email: user.email,

      firstName: user.first_name,

      token: verification.token,
    });

    //--------------------------------------------------

    return NextResponse.json(
      {
        success: true,

        message:
          "Your account has been created successfully. Please verify your email before signing in.",
      },
      {
        status: 201,
      },
    );
  } catch (err) {
    console.error("SIGNUP ERROR");
    console.error(err);

    //--------------------------------------------------
    // Rollback
    //--------------------------------------------------

    if (createdTokenId) {
      await supabase
        .from("email_verification_tokens")
        .delete()
        .eq("id", createdTokenId);
    }

    if (createdAddressId) {
      await supabase.from("addresses").delete().eq("id", createdAddressId);
    }

    if (createdUserId) {
      await supabase.from("users").delete().eq("id", createdUserId);
    }

    //--------------------------------------------------

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed.",

          issues: err.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        error: err.message || "Unable to create account.",
      },
      {
        status: 500,
      },
    );
  }
}
