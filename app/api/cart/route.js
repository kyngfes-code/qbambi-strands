// app/api/cart/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const session = await auth();
  console.log("session", session);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("carts")
    .select(
      `
      id,
      quantity,
      price,
      store (
        id,
        title,
        image
      )
    `
    )
    .eq("user_id", session.user.id);

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function POST(req) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { storeId } = await req.json();

  if (!storeId) {
    return NextResponse.json({ error: "storeId is required" }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();

  const { error } = await supabase.from("carts").upsert(
    {
      user_id: session.user.id,
      store_id: storeId,
      quantity: 1,
    },
    { onConflict: "user_id,store_id" }
  );

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  const supabase = createSupabaseAdmin();

  const { error } = await supabase
    .from("carts")
    .delete()
    .eq("id", id)
    .eq("user_id", session.user.id);

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

//update qty
export async function PATCH(req) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, quantity } = await req.json();

  if (!id || typeof quantity !== "number") {
    return NextResponse.json(
      { error: "id and quantity are required" },
      { status: 400 }
    );
  }

  if (quantity < 1) {
    return NextResponse.json(
      { error: "quantity must be at least 1" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdmin();

  const { error } = await supabase
    .from("carts")
    .update({ quantity })
    .eq("id", id)
    .eq("user_id", session.user.id);

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
