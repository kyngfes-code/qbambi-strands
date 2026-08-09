import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export async function POST(req) {
  const supabase = createSupabaseAdmin();

  let uploadedFilePath = null;

  try {
    //////////////////////////////////////////////////////
    // Authentication
    //////////////////////////////////////////////////////

    const session = await auth();

    if (!session?.user?.id) {
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
    // Form Data
    //////////////////////////////////////////////////////

    const formData = await req.formData();

    const paymentScheduleId = formData.get("payment_schedule_id");

    const paymentMethod = formData.get("payment_method") || "bank_transfer";

    const paymentReference = formData.get("payment_reference") || null;

    const receipt = formData.get("receipt");

    //////////////////////////////////////////////////////
    // Validation
    //////////////////////////////////////////////////////

    if (!paymentScheduleId) {
      return NextResponse.json(
        {
          error: "Payment schedule is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!(receipt instanceof File)) {
      return NextResponse.json(
        {
          error: "Receipt is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!ALLOWED_TYPES.includes(receipt.type)) {
      return NextResponse.json(
        {
          error: "Only JPG, PNG, WEBP and PDF receipts are allowed.",
        },
        {
          status: 400,
        },
      );
    }

    if (receipt.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "Receipt must not exceed 5MB.",
        },
        {
          status: 400,
        },
      );
    }

    //////////////////////////////////////////////////////
    // Get Student Enrollment
    //////////////////////////////////////////////////////

    const { data: enrollment, error: enrollmentError } = await supabase
      .from("academy_enrollments")
      .select("id,user_id")
      .eq("user_id", session.user.id)
      .single();

    if (enrollmentError || !enrollment) {
      return NextResponse.json(
        {
          error: "Enrollment not found.",
        },
        {
          status: 404,
        },
      );
    }

    //////////////////////////////////////////////////////
    // Verify Payment Schedule Ownership
    //////////////////////////////////////////////////////

    const { data: schedule, error: scheduleError } = await supabase
      .from("academy_student_payment_schedule")
      .select(
        `
          *,
          payment_plan:academy_student_payment_plans(
            id,
            enrollment_id
          )
        `,
      )
      .eq("id", paymentScheduleId)
      .single();

    if (scheduleError || !schedule) {
      return NextResponse.json(
        {
          error: "Payment schedule not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (schedule.payment_plan?.enrollment_id !== enrollment.id) {
      return NextResponse.json(
        {
          error: "Unauthorized payment schedule.",
        },
        {
          status: 403,
        },
      );
    }

    //////////////////////////////////////////////////////
    // Prevent Duplicate Pending Payments
    //////////////////////////////////////////////////////

    const { data: existingPayment, error: existingPaymentError } =
      await supabase
        .from("academy_enrollment_payments")
        .select("id")
        .eq("payment_schedule_id", paymentScheduleId)
        .eq("status", "pending_review")
        .maybeSingle();

    if (existingPaymentError) {
      throw existingPaymentError;
    }

    if (existingPayment) {
      return NextResponse.json(
        {
          error: "A payment for this schedule is already awaiting review.",
        },
        {
          status: 409,
        },
      );
    }

    //////////////////////////////////////////////////////
    // Secure Amount
    //////////////////////////////////////////////////////

    const amount = Number(schedule.amount_due ?? schedule.amount);

    //////////////////////////////////////////////////////
    // Upload Receipt
    //////////////////////////////////////////////////////

    const extension = receipt.name.split(".").pop()?.toLowerCase() || "jpg";

    uploadedFilePath = `${enrollment.id}/${Date.now()}.${extension}`;

    const buffer = Buffer.from(await receipt.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("academy-payment-receipts")
      .upload(uploadedFilePath, buffer, {
        contentType: receipt.type,
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("academy-payment-receipts")
      .getPublicUrl(uploadedFilePath);
    //////////////////////////////////////////////////////
    // Save Payment
    //////////////////////////////////////////////////////

    const { data: payment, error: paymentError } = await supabase
      .from("academy_enrollment_payments")
      .insert({
        enrollment_id: enrollment.id,

        student_payment_plan_id: schedule.student_payment_plan_id,

        payment_schedule_id: schedule.id,

        amount,

        payment_method: paymentMethod,

        payment_reference: paymentReference,

        receipt_url: publicUrl,

        status: "pending_review",
      })
      .select()
      .single();

    if (paymentError) {
      throw paymentError;
    }

    //////////////////////////////////////////////////////
    // Success
    //////////////////////////////////////////////////////

    return NextResponse.json(
      {
        success: true,

        message: "Payment submitted successfully and is awaiting review.",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("ACADEMY PAYMENT SUBMISSION ERROR");
    console.error(error);

    //////////////////////////////////////////////////////
    // Rollback Uploaded Receipt
    //////////////////////////////////////////////////////

    if (uploadedFilePath) {
      try {
        await supabase.storage
          .from("academy-payment-receipts")
          .remove([uploadedFilePath]);
      } catch (rollbackError) {
        console.error("RECEIPT ROLLBACK FAILED", rollbackError);
      }
    }

    //////////////////////////////////////////////////////
    // Response
    //////////////////////////////////////////////////////

    return NextResponse.json(
      {
        error: error.message ?? "Unable to submit payment.",
      },
      {
        status: 500,
      },
    );
  }
}
