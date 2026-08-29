import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export default async function AcademyPaymentLayout({ children }) {
  const session = await auth();

  // --------------------------------------------------
  // Must be signed in
  // --------------------------------------------------

  if (!session?.user?.id) {
    redirect("/signin");
  }

  // --------------------------------------------------
  // Must be a student
  // --------------------------------------------------

  if (session.user.role !== "student") {
    redirect("/account");
  }

  const supabase = createSupabaseAdmin();

  // --------------------------------------------------
  // Find the student's current enrollment
  //
  // Database is authoritative here.
  // --------------------------------------------------

  const { data: enrollment, error } = await supabase
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
    .eq("user_id", session.user.id)
    .in("status", ["confirmed", "payment_verified", "enrolled"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Academy payment enrollment lookup error:", error);

    redirect("/account");
  }

  // --------------------------------------------------
  // No enrollment
  // --------------------------------------------------

  if (!enrollment) {
    redirect("/academy");
  }

  // --------------------------------------------------
  // Already enrolled
  //
  // Payment page is no longer needed.
  // --------------------------------------------------

  if (enrollment.status === "enrolled") {
    redirect("/academy/dashboard");
  }

  // --------------------------------------------------
  // Payment gate
  //
  // Only confirmed and payment_verified students
  // may access the payment page.
  // --------------------------------------------------

  if (
    enrollment.status !== "confirmed" &&
    enrollment.status !== "payment_verified"
  ) {
    redirect("/account");
  }

  return children;
}
