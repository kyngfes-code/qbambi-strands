import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";
import { z } from "zod";

const uploadSchema = z.object({
  entityType: z.enum(["order", "instalment"]),
  entityId: z.string().uuid(),
  paymentType: z.string().min(1),
  customerMessage: z.string().optional().nullable(),
});

export async function POST(req) {
  let filePath = null;

  try {
    console.time("order-receipt");

    //////////////////////////////////////////////////////
    // Authenticate
    //////////////////////////////////////////////////////

    const session = await auth();

    if (!session?.user?.id) {
      console.timeEnd("order-receipt");

      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    //////////////////////////////////////////////////////
    // Read Form
    //////////////////////////////////////////////////////

    const formData = await req.formData();

    const parsed = uploadSchema.safeParse({
      entityType: formData.get("entityType"),
      entityId: formData.get("entityId"),
      paymentType: formData.get("paymentType"),
      customerMessage: formData.get("customerMessage"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request.",
        },
        {
          status: 400,
        },
      );
    }

    const { entityType, entityId, paymentType, customerMessage } = parsed.data;

    const receipt = formData.get("receipt");

    if (!receipt) {
      return NextResponse.json(
        {
          error: "Receipt is required.",
        },
        {
          status: 400,
        },
      );
    }

    //////////////////////////////////////////////////////
    // Validate File
    //////////////////////////////////////////////////////

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(receipt.type)) {
      return NextResponse.json(
        {
          error: "Invalid receipt type.",
        },
        {
          status: 400,
        },
      );
    }

    const MAX_SIZE = 5 * 1024 * 1024;

    if (receipt.size > MAX_SIZE) {
      return NextResponse.json(
        {
          error: "Receipt exceeds 5MB.",
        },
        {
          status: 400,
        },
      );
    }

    //////////////////////////////////////////////////////
    // Supabase
    //////////////////////////////////////////////////////

    const supabase = createSupabaseAdmin();

    //////////////////////////////////////////////////////
    // Verify Ownership
    //////////////////////////////////////////////////////

    let order;
    let amount = 0;

    if (entityType === "order") {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          user_id,
          total_amount,
          user:users!orders_user_id_fkey(
            email
          )
        `,
        )
        .eq("id", entityId)
        .single();

      if (data) {
        console.log("Order User:", data.user_id);
      }

      if (error || !data || data.user_id !== session.user.id) {
        return NextResponse.json(
          {
            error: "Order not found.",
          },
          {
            status: 404,
          },
        );
      }

      order = data;

      amount = Number(data.total_amount ?? 0);
      if (amount <= 0) {
        return NextResponse.json(
          {
            error: "This order has no outstanding balance.",
          },
          {
            status: 400,
          },
        );
      }
    } else {
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

      if (error) {
        console.error(error);

        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json(
          { error: "Order not found." },
          { status: 404 },
        );
      }

      if (data.user_id !== session.user.id) {
        return NextResponse.json({ error: "Forbidden." }, { status: 403 });
      }
      order = data.payment_plans.orders;

      amount = Number(data.amount);
    }

    //////////////////////////////////////////////////////
    // Existing Transaction
    //////////////////////////////////////////////////////

    const { data: existingTransaction, error: existingError } = await supabase
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

    if (existingError) {
      throw existingError;
    }

    if (existingTransaction?.status === "pending") {
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
      return NextResponse.json(
        {
          error: "Payment has already been confirmed.",
        },
        {
          status: 409,
        },
      );
    }

    //////////////////////////////////////////////////////
    // Upload Receipt
    //////////////////////////////////////////////////////

    const extension = receipt.name?.split(".").pop()?.toLowerCase() ?? "file";

    filePath =
      entityType === "order"
        ? `orders/${entityId}-${Date.now()}.${extension}`
        : `instalments/${entityId}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(filePath, receipt, {
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }
    //////////////////////////////////////////////////////
    // Handle Resubmission
    //////////////////////////////////////////////////////

    if (existingTransaction?.status === "failed") {
      const { error: updateError } = await supabase
        .from("payment_transactions")
        .update({
          amount,
          status: "pending",
          updated_at: new Date().toISOString(),
          metadata: {
            ...(existingTransaction.metadata ?? {}),
            uploadedReceipt: true,
            resubmitted: true,
            receipt_path: filePath,
            customerMessage,
          },
        })
        .eq("id", existingTransaction.id);

      if (updateError) {
        await supabase.storage.from("receipts").remove([filePath]);

        throw updateError;
      }

      if (entityType === "order") {
        const { error } = await supabase
          .from("orders")
          .update({
            receipt_path: filePath,
            status: "awaiting_confirmation",
          })
          .eq("id", entityId);

        if (error) {
          await supabase.storage.from("receipts").remove([filePath]);

          throw error;
        }
      } else {
        const { error } = await supabase
          .from("instalments")
          .update({
            receipt_path: filePath,
            status: "awaiting_confirmation",
          })
          .eq("id", entityId);

        if (error) {
          await supabase.storage.from("receipts").remove([filePath]);

          throw error;
        }
      }

      await supabase.from("admin_notifications").insert({
        type: "receipt_uploaded",
        order_id: entityType === "order" ? entityId : order.id,
        instalment_id: entityType === "instalment" ? entityId : null,
        message:
          entityType === "instalment"
            ? "Instalment receipt resubmitted"
            : "Order receipt resubmitted",
      });

      console.timeEnd("order-receipt");

      return NextResponse.json({
        success: true,
      });
    }

    //////////////////////////////////////////////////////
    // Update Business Record
    //////////////////////////////////////////////////////

    if (entityType === "order") {
      const { error } = await supabase
        .from("orders")
        .update({
          receipt_path: filePath,
          status: "awaiting_confirmation",
        })
        .eq("id", entityId);

      if (error) {
        await supabase.storage.from("receipts").remove([filePath]);

        throw error;
      }
    } else {
      const { error } = await supabase
        .from("instalments")
        .update({
          receipt_path: filePath,
          status: "awaiting_confirmation",
        })
        .eq("id", entityId);

      if (error) {
        await supabase.storage.from("receipts").remove([filePath]);

        throw error;
      }
    }

    //////////////////////////////////////////////////////
    // Create Transaction
    //////////////////////////////////////////////////////

    const { data: transaction, error: transactionError } = await supabase
      .from("payment_transactions")
      .insert({
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
          receipt_path: filePath,
          customerMessage,
        },
      })
      .select()
      .single();

    if (transactionError) {
      if (entityType === "order") {
        await supabase
          .from("orders")
          .update({
            receipt_path: null,
          })
          .eq("id", entityId);
      } else {
        await supabase
          .from("instalments")
          .update({
            receipt_path: null,
          })
          .eq("id", entityId);
      }

      await supabase.storage.from("receipts").remove([filePath]);

      throw transactionError;
    }
    //////////////////////////////////////////////////////
    // Notify Admin
    //////////////////////////////////////////////////////

    const { error: notificationError } = await supabase
      .from("admin_notifications")
      .insert({
        type: "receipt_uploaded",

        order_id: entityType === "order" ? entityId : order.id,

        instalment_id: entityType === "instalment" ? entityId : null,

        message:
          entityType === "instalment"
            ? "Instalment receipt uploaded"
            : "Order receipt uploaded",
      });

    if (notificationError) {
      if (transaction?.id) {
        await supabase
          .from("payment_transactions")
          .delete()
          .eq("id", transaction.id);
      }

      if (entityType === "order") {
        await supabase
          .from("orders")
          .update({
            receipt_path: null,
          })
          .eq("id", entityId);
      } else {
        await supabase
          .from("instalments")
          .update({
            receipt_path: null,
          })
          .eq("id", entityId);
      }

      await supabase.storage.from("receipts").remove([filePath]);

      throw notificationError;
    }

    //////////////////////////////////////////////////////
    // Success
    //////////////////////////////////////////////////////

    console.timeEnd("order-receipt");

    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Order receipt upload failed:");
    console.error(error);

    //////////////////////////////////////////////////////
    // Cleanup Uploaded File
    //////////////////////////////////////////////////////

    if (filePath) {
      try {
        const supabase = createSupabaseAdmin();

        await supabase.storage.from("receipts").remove([filePath]);
      } catch (cleanupError) {
        console.error("Failed to cleanup uploaded receipt:", cleanupError);
      }
    }

    console.timeEnd("order-receipt");

    return NextResponse.json(
      {
        error: error.message ?? "Internal server error.",
      },
      {
        status: 500,
      },
    );
  }
}
