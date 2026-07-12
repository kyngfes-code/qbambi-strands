import crypto from "crypto";
import { initializePaystackPayment } from "@/lib/payments/paystack";

export async function finalizeOnlineAppointmentPayment({
  supabase,
  paymentId,
  transactionReference = null,
}) {
  const { data, error } = await supabase.rpc(
    "finalize_online_appointment_payment",
    {
      p_payment_id: paymentId,
      p_transaction_reference: transactionReference,
    },
  );

  if (error) {
    const err = new Error(error.message);
    err.status = 400;
    throw err;
  }

  return data;
}

export async function initializeAppointmentDeposit({
  supabase,
  session,
  entityId,
}) {
  /*
  ==========================================
  Load Appointment
  ==========================================
  */

  const { data: appointment, error } = await supabase
    .from("appointments")
    .select(
      `
      id,
      user_id,
      status,
      deposit_required,
      amount_paid,
      balance_due,
      user:users!appointments_user_id_fkey(
        email
      )
    `,
    )
    .eq("id", entityId)
    .single();

  if (error || !appointment) {
    throw new Error("Appointment not found.");
  }

  if (appointment.user_id !== session.user.id) {
    throw new Error("Forbidden.");
  }

  /*
  ==========================================
  Validate
  ==========================================
  */

  if (appointment.status !== "pending") {
    throw new Error(
      "Deposit payments are only allowed while the appointment is pending.",
    );
  }

  const amount = Number(appointment.deposit_required || 0);

  if (amount <= 0) {
    throw new Error("This appointment does not require a deposit.");
  }

  /*
  ==========================================
  Reuse Existing Pending Deposit
  ==========================================
  */

  let appointmentPaymentId;

  const { data: existingPayment } = await supabase
    .from("appointment_payments")
    .select("id")
    .eq("appointment_id", entityId)
    .eq("payment_type", "deposit")
    .eq("status", "pending")
    .maybeSingle();

  if (existingPayment) {
    appointmentPaymentId = existingPayment.id;

    await supabase
      .from("appointment_payments")
      .update({
        amount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", appointmentPaymentId);
  } else {
    const { data: payment, error: paymentError } = await supabase
      .from("appointment_payments")
      .insert({
        appointment_id: entityId,
        user_id: session.user.id,

        amount,

        payment_type: "deposit",

        payment_method: "paystack",

        payment_channel: "paystack",

        status: "pending",
      })
      .select()
      .single();

    if (paymentError) {
      throw paymentError;
    }

    appointmentPaymentId = payment.id;
  }

  /*
  ==========================================
  Transaction
  ==========================================
  */

  const reference = crypto.randomUUID();

  const metadata = {
    entityType: "appointment",
    entityId,
    paymentType: "deposit",
    appointmentPaymentId,
  };

  const { error: transactionError } = await supabase
    .from("payment_transactions")
    .insert({
      reference,
      provider: "paystack",
      provider_reference: reference,

      entity_type: "appointment",
      entity_id: entityId,

      source_record_id: appointmentPaymentId,

      payment_type: "deposit",

      user_id: session.user.id,

      email: appointment.user.email,

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
    email: appointment.user.email,
    amount,
    reference,
    metadata,
  });

  /*
  ==========================================
  Save Access Code
  ==========================================
  */

  await supabase
    .from("payment_transactions")
    .update({
      access_code: paystack.access_code,
      authorization_url: paystack.authorization_url,
    })
    .eq("reference", reference);

  /*
  ==========================================
  Response
  ==========================================
  */

  return {
    success: true,
    authorizationUrl: paystack.authorization_url,
    reference,
  };
}

export async function initializeOutstandingPayment({
  supabase,
  session,
  entityId,
  requestedAmount,
}) {
  /*
  ==========================================
  Load Appointment
  ==========================================
  */

  const { data: appointment, error } = await supabase
    .from("appointments")
    .select(
      `
      id,
      user_id,
      status,
      service_amount,
      amount_paid,
      balance_due,
      payment_completion_status,
      user:users!appointments_user_id_fkey(
        email
      )
    `,
    )
    .eq("id", entityId)
    .single();

  if (error || !appointment) {
    throw new Error("Appointment not found.");
  }

  if (appointment.user_id !== session.user.id) {
    throw new Error("Forbidden.");
  }

  /*
  ==========================================
  Validate Appointment State
  ==========================================
  */

  if (appointment.status !== "completed") {
    throw new Error(
      "Outstanding balance can only be paid after the appointment has been completed.",
    );
  }

  const balanceDue = Number(appointment.balance_due || 0);

  if (balanceDue <= 0) {
    throw new Error("This appointment has already been fully paid.");
  }

  /*
  ==========================================
  Determine Amount
  ==========================================
  */

  const amount = requestedAmount ? Number(requestedAmount) : balanceDue;

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Please enter a valid payment amount.");
  }

  if (amount > balanceDue) {
    throw new Error(
      `Payment cannot exceed the outstanding balance of ₦${balanceDue.toLocaleString()}.`,
    );
  }

  /*
  ==========================================
  Reuse Existing Pending Outstanding Payment
  ==========================================
  */

  let appointmentPaymentId;

  const { data: existingPayment } = await supabase
    .from("appointment_payments")
    .select("id")
    .eq("appointment_id", entityId)
    .eq("payment_type", "outstanding_payment")
    .eq("status", "pending")
    .maybeSingle();

  if (existingPayment) {
    appointmentPaymentId = existingPayment.id;

    console.log("Existing outstanding payment:", existingPayment);
    console.log({
      entityId,
      paymentType: "outstanding_payment",
    });

    const { error: updateError } = await supabase
      .from("appointment_payments")
      .update({
        amount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", appointmentPaymentId);

    if (updateError) {
      throw updateError;
    }
  } else {
    const { data: payment, error: paymentError } = await supabase
      .from("appointment_payments")
      .insert({
        appointment_id: entityId,
        user_id: session.user.id,

        amount,

        payment_type: "outstanding_payment",

        payment_method: "paystack",

        payment_channel: "paystack",

        status: "pending",
      })
      .select()
      .single();

    if (paymentError) {
      console.log(paymentError);
      throw paymentError;
    }

    appointmentPaymentId = payment.id;
  }

  /*
  ==========================================
  Create Payment Transaction
  ==========================================
  */

  const reference = crypto.randomUUID();

  const metadata = {
    entityType: "appointment",
    entityId,
    paymentType: "outstanding_payment",
    appointmentPaymentId,
  };

  const { error: transactionError } = await supabase
    .from("payment_transactions")
    .insert({
      reference,
      provider: "paystack",
      provider_reference: reference,

      entity_type: "appointment",
      entity_id: entityId,

      source_record_id: appointmentPaymentId,

      payment_type: "outstanding_payment",

      user_id: session.user.id,

      email: appointment.user.email,

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
    email: appointment.user.email,
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
  Return
  ==========================================
  */

  return {
    success: true,
    authorizationUrl: paystack.authorization_url,
    reference,
  };
}
