import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req) {
  try {
    const formData = await req.formData();

    const enrollmentId = formData.get("enrollment_id");
    const paymentScheduleId = formData.get("payment_schedule_id");
    const studentPaymentPlanId = formData.get("student_payment_plan_id");

    const amount = Number(formData.get("amount"));

    const paymentMethod = formData.get("payment_method") || "bank_transfer";

    const paymentReference = formData.get("payment_reference") || null;

    const receipt = formData.get("receipt");

    if (!enrollmentId)
      return NextResponse.json(
        { error: "Enrollment is required." },
        { status: 400 },
      );

    if (!paymentScheduleId)
      return NextResponse.json(
        { error: "Payment schedule is required." },
        { status: 400 },
      );

    if (!studentPaymentPlanId)
      return NextResponse.json(
        { error: "Student payment plan is required." },
        { status: 400 },
      );

    if (!receipt)
      return NextResponse.json(
        { error: "Receipt is required." },
        { status: 400 },
      );

    if (!amount || amount <= 0)
      return NextResponse.json(
        { error: "Invalid payment amount." },
        { status: 400 },
      );

    const supabase = createSupabaseAdmin();

    //------------------------------------------------------
    // Enrollment
    //------------------------------------------------------

    const { data: enrollment, error: enrollmentError } = await supabase
      .from("academy_enrollments")
      .select("*")
      .eq("id", enrollmentId)
      .single();

    if (enrollmentError || !enrollment) {
      return NextResponse.json(
        {
          error: "Enrollment not found.",
        },
        { status: 404 },
      );
    }

    //------------------------------------------------------
    // Schedule
    //------------------------------------------------------

    const { data: schedule, error: scheduleError } = await supabase
      .from("academy_student_payment_schedule")
      .select("*")
      .eq("id", paymentScheduleId)
      .single();

    if (scheduleError || !schedule) {
      return NextResponse.json(
        {
          error: "Payment schedule not found.",
        },
        { status: 404 },
      );
    }

    //------------------------------------------------------
    // Upload receipt
    //------------------------------------------------------

    const extension = receipt.name.split(".").pop() || "jpg";

    const fileName = `${enrollmentId}/${Date.now()}.${extension}`;

    const buffer = Buffer.from(await receipt.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("academy-payment-receipts")
      .upload(fileName, buffer, {
        contentType: receipt.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("academy-payment-receipts")
      .getPublicUrl(fileName);

    //------------------------------------------------------
    // Save payment
    //------------------------------------------------------

    const { data: payment, error: paymentError } = await supabase
      .from("academy_enrollment_payments")
      .insert({
        enrollment_id: enrollmentId,

        student_payment_plan_id: studentPaymentPlanId,

        payment_schedule_id: paymentScheduleId,

        amount,

        payment_method: paymentMethod,

        payment_reference: paymentReference,

        receipt_url: publicUrl,

        status: "pending_review",
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    //------------------------------------------------------

    return NextResponse.json({
      success: true,
      payment,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: err.message || "Unable to submit payment.",
      },
      {
        status: 500,
      },
    );
  }
}
