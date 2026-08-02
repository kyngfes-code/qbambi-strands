/**
 * Academy Payment Adjustment Helpers
 *
 * Centralizes creation of:
 * - refunds
 * - partial refunds
 * - write-offs
 * - corrections
 * - manual adjustments
 *
 * Tables:
 *  - academy_payment_adjustments
 *  - academy_enrollment_payments
 *  - academy_enrollments
 */

//////////////////////////////////////////////////////////////
// Types
//////////////////////////////////////////////////////////////

export const PAYMENT_ADJUSTMENT_TYPES = {
  REFUND: "refund",

  PARTIAL_REFUND: "partial_refund",

  WRITE_OFF: "write_off",

  CORRECTION: "correction",

  ADJUSTMENT: "adjustment",
};

//////////////////////////////////////////////////////////////
// Insert Adjustment
//////////////////////////////////////////////////////////////

export async function createPaymentAdjustment(
  supabase,
  {
    paymentId,

    enrollmentId,

    adjustmentType,

    amount,

    reason,

    notes,

    createdBy,

    metadata = {},
  },
) {
  return supabase
    .from("academy_payment_adjustments")
    .insert({
      payment_id: paymentId,

      enrollment_id: enrollmentId,

      adjustment_type: adjustmentType,

      amount: Number(amount),

      reason,

      notes,

      metadata,

      created_by: createdBy,
    })
    .select()
    .single();
}

//////////////////////////////////////////////////////////////
// Refund
//////////////////////////////////////////////////////////////

export async function issueRefund(
  supabase,
  {
    payment,

    amount,

    reason,

    notes,

    adminId,
  },
) {
  const type =
    Number(amount) >= Number(payment.amount)
      ? PAYMENT_ADJUSTMENT_TYPES.REFUND
      : PAYMENT_ADJUSTMENT_TYPES.PARTIAL_REFUND;

  return createPaymentAdjustment(supabase, {
    paymentId: payment.id,

    enrollmentId: payment.enrollment_id,

    adjustmentType: type,

    amount,

    reason,

    notes,

    createdBy: adminId,
  });
}

//////////////////////////////////////////////////////////////
// Write Off
//////////////////////////////////////////////////////////////

export async function writeOffBalance(
  supabase,
  {
    payment,

    amount,

    reason,

    notes,

    adminId,
  },
) {
  return createPaymentAdjustment(supabase, {
    paymentId: payment.id,

    enrollmentId: payment.enrollment_id,

    adjustmentType: PAYMENT_ADJUSTMENT_TYPES.WRITE_OFF,

    amount,

    reason,

    notes,

    createdBy: adminId,
  });
}

//////////////////////////////////////////////////////////////
// Correction
//////////////////////////////////////////////////////////////

export async function correctPayment(
  supabase,
  {
    payment,

    amount,

    reason,

    notes,

    adminId,
  },
) {
  return createPaymentAdjustment(supabase, {
    paymentId: payment.id,

    enrollmentId: payment.enrollment_id,

    adjustmentType: PAYMENT_ADJUSTMENT_TYPES.CORRECTION,

    amount,

    reason,

    notes,

    createdBy: adminId,
  });
}

//////////////////////////////////////////////////////////////
// Manual Adjustment
//////////////////////////////////////////////////////////////

export async function manualAdjustment(
  supabase,
  {
    payment,

    amount,

    reason,

    notes,

    adminId,
  },
) {
  return createPaymentAdjustment(supabase, {
    paymentId: payment.id,

    enrollmentId: payment.enrollment_id,

    adjustmentType: PAYMENT_ADJUSTMENT_TYPES.ADJUSTMENT,

    amount,

    reason,

    notes,

    createdBy: adminId,
  });
}

//////////////////////////////////////////////////////////////
// Update Enrollment Totals
//////////////////////////////////////////////////////////////

export async function updateEnrollmentFinancials(supabase, enrollmentId) {
  //----------------------------------------------------------
  // Enrollment
  //----------------------------------------------------------

  const { data: enrollment, error } = await supabase
    .from("academy_enrollments")
    .select("id,total_course_fee")
    .eq("id", enrollmentId)
    .single();

  if (error) throw error;

  //----------------------------------------------------------
  // Payments
  //----------------------------------------------------------

  const { data: payments } = await supabase
    .from("academy_enrollment_payments")
    .select("amount")
    .eq("enrollment_id", enrollmentId)
    .in("status", ["completed", "pending"]);

  //----------------------------------------------------------
  // Adjustments
  //----------------------------------------------------------

  const { data: adjustments } = await supabase
    .from("academy_payment_adjustments")
    .select("adjustment_type,amount")
    .eq("enrollment_id", enrollmentId);

  //----------------------------------------------------------
  // Totals
  //----------------------------------------------------------

  const paid =
    payments?.reduce((sum, payment) => sum + Number(payment.amount || 0), 0) ||
    0;

  let refunded = 0;

  let writtenOff = 0;

  adjustments?.forEach((adjustment) => {
    switch (adjustment.adjustment_type) {
      case "refund":
      case "partial_refund":
        refunded += Number(adjustment.amount || 0);
        break;

      case "write_off":
        writtenOff += Number(adjustment.amount || 0);
        break;
    }
  });

  const amountPaid = paid - refunded;

  const balance = Math.max(
    Number(enrollment.total_course_fee) - amountPaid - writtenOff,
    0,
  );

  //----------------------------------------------------------
  // Payment Status
  //----------------------------------------------------------

  let paymentStatus = "unpaid";

  if (amountPaid > 0 && balance > 0) {
    paymentStatus = "partially_paid";
  }

  if (balance <= 0) {
    paymentStatus = "paid";
  }

  //----------------------------------------------------------

  return supabase
    .from("academy_enrollments")
    .update({
      amount_paid: amountPaid,

      balance_due: balance,

      payment_status: paymentStatus,
    })
    .eq("id", enrollmentId);
}
