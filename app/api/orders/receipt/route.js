import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { auth } from "@/lib/auth";

export async function POST(req) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const orderId = formData.get("orderId");
  const file = formData.get("receipt");

  const supabase = createSupabaseAdmin();

  const filePath = `receipts/${orderId}-${Date.now()}.png`;

  const { error: uploadError } = await supabase.storage
    .from("receipts")
    .upload(filePath, file);

  if (uploadError) {
    return NextResponse.json({ error: uploadError }, { status: 400 });
  }

  const { data } = supabase.storage.from("receipts").getPublicUrl(filePath);

  await supabase
    .from("orders")
    .update({
      payment_method: "bank_transfer",
      receipt_url: data.publicUrl,
      status: "awaiting_confirmation",
    })
    .eq("id", orderId);

  return NextResponse.json({ success: true });
}
