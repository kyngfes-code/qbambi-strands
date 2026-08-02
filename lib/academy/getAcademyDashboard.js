import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function getAcademyDashboard(userId) {
  const supabase = createSupabaseAdmin();

  //////////////////////////////////////////////////////
  // Student
  //////////////////////////////////////////////////////

  const { data: student, error } = await supabase
    .from("academy_students")
    .select(
      `
      *,
      enrollment:academy_enrollments(*)
    `,
    )
    .eq("user_id", userId)
    .single();

  if (error || !student) {
    throw new Error("Student not found.");
  }

  //////////////////////////////////////////////////////
  // Payment Plan
  //////////////////////////////////////////////////////

  const { data: paymentPlan } = await supabase
    .from("academy_student_payment_plans")
    .select("*")
    .eq("enrollment_id", student.enrollment_id)
    .maybeSingle();

  //////////////////////////////////////////////////////
  // Payments
  //////////////////////////////////////////////////////

  const { data: payments } = await supabase
    .from("academy_enrollment_payments")
    .select("*")
    .eq("enrollment_id", student.enrollment_id)
    .order("payment_date", {
      ascending: false,
    });

  //////////////////////////////////////////////////////
  // Schedule
  //////////////////////////////////////////////////////

  const { data: paymentSchedule } = await supabase
    .from("academy_student_payment_schedule")
    .select("*")
    .eq("student_payment_plan_id", paymentPlan?.id)
    .order("due_date", {
      ascending: true,
    });

  //////////////////////////////////////////////////////
  // Timeline
  //////////////////////////////////////////////////////

  const { data: timeline } = await supabase
    .from("academy_enrollment_timeline")
    .select("*")
    .eq("enrollment_id", student.enrollment_id)
    .order("created_at", {
      ascending: false,
    })
    .limit(10);

  //////////////////////////////////////////////////////
  // Calculations
  //////////////////////////////////////////////////////

  const approvedPayments =
    payments?.filter((payment) => payment.status === "approved") ?? [];

  const totalPaid = approvedPayments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0,
  );

  const totalTuition = Number(paymentPlan?.total_amount ?? 0);

  const outstandingBalance = Math.max(totalTuition - totalPaid, 0);

  const progress =
    totalTuition === 0 ? 0 : Math.round((totalPaid / totalTuition) * 100);

  const nextPayment =
    paymentSchedule?.find(
      (payment) =>
        payment.status === "scheduled" || payment.status === "pending",
    ) ?? null;

  return {
    student,

    enrollment: student.enrollment,

    paymentPlan,

    payments,

    paymentSchedule,

    nextPayment,

    timeline,

    summary: {
      totalTuition,

      totalPaid,

      outstandingBalance,

      progress,
    },
  };
}
