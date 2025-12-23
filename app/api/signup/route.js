import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { signupSchema } from "@/lib/validations/signupSchema";

export async function POST(req) {
  const body = await req.json();

  /* ---------------------------
     Validate input
  ---------------------------- */
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { firstName, lastName, phone, email, password, street, city, state } =
    parsed.data;
  const fullName = `${firstName} ${lastName}`;

  const supabase = createSupabaseAdmin();

  /* ---------------------------
     Check if user already exists
     (auth.users is the source of truth)
  ---------------------------- */
  const { data: existingUser } = await supabase
    .from("auth.users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingUser) {
    return NextResponse.json(
      { error: "User with this email already exists" },
      { status: 409 } // Conflict
    );
  }

  /* ---------------------------
     Create auth user
  ---------------------------- */
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data?.user) {
    return NextResponse.json(
      { error: error?.message || "User creation failed" },
      { status: 400 }
    );
  }

  /* ---------------------------
     Insert into public.users
  ---------------------------- */
  const { error: profileError } = await supabase.from("users").insert({
    id: data.user.id,
    email,
    name: fullName,
    phone,
    role: "user",
  });

  if (profileError) {
    return NextResponse.json(
      { error: "User created but profile insert failed" },
      { status: 500 }
    );
  }

  /* ---------------------------
   Insert default address
---------------------------- */
  const { error: addressError } = await supabase.from("addresses").insert({
    user_id: data.user.id,
    full_name: fullName,
    phone,
    street,
    city,
    state,
    country: "Nigeria",
    is_default: true,
  });

  if (addressError) {
    return NextResponse.json(
      { error: "User created but address insert failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
