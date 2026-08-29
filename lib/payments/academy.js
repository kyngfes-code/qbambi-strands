// /lib/payments/academy.js

import { initializePaystackPayment } from "@/lib/payments/paystack";

/**
 * ==========================================================
 * Initialize Academy Enrollment Paystack Payment
 * ==========================================================
 *
 * Architecture:
 *
 * academy_enrollment_payments
 *          ↓
 * payment_transactions
 *          ↓
 * Paystack
 *          ↓
 * shared PAYSTACK_CALLBACK_URL
 *          ↓
 * central Paystack verification route
 *          ↓
 * finalizePaystackAcademyPayment()
 *
 * IMPORTANT:
 *
 * - payment_transactions is the central gateway ledger.
 * - academy_enrollment_payments is the Academy payment record.
 * - The Paystack callback is NOT defined here.
 * - initializePaystackPayment() already uses the shared
 *   PAYSTACK_CALLBACK_URL used by orders/appointments.
 *
 * The client NEVER determines the amount.
 * The server determines the legitimate payable amount.
 */

/**
 * ==========================================================
 * INITIALIZE ACADEMY PAYMENT
 * ==========================================================
 */

export async function initializeAcademyEnrollmentPayment({
  supabase,
  session,
  entityId,
  paymentType,
}) {
  /*
  ==========================================================
  1. Authentication
  ==========================================================
  */

  if (!session?.user?.id) {
    throw new Error("Unauthorized.");
  }

  const userId = session.user.id;

  /*
  ==========================================================
  2. Validate enrollment ID
  ==========================================================
  */

  if (!entityId) {
    throw new Error("Enrollment ID is required.");
  }

  /*
  ==========================================================
  3. Validate payment type
  ==========================================================
  */

  const allowedPaymentTypes = [
    "initial_payment",
    "full_payment",
    "outstanding_payment",
    "instalment",
  ];

  if (!allowedPaymentTypes.includes(paymentType)) {
    throw new Error("Invalid academy payment type.");
  }

  /*
  ==========================================================
  4. Load enrollment
  ==========================================================
  */

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("academy_enrollments")
    .select(
      `
        id,
        user_id,
        enrollment_number,
        first_name,
        last_name,
        email,
        status,
        payment_status,
        total_course_fee,
        total_payable,
        amount_paid,
        balance_due,
        initial_payment_amount,
        initial_payment_percentage,
        payment_plan_id
      `,
    )
    .eq("id", entityId)
    .maybeSingle();

  if (enrollmentError) {
    console.error("Academy enrollment lookup error:", enrollmentError);

    throw new Error("Unable to load your academy enrollment.");
  }

  if (!enrollment) {
    throw new Error("Academy enrollment not found.");
  }

  /*
  ==========================================================
  5. Ownership
  ==========================================================
  */

  if (enrollment.user_id !== userId) {
    throw new Error("You are not authorized to make this payment.");
  }

  /*
  ==========================================================
  6. Enrollment state
  ==========================================================
  */

  if (enrollment.status === "payment_verified") {
    throw new Error(
      "Your required payment has already been verified and is awaiting activation.",
    );
  }

  if (enrollment.status === "enrolled") {
    throw new Error("Your academy enrollment has already been activated.");
  }

  if (enrollment.status !== "confirmed") {
    throw new Error(
      `Payment cannot be initialized while enrollment status is "${enrollment.status}".`,
    );
  }

  /*
  ==========================================================
  7. Load assigned student payment plan
  ==========================================================
  */

  const { data: studentPaymentPlan, error: studentPlanError } = await supabase
    .from("academy_student_payment_plans")
    .select("*")
    .eq("enrollment_id", enrollment.id)
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (studentPlanError) {
    console.error(
      "Academy student payment plan lookup error:",
      studentPlanError,
    );

    throw new Error("Unable to load your assigned academy payment plan.");
  }

  if (!studentPaymentPlan) {
    throw new Error("Your academy payment plan has not been assigned yet.");
  }

  /*
  ==========================================================
  8. Determine total payable
  ==========================================================
  */

  const totalPayable = Number(
    enrollment.total_payable ??
      enrollment.total_course_fee ??
      studentPaymentPlan.total_payable ??
      studentPaymentPlan.total_amount ??
      0,
  );

  if (!Number.isFinite(totalPayable) || totalPayable <= 0) {
    throw new Error(
      "Your academy payment amount has not been configured correctly.",
    );
  }

  /*
  ==========================================================
  9. Current amount paid
  ==========================================================
  */

  const amountPaid = Math.max(Number(enrollment.amount_paid ?? 0), 0);

  /*
  ==========================================================
  10. Determine initial payment requirement
  ==========================================================
  */

  const initialPaymentAmount = Number(
    studentPaymentPlan.initial_payment_amount ??
      enrollment.initial_payment_amount ??
      0,
  );

  /*
  ==========================================================
  11. Determine amount to charge
  ==========================================================
  */

  let requiredAmount;

  switch (paymentType) {
    case "initial_payment": {
      const initialRequirement =
        initialPaymentAmount > 0 ? initialPaymentAmount : totalPayable;

      requiredAmount = Math.max(initialRequirement - amountPaid, 0);

      break;
    }

    case "full_payment":
    case "outstanding_payment":
    case "instalment": {
      requiredAmount = Math.max(totalPayable - amountPaid, 0);

      break;
    }

    default:
      throw new Error("Invalid academy payment type.");
  }

  /*
  ==========================================================
  12. Ensure there is something to pay
  ==========================================================
  */

  if (requiredAmount <= 0) {
    throw new Error(
      "There is no outstanding payment required for this enrollment.",
    );
  }

  /*
  ==========================================================
  13. Normalize amount
  ==========================================================
  */

  const amount = Number(requiredAmount.toFixed(2));

  const amountKobo = Math.round(amount * 100);

  if (!Number.isFinite(amountKobo) || amountKobo <= 0) {
    throw new Error("Invalid academy payment amount.");
  }

  /*
  ==========================================================
  14. Get email
  ==========================================================
  */

  const email =
    enrollment.email?.trim().toLowerCase() ||
    session.user.email?.trim().toLowerCase();

  if (!email) {
    throw new Error("A valid email address is required for payment.");
  }

  /*
  ==========================================================
  15. Check for existing pending Academy payment
  ==========================================================
  */

  const { data: existingPayment, error: existingPaymentError } = await supabase
    .from("academy_enrollment_payments")
    .select(
      `
          id,
          amount,
          payment_method,
          payment_reference,
          payment_transaction_id,
          status,
          payment_type,
          created_at
        `,
    )
    .eq("enrollment_id", enrollment.id)
    .eq("payment_method", "paystack")
    .eq("status", "pending")
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (existingPaymentError) {
    throw existingPaymentError;
  }

  if (
    existingPayment &&
    Number(existingPayment.amount) === amount &&
    existingPayment.payment_type === paymentType
  ) {
    throw new Error(
      "A Paystack payment is already awaiting completion. Please complete the existing payment before starting another one.",
    );
  }

  /*
  ==========================================================
  16. Create Academy payment record
  ==========================================================
  */

  const paymentNotes =
    paymentType === "initial_payment"
      ? "Academy initial payment initiated through Paystack."
      : paymentType === "full_payment"
        ? "Academy full payment initiated through Paystack."
        : paymentType === "outstanding_payment"
          ? "Academy outstanding payment initiated through Paystack."
          : "Academy instalment payment initiated through Paystack.";

  const { data: payment, error: paymentError } = await supabase
    .from("academy_enrollment_payments")
    .insert({
      enrollment_id: enrollment.id,
      amount,
      payment_method: "paystack",
      payment_type: paymentType,
      payment_date: new Date().toISOString(),
      status: "pending",
      notes: paymentNotes,
      student_payment_plan_id: studentPaymentPlan.id ?? null,
    })
    .select("*")
    .single();

  if (paymentError) {
    console.error("Academy payment creation error:", paymentError);

    throw paymentError;
  }

  /*
  ==========================================================
  17. Create central transaction reference
  ==========================================================
  */

  const reference = `ACADEMY-${enrollment.id}-${payment.id}`;

  const metadata = {
    entityType: "academy_enrollment",
    entityId: enrollment.id,
    paymentType,
    academyPaymentId: payment.id,
    studentPaymentPlanId: studentPaymentPlan.id ?? null,
    enrollmentNumber: enrollment.enrollment_number ?? null,
  };

  /*
  ==========================================================
  18. Create central payment transaction
  ==========================================================
  */

  const { data: transaction, error: transactionError } = await supabase
    .from("payment_transactions")
    .insert({
      reference,
      provider: "paystack",
      provider_reference: reference,

      entity_type: "academy_enrollment",
      entity_id: enrollment.id,

      source_record_id: payment.id,

      payment_type: paymentType,

      user_id: userId,
      email,

      amount,
      currency: "NGN",

      payment_method: "paystack",

      transaction_type: "payment",

      status: "pending",

      metadata,
    })
    .select("*")
    .single();

  if (transactionError) {
    /*
    ----------------------------------------------------------
    Roll back Academy payment record.
    ----------------------------------------------------------
    */

    await supabase
      .from("academy_enrollment_payments")
      .delete()
      .eq("id", payment.id);

    console.error(
      "Academy payment transaction creation error:",
      transactionError,
    );

    throw transactionError;
  }

  /*
  ==========================================================
  19. Link Academy payment to central transaction
  ==========================================================
  */

  const { error: paymentTransactionLinkError } = await supabase
    .from("academy_enrollment_payments")
    .update({
      payment_transaction_id: transaction.id,
      payment_reference: reference,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payment.id);

  if (paymentTransactionLinkError) {
    console.error(
      "Academy payment transaction linking error:",
      paymentTransactionLinkError,
    );

    /*
    Do not silently leave an inconsistent transaction.
    */

    throw paymentTransactionLinkError;
  }

  /*
  ==========================================================
  20. Initialize Paystack
  ==========================================================
  *
  * IMPORTANT:
  *
  * We deliberately DO NOT pass callback_url here.
  *
  * initializePaystackPayment() already uses:
  *
  * PAYSTACK_CALLBACK_URL
  *
  * This keeps Academy consistent with Orders and Appointments.
  */

  let paystack;

  try {
    paystack = await initializePaystackPayment({
      email,
      amount,
      reference,
      metadata,
    });
  } catch (error) {
    /*
    Paystack initialization failed.
    */

    await supabase
      .from("payment_transactions")
      .update({
        status: "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction.id);

    await supabase
      .from("academy_enrollment_payments")
      .update({
        status: "rejected",
        rejection_reason: error.message || "Paystack initialization failed.",
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    throw error;
  }

  /*
  ==========================================================
  21. Save Paystack gateway information
  ==========================================================
  */

  const { error: gatewayUpdateError } = await supabase
    .from("payment_transactions")
    .update({
      access_code: paystack.access_code ?? null,

      authorization_url: paystack.authorization_url ?? null,

      updated_at: new Date().toISOString(),
    })
    .eq("id", transaction.id);

  if (gatewayUpdateError) {
    throw gatewayUpdateError;
  }

  /*
  ==========================================================
  22. Return
  ==========================================================
  */

  return {
    success: true,

    authorizationUrl: paystack.authorization_url,

    accessCode: paystack.access_code,

    reference,

    paymentId: payment.id,

    transactionId: transaction.id,

    enrollmentId: enrollment.id,

    amount,

    paymentType,

    status: "pending",
  };
}

/**
 * ==========================================================
 * Finalize Academy Paystack Payment
 * ==========================================================
 *
 * Flow:
 *
 * Paystack
 *    ↓
 * payment_transactions
 *    ↓
 * academy_enrollment_payments
 *    ↓
 * academy_enrollments
 *
 * IMPORTANT:
 *
 * payment_transactions is the gateway ledger.
 * academy_enrollment_payments is the academy payment record.
 * academy_enrollments contains the financial summary.
 *
 * This function is idempotent.
 *
 * It does NOT activate the enrollment.
 * It only records the verified payment and updates
 * the enrollment financial state.
 */

export async function finalizePaystackAcademyPayment({
  supabase,
  enrollmentId,
  transactionId,
}) {
  if (!supabase) {
    throw new Error("Supabase client is required.");
  }

  if (!enrollmentId) {
    throw new Error("Enrollment ID is required.");
  }

  if (!transactionId) {
    throw new Error("Transaction ID is required.");
  }

  const { data, error } = await supabase.rpc("finalize_academy_payment", {
    p_transaction_id: transactionId,
  });

  if (error) {
    console.error("Academy payment finalization RPC error:", error);
    throw error;
  }

  return data;
}
