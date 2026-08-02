import { createSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * ----------------------------------------------------
 * Create Student Payment Plan + Schedule
 * ----------------------------------------------------
 */
export async function createStudentPaymentPlan({
  enrollmentId,
  paymentPlanId,
  totalCourseFee,
  enrollmentDate = new Date(),
}) {
  const supabase = createSupabaseAdmin();

  //-------------------------------------------------------
  // Load payment plan
  //-------------------------------------------------------

  const { data: plan, error: planError } = await supabase
    .from("academy_payment_plans")
    .select("*")
    .eq("id", paymentPlanId)
    .single();

  if (planError || !plan) {
    throw new Error("Payment plan not found.");
  }

  //-------------------------------------------------------
  // Financial calculations
  //-------------------------------------------------------

  const originalFee = Number(totalCourseFee);

  const additionalFeePercentage = Number(plan.additional_fee_percentage ?? 0);

  const initialPaymentPercentage = Number(
    plan.initial_payment_percentage ?? 50,
  );

  const numberOfPayments = Number(plan.number_of_payments ?? 1);

  const monthlyInterval = Number(plan.monthly_interval ?? 1);

  const interestAmount = originalFee * (additionalFeePercentage / 100);

  const totalPayable = originalFee + interestAmount;

  const depositAmount = totalPayable * (initialPaymentPercentage / 100);

  const remainingBalance = totalPayable - depositAmount;

  const remainingInstallments = Math.max(numberOfPayments - 1, 0);

  const installmentAmount =
    remainingInstallments > 0 ? remainingBalance / remainingInstallments : 0;

  //-------------------------------------------------------
  // Create master payment plan
  //-------------------------------------------------------

  const { data: studentPlan, error: studentPlanError } = await supabase
    .from("academy_student_payment_plans")
    .insert({
      enrollment_id: enrollmentId,

      payment_plan_id: paymentPlanId,

      original_course_fee: Number(originalFee.toFixed(2)),

      additional_fee_percentage: additionalFeePercentage,

      additional_fee_amount: Number(interestAmount.toFixed(2)),

      total_payable: Number(totalPayable.toFixed(2)),

      initial_payment_percentage: initialPaymentPercentage,

      deposit_amount: Number(depositAmount.toFixed(2)),

      remaining_balance: Number(remainingBalance.toFixed(2)),

      number_of_payments: numberOfPayments,

      remaining_installments: remainingInstallments,

      installment_amount: Number(installmentAmount.toFixed(2)),

      monthly_interval: monthlyInterval,

      status: "pending",
    })
    .select()
    .single();

  if (studentPlanError) {
    throw studentPlanError;
  }

  //-------------------------------------------------------
  // Generate payment schedule
  //-------------------------------------------------------

  const paymentRows = [];

  const baseDate = new Date(enrollmentDate);

  // -----------------------------
  // Deposit
  // -----------------------------

  paymentRows.push({
    student_payment_plan_id: studentPlan.id,

    installment_number: 1,

    payment_type: "deposit",

    amount_due: Number(depositAmount.toFixed(2)),

    amount_paid: 0,

    balance_due: Number(depositAmount.toFixed(2)),

    due_date: baseDate.toISOString(),

    status: "pending",
  });

  // -----------------------------
  // Remaining Installments
  // -----------------------------

  for (let i = 1; i <= remainingInstallments; i++) {
    const dueDate = new Date(baseDate);

    dueDate.setMonth(dueDate.getMonth() + monthlyInterval * i);

    paymentRows.push({
      student_payment_plan_id: studentPlan.id,

      installment_number: i + 1,

      payment_type: "installment",

      amount_due: Number(installmentAmount.toFixed(2)),

      amount_paid: 0,

      balance_due: Number(installmentAmount.toFixed(2)),

      due_date: dueDate.toISOString(),

      status: "pending",
    });
  }

  //-------------------------------------------------------
  // Insert schedule
  //-------------------------------------------------------

  const { data: schedule, error: scheduleError } = await supabase
    .from("academy_student_payment_schedule")
    .insert(paymentRows)
    .select();

  if (scheduleError) {
    throw scheduleError;
  }

  //-------------------------------------------------------

  return {
    paymentPlan: studentPlan,
    paymentSchedule: schedule,
  };
}
