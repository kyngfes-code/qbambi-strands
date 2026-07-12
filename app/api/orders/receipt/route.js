import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";

export async function POST(req) {
  try {
    console.time("order-receipt");

    /*
    ==========================================
    Authenticate User
    ==========================================
    */

    const session = await auth();

    if (!session?.user?.id) {
      console.timeEnd("order-receipt");

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /*
    ==========================================
    Read Form Data
    ==========================================
    */

    const formData = await req.formData();

    const entityType = formData.get("entityType");
    const entityId = formData.get("entityId");
    const paymentType = formData.get("paymentType");

    const receipt = formData.get("receipt");
    const amount = Number(formData.get("amount"));
    const customerMessage = formData.get("customerMessage");

    if (
      !entityType ||
      !entityId ||
      !paymentType ||
      !receipt ||
      Number.isNaN(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "entityType, entityId, paymentType, receipt and amount are required.",
        },
        { status: 400 },
      );
    }

    console.log({
      entityType,
      entityId,
      paymentType,
      amount,
      userId: session.user.id,
    });

    const supabase = createSupabaseAdmin();

    /*
    ==========================================
    Verify Order Ownership
    ==========================================
    */

    let order;

    if (entityType === "order") {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
      id,
      user_id,
      total_amount,
      receipt_url,
      user:users!orders_user_id_fkey(email)
    `,
        )
        .eq("id", entityId)
        .single();

      console.log({
        orderData: data,
        orderError: error,
      });

      if (error || !data || data.user_id !== session.user.id) {
        return NextResponse.json(
          { error: "Order not found." },
          { status: 404 },
        );
      }

      order = data;
    } else if (entityType === "instalment") {
      const { data, error } = await supabase
        .from("instalments")
        .select(
          `
      id,
      amount,
      payment_plan_id,
      payment_plans(
        order_id,
        orders(
          id,
          user_id,
          user:users(email)
        )
      )
    `,
        )
        .eq("id", entityId)
        .single();

      if (
        error ||
        !data ||
        data.payment_plans.orders.user_id !== session.user.id
      ) {
        return NextResponse.json(
          { error: "Instalment not found." },
          { status: 404 },
        );
      }

      order = data.payment_plans.orders;
    }

    /*
    ==========================================
    Check Existing Transaction
    ==========================================
    */

    const { data: existingTransaction } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .eq("payment_type", paymentType)
      .eq("payment_method", "bank_transfer")
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (existingTransaction?.status === "pending") {
      console.timeEnd("order-receipt");

      return NextResponse.json(
        {
          error: "Payment is already under review.",
        },
        {
          status: 409,
        },
      );
    }

    if (existingTransaction?.status === "verified") {
      console.timeEnd("order-receipt");

      return NextResponse.json(
        {
          error: "Payment has already been confirmed.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    ==========================================
    Upload Receipt
    ==========================================
    */

    const extension = receipt.name?.split(".").pop()?.toLowerCase() || "file";

    const filePath =
      entityType === "instalment"
        ? `instalments/${entityId}-${Date.now()}.${extension}`
        : `orders/${entityId}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(filePath, receipt);

    if (uploadError) {
      throw uploadError;
    }

    /*
    ==========================================
    Signed URL
    ==========================================
    */

    const { data: signed } = await supabase.storage
      .from("receipts")
      .createSignedUrl(filePath, 60 * 60 * 24 * 30);

    /*
    ==========================================
    Update Business Record
    ==========================================
    */

    if (entityType === "instalment") {
      await supabase
        .from("instalments")
        .update({
          receipt_url: signed.signedUrl,
          status: "awaiting_confirmation",
        })
        .eq("id", entityId);
    } else {
      await supabase
        .from("orders")
        .update({
          receipt_url: signed.signedUrl,
          status: "awaiting_confirmation",
        })
        .eq("id", entityId);
    }

    /*
    ==========================================
    Resubmission
    ==========================================
    */

    if (existingTransaction?.status === "failed") {
      await supabase
        .from("payment_transactions")
        .update({
          amount,
          status: "pending",
          updated_at: new Date().toISOString(),
          metadata: {
            uploadedReceipt: true,
            resubmitted: true,
          },
        })
        .eq("id", existingTransaction.id);
    } else {
      await supabase.from("payment_transactions").insert({
        provider: "bank_transfer",

        provider_reference: crypto.randomUUID(),

        entity_type: entityType,

        entity_id: entityId,

        payment_type: paymentType,

        user_id: session.user.id,

        email: order.user.email,

        amount,

        currency: "NGN",

        payment_method: "bank_transfer",

        status: "pending",

        metadata: {
          uploadedReceipt: true,
          receipt_url: signed.signedUrl,
          customerMessage,
        },
      });
    }

    /*
    ==========================================
    Notify Admin
    ==========================================
    */

    await supabase.from("admin_notifications").insert({
      type: "receipt_uploaded",

      order_id: entityType === "order" ? entityId : order.id,
      instalment_id: entityType === "instalment" ? entityId : null,

      message:
        entityType === "instalment"
          ? "Instalment receipt uploaded"
          : "Order receipt uploaded",
    });

    console.timeEnd("order-receipt");

    return NextResponse.json({
      success: true,
      receipt_url: signed.signedUrl,
    });
  } catch (error) {
    console.error("Order receipt upload failed:", error);

    return NextResponse.json(
      {
        error: error.message || "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}
