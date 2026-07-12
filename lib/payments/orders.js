import crypto from "crypto";
import { initializePaystackPayment } from "@/lib/payments/paystack";

// lib/payments/orders.js
export async function finalizePaystackInstalmentPayment({
  supabase,
  instalmentId,
  transactionId,
}) {
  const { data, error } = await supabase.rpc(
    "finalize_paystack_instalment_payment",
    {
      p_instalment_id: instalmentId,
      p_transaction_id: transactionId ?? null,
    },
  );

  if (error) {
    const err = new Error(error.message);
    err.status = 400;
    throw err;
  }

  return data;
}

export async function finalizePaystackOrderPayment({
  supabase,
  orderId,
  transactionId,
}) {
  const { data, error } = await supabase.rpc(
    "finalize_paystack_order_payment",
    {
      p_order_id: orderId,
      p_transaction_id: transactionId,
    },
  );

  if (error) {
    const err = new Error(error.message);
    err.status = 500;
    throw err;
  }

  return data;
}

export async function initializeOrderPayment({ supabase, session, entityId }) {
  /*
  ==========================================
  Load Order
  ==========================================
  */

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      user_id,
      total_amount,
      payment_status,
      status,
      user:users!orders_user_id_fkey(
        email
      )
    `,
    )
    .eq("id", entityId)
    .single();

  if (error || !order) {
    throw new Error("Order not found.");
  }

  if (order.user_id !== session.user.id) {
    throw new Error("Forbidden.");
  }

  /*
  ==========================================
  Validate Order
  ==========================================
  */

  if (
    order.payment_status === "paid" ||
    order.status === "paid" ||
    order.status === "completed"
  ) {
    throw new Error("This order has already been paid.");
  }

  const amount = Number(order.total_amount || 0);

  if (amount <= 0) {
    throw new Error("Invalid order amount.");
  }

  /*
  ==========================================
  Create Transaction
  ==========================================
  */

  const reference = crypto.randomUUID();

  const metadata = {
    entityType: "order",
    entityId,
    paymentType: "order_payment",
  };

  const { error: transactionError } = await supabase
    .from("payment_transactions")
    .insert({
      reference,
      provider: "paystack",
      provider_reference: reference,

      entity_type: "order",
      entity_id: entityId,

      source_record_id: entityId,

      payment_type: "order_payment",

      user_id: session.user.id,

      email: order.user.email,

      amount,

      currency: "NGN",

      payment_method: "paystack",

      status: "pending",

      metadata,
    });

  if (transactionError) {
    throw transactionError;
  }

  /*
  ==========================================
  Initialize Paystack
  ==========================================
  */

  const paystack = await initializePaystackPayment({
    email: order.user.email,
    amount,
    reference,
    metadata,
  });

  /*
  ==========================================
  Save Access Code
  ==========================================
  */

  const { error: accessCodeError } = await supabase
    .from("payment_transactions")
    .update({
      access_code: paystack.access_code,
      authorization_url: paystack.authorization_url,
    })
    .eq("reference", reference);

  if (accessCodeError) {
    throw accessCodeError;
  }

  /*
  ==========================================
  Success
  ==========================================
  */

  return {
    success: true,
    authorizationUrl: paystack.authorization_url,
    reference,
  };
}

export async function initializePaymentPlanPayment({
  supabase,
  session,
  entityId,
  requestedAmount,
}) {
  /*
  ==========================================================
  Load Payment Plan
  ==========================================================
  */

  const { data: paymentPlan, error } = await supabase
    .from("payment_plans")
    .select(
      `
      id,
      user_id,
      total_amount,
      amount_paid,
      remaining_balance,
      status,
      order_id,
      users!payment_plans_user_id_fkey(
        email
      )
    `,
    )
    .eq("id", entityId)
    .single();

  if (error || !paymentPlan) {
    throw new Error("Payment plan not found.");
  }

  if (paymentPlan.user_id !== session.user.id) {
    throw new Error("Forbidden.");
  }

  if (paymentPlan.status === "completed") {
    throw new Error("This payment plan has already been completed.");
  }

  const remainingBalance = Number(
    paymentPlan.remaining_balance ??
      paymentPlan.total_amount - paymentPlan.amount_paid,
  );

  if (remainingBalance <= 0) {
    throw new Error("Nothing is outstanding on this payment plan.");
  }

  /*
  ==========================================================
  Determine Amount
  ==========================================================
  */

  const amount = requestedAmount ? Number(requestedAmount) : remainingBalance;

  if (Number.isNaN(amount) || amount <= 0) {
    throw new Error("Please enter a valid payment amount.");
  }

  if (amount > remainingBalance) {
    throw new Error("Payment cannot exceed the remaining balance.");
  }

  /*
  ==========================================================
  Generate Transaction Reference
  ==========================================================
  */

  const reference = crypto.randomUUID();

  const metadata = {
    entityType: "payment_plan",
    entityId,
    paymentType: "payment_plan",
    orderId: paymentPlan.order_id,
  };

  /*
  ==========================================================
  Save Transaction
  ==========================================================
  */

  const { error: transactionError } = await supabase
    .from("payment_transactions")
    .insert({
      reference,

      provider: "paystack",
      provider_reference: reference,

      entity_type: "payment_plan",
      entity_id: entityId,

      payment_type: "payment_plan",

      user_id: session.user.id,

      email: paymentPlan.users.email,

      amount,

      currency: "NGN",

      payment_method: "paystack",

      status: "pending",

      metadata,
    });

  if (transactionError) {
    throw transactionError;
  }

  /*
  ==========================================================
  Initialize Paystack
  ==========================================================
  */

  const paystack = await initializePaystackPayment({
    email: paymentPlan.users.email,
    amount,
    reference,
    metadata,
  });

  /*
  ==========================================================
  Save Authorization URL
  ==========================================================
  */

  const { error: updateError } = await supabase
    .from("payment_transactions")
    .update({
      access_code: paystack.access_code,
      authorization_url: paystack.authorization_url,
    })
    .eq("reference", reference);

  if (updateError) {
    throw updateError;
  }

  /*
  ==========================================================
  Return
  ==========================================================
  */

  return {
    success: true,
    authorizationUrl: paystack.authorization_url,
    reference,
  };
}
