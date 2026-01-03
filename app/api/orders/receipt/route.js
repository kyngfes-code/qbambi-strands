import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req) {
  try {
    console.time("receipt");

    /* 1️⃣ Auth */
    const session = await auth();
    if (!session?.user?.id) {
      console.timeEnd("receipt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* 2️⃣ Form data */
    const formData = await req.formData();
    const orderId = formData.get("orderId");
    const instalmentId = formData.get("instalmentId"); // optional
    const file = formData.get("receipt");

    if (!orderId || !file) {
      console.timeEnd("receipt");
      return NextResponse.json(
        { error: "Missing orderId or receipt" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();

    /* 3️⃣ Upload file */
    const filePath = instalmentId
      ? `receipts/instalments/${orderId}-${instalmentId}-${Date.now()}`
      : `receipts/orders/${orderId}-${Date.now()}`;

    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error(uploadError);
      console.timeEnd("receipt");
      return NextResponse.json(
        { error: "Receipt upload failed" },
        { status: 500 }
      );
    }

    /* 4️⃣ Signed URL (PRIVATE BUCKET SAFE) */
    const { data: signed, error: signedError } = await supabase.storage
      .from("receipts")
      .createSignedUrl(filePath, 60 * 60 * 24 * 30);

    if (signedError || !signed?.signedUrl) {
      console.error(signedError);
      console.timeEnd("receipt");
      return NextResponse.json(
        { error: "Failed to generate receipt URL" },
        { status: 500 }
      );
    }

    /* 5️⃣ Update order */
    const { error: orderError } = await supabase
      .from("orders")
      .update({
        status: "awaiting_confirmation",
        receipt_url: signed.signedUrl,
      })
      .eq("id", orderId)
      .eq("user_id", session.user.id);

    if (orderError) {
      console.error(orderError);
      console.timeEnd("receipt");
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 }
      );
    }

    /* 6️⃣ Update instalment (if applicable) */
    if (instalmentId) {
      const { error: instalmentError } = await supabase
        .from("instalments")
        .update({
          receipt_url: signed.signedUrl,
          status: "awaiting_confirmation",
        })
        .eq("id", instalmentId);

      if (instalmentError) {
        console.error(instalmentError);
        console.timeEnd("receipt");
        return NextResponse.json(
          { error: "Failed to update instalment" },
          { status: 500 }
        );
      }
    }

    /* 7️⃣ Admin notification */
    await supabase.from("admin_notifications").insert({
      type: "receipt_uploaded",
      order_id: orderId,
      instalment_id: instalmentId ?? null,
      message: instalmentId
        ? "Instalment receipt uploaded"
        : "Order receipt uploaded",
    });

    console.timeEnd("receipt");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Receipt handler crashed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
