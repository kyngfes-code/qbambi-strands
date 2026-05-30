import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req, { params }) {
  const { id } = await params;

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
        users (
      id,
      name,
      email
    ),
      order_items (
        id,
        quantity,
        price,
        store (
          id,
          title,
          image,
          price
        )
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}
