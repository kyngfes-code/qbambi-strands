import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const orderId = formData.get("orderId");
  const file = formData.get("receipt");

  if (!orderId || !file) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();

  /* 1️⃣ Upload receipt */
  const filePath = `receipts/${orderId}-${Date.now()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("receipts")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    return NextResponse.json(
      { error: "Failed to upload receipt" },
      { status: 500 }
    );
  }

  const { data: publicUrl } = supabase.storage
    .from("receipts")
    .getPublicUrl(filePath);

  /* 2️⃣ Update order */
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: "awaiting_confirmation",
      receipt_url: publicUrl.publicUrl,
    })
    .eq("id", orderId)
    .eq("user_id", session.user.id);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }

  /* 3️⃣ Notify admin (DB-based notification) */
  await supabase.from("admin_notifications").insert({
    type: "receipt_uploaded",
    order_id: orderId,
    message: "New payment receipt uploaded",
  });

  return NextResponse.json({ success: true });
}
