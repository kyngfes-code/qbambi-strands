// app/api/academy/enroll/upload-receipt/route.js

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";
import { z } from "zod";

const enrollmentIdSchema = z.string().uuid();

const ALLOWED_RECEIPT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const MAX_RECEIPT_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req) {
  try {
    console.time("academy-receipt");

    /*
    ============================================================
    1. AUTHENTICATION
    ============================================================
    */

    const session = await auth();

    if (!session?.user?.id) {
      console.timeEnd("academy-receipt");

      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    /*
    ============================================================
    2. READ FORM DATA
    ============================================================
    */

    const formData = await req.formData();

    const entityType = formData.get("entityType");
    const entityId = formData.get("entityId");
    const requestedPaymentType = formData.get("paymentType");
    const receipt = formData.get("receipt");

    /*
    ------------------------------------------------------------
    Entity type
    ------------------------------------------------------------
    */

    if (entityType !== "academy_enrollment") {
      console.timeEnd("academy-receipt");

      return NextResponse.json(
        {
          error: "Invalid payment entity.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    ------------------------------------------------------------
    Enrollment ID
    ------------------------------------------------------------
    */

    const parsedEnrollmentId = enrollmentIdSchema.safeParse(entityId);

    if (!parsedEnrollmentId.success) {
      console.timeEnd("academy-receipt");

      return NextResponse.json(
        {
          error: "Invalid enrollment.",
        },
        {
          status: 400,
        },
      );
    }

    const enrollmentId = parsedEnrollmentId.data;

    /*
    ------------------------------------------------------------
    Requested payment type
    ------------------------------------------------------------

    The client is allowed to tell us what payment screen it is
    submitting from, but the server will verify the real payment
    stage against the enrollment state.
    */

    const allowedPaymentTypes = [
      "initial_payment",
      "full_payment",
      "outstanding_payment",
    ];

    if (
      typeof requestedPaymentType !== "string" ||
      !allowedPaymentTypes.includes(requestedPaymentType)
    ) {
      console.timeEnd("academy-receipt");

      return NextResponse.json(
        {
          error: "Invalid payment type.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    ------------------------------------------------------------
    Receipt
    ------------------------------------------------------------
    */

    if (!receipt || !(receipt instanceof File)) {
      console.timeEnd("academy-receipt");

      return NextResponse.json(
        {
          error: "Payment receipt is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!ALLOWED_RECEIPT_TYPES.includes(receipt.type)) {
      console.timeEnd("academy-receipt");

      return NextResponse.json(
        {
          error:
            "Invalid receipt type. Please upload a JPG, PNG, WEBP or PDF file.",
        },
        {
          status: 400,
        },
      );
    }

    if (receipt.size > MAX_RECEIPT_SIZE) {
      console.timeEnd("academy-receipt");

      return NextResponse.json(
        {
          error: "Receipt exceeds the maximum file size of 5MB.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    ============================================================
    3. SUPABASE ADMIN
    ============================================================
    */

    const supabase = createSupabaseAdmin();

    /*
    ============================================================
    4. GET ENROLLMENT
    ============================================================
    */

    const { data: enrollment, error: enrollmentError } = await supabase
      .from("academy_enrollments")
      .select(
        `
          id,
          user_id,
          enrollment_number,
          status,
          payment_status,
          total_course_fee,
          amount_paid,
          balance_due,
          total_payable,
          initial_payment_amount,
          initial_payment_percentage,
          first_name,
          last_name,
          email
        `,
      )
      .eq("id", enrollmentId)
      .maybeSingle();

    if (enrollmentError) {
      console.error("Academy enrollment query failed:", enrollmentError);

      console.timeEnd("academy-receipt");

      return NextResponse.json(
        {
          error: "Unable to verify your enrollment.",
          code: "ENROLLMENT_QUERY_FAILED",
          retryable: true,
        },
        {
          status: 500,
        },
      );
    }

    if (!enrollment) {
      console.timeEnd("academy-receipt");

      return NextResponse.json(
        {
          error: "Enrollment not found.",
        },
        {
          status: 404,
        },
      );
    }

    /*
    ============================================================
    5. VERIFY OWNERSHIP
    ============================================================
    */

    if (enrollment.user_id !== session.user.id) {
      console.timeEnd("academy-receipt");

      return NextResponse.json(
        {
          error: "You are not authorized to make this payment.",
        },
        {
          status: 403,
        },
      );
    }

    /*
    ============================================================
    6. DETERMINE ACTUAL PAYMENT TYPE
    ============================================================

    Academy payment stages:

      confirmed
          ↓
      initial_payment OR full_payment

      payment_verified
          ↓
      waiting for enrollment activation

      enrolled
          ↓
      outstanding_payment

    For a one-time/full-payment plan:

      confirmed
          ↓
      full_payment
          ↓
      balance_due = 0
    */

    let actualPaymentType = null;

    const totalPayable = Number(enrollment.total_payable || 0);
    const initialPaymentAmount = Number(enrollment.initial_payment_amount || 0);
    const balanceDue = Number(enrollment.balance_due || 0);

    /*
    ------------------------------------------------------------
    CONFIRMED
    ------------------------------------------------------------

    This is where the initial deposit is required.

    If the initial payment amount is effectively the entire
    payable amount, treat it as a full_payment instead.
    */

    if (enrollment.status === "confirmed") {
      if (
        Number.isFinite(totalPayable) &&
        totalPayable > 0 &&
        Number.isFinite(initialPaymentAmount) &&
        initialPaymentAmount >= totalPayable
      ) {
        actualPaymentType = "full_payment";
      } else {
        actualPaymentType = "initial_payment";
      }
    } else if (enrollment.status === "payment_verified") {
      /*
    ------------------------------------------------------------
    PAYMENT VERIFIED
    ------------------------------------------------------------
    */
      console.timeEnd("academy-receipt");

      return NextResponse.json(
        {
          error:
            "Your initial payment has already been verified and is awaiting enrollment activation.",
          code: "INITIAL_PAYMENT_ALREADY_VERIFIED",
        },
        {
          status: 409,
        },
      );
    } else if (enrollment.status === "enrolled") {
      /*
    ------------------------------------------------------------
    ENROLLED
    ------------------------------------------------------------
    */
      if (!Number.isFinite(balanceDue) || balanceDue <= 0) {
        console.timeEnd("academy-receipt");

        return NextResponse.json(
          {
            error: "There is no outstanding balance on this enrollment.",
            code: "NO_OUTSTANDING_BALANCE",
          },
          {
            status: 409,
          },
        );
      }

      actualPaymentType = "outstanding_payment";
    } else if (enrollment.status === "pending") {
      /*
    ------------------------------------------------------------
    PENDING
    ------------------------------------------------------------
    */
      console.timeEnd("academy-receipt");

      return NextResponse.json(
        {
          error: "Your enrollment has not yet been confirmed for payment.",
          code: "ENROLLMENT_NOT_CONFIRMED",
        },
        {
          status: 409,
        },
      );
    } else if (enrollment.status === "contacted") {
      /*
    ------------------------------------------------------------
    CONTACTED
    ------------------------------------------------------------
    */
      console.timeEnd("academy-receipt");

      return NextResponse.json(
        {
          error:
            "Your enrollment is still being processed. Payment will be available once your enrollment is confirmed.",
          code: "ENROLLMENT_NOT_CONFIRMED",
        },
        {
          status: 409,
        },
      );
    } else if (enrollment.status === "rejected") {
      /*
    ------------------------------------------------------------
    REJECTED
    ------------------------------------------------------------
    */
      console.timeEnd("academy-receipt");

      return NextResponse.json(
        {
          error: "This enrollment has been rejected and cannot accept payment.",
          code: "ENROLLMENT_REJECTED",
        },
        {
          status: 409,
        },
      );
    } else if (enrollment.status === "completed") {
      /*
    ------------------------------------------------------------
    COMPLETED
    ------------------------------------------------------------
    */
      console.timeEnd("academy-receipt");

      return NextResponse.json(
        {
          error:
            "This enrollment has already been completed and cannot accept payments.",
          code: "ENROLLMENT_COMPLETED",
        },
        {
          status: 409,
        },
      );
    } else if (enrollment.status === "cancelled") {
      /*
    ------------------------------------------------------------
    CANCELLED
    ------------------------------------------------------------
    */
      console.timeEnd("academy-receipt");

      return NextResponse.json(
        {
          error:
            "This enrollment has been cancelled and cannot accept payments.",
          code: "ENROLLMENT_CANCELLED",
        },
        {
          status: 409,
        },
      );
    } else {
      /*
    ------------------------------------------------------------
    Unknown state
    ------------------------------------------------------------
    */
      console.timeEnd("academy-receipt");

      return NextResponse.json(
        {
          error: "Payments are not currently accepted for this enrollment.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    ============================================================
    7. VERIFY REQUESTED PAYMENT TYPE
    ============================================================

    The browser must agree with what the server determines.

    This prevents a user from submitting:

      outstanding_payment

    while the enrollment is still:

      confirmed
    */

    if (requestedPaymentType !== actualPaymentType) {
      console.timeEnd("academy-receipt");

      return NextResponse.json(
        {
          error:
            "The requested payment type does not match the current enrollment payment stage.",
          code: "PAYMENT_TYPE_MISMATCH",
          expectedPaymentType: actualPaymentType,
        },
        {
          status: 409,
        },
      );
    }

    /*
    ============================================================
    8. DETERMINE SERVER-SIDE PAYMENT AMOUNT
    ============================================================
    */

    let amount = 0;

    if (actualPaymentType === "initial_payment") {
      amount = initialPaymentAmount;
    }

    if (actualPaymentType === "full_payment") {
      amount = totalPayable;
    }

    if (actualPaymentType === "outstanding_payment") {
      amount = balanceDue;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      console.timeEnd("academy-receipt");

      return NextResponse.json(
        {
          error:
            "The payment amount could not be determined from this enrollment.",
          code: "INVALID_PAYMENT_AMOUNT",
        },
        {
          status: 400,
        },
      );
    }

    /*
    ============================================================
    9. CHECK EXISTING PAYMENT
    ============================================================
    */

    const { data: existingPayment, error: existingPaymentError } =
      await supabase
        .from("academy_enrollment_payments")
        .select(
          `
          id,
          enrollment_id,
          amount,
          payment_method,
          payment_reference,
          payment_date,
          status,
          receipt_url,
          receipt_filename,
          reviewed_by,
          reviewed_at,
          rejection_reason,
          admin_note,
          student_payment_plan_id,
          payment_schedule_id,
          payment_transaction_id,
          gateway_transaction_id,
          payment_type,
          created_at
        `,
        )
        .eq("enrollment_id", enrollment.id)
        .eq("payment_type", actualPaymentType)
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

    if (existingPaymentError) {
      console.error(
        "Existing academy payment query failed:",
        existingPaymentError,
      );

      console.timeEnd("academy-receipt");

      return NextResponse.json(
        {
          error: "Unable to check your existing payment.",
          code: "EXISTING_PAYMENT_QUERY_FAILED",
          retryable: true,
        },
        {
          status: 500,
        },
      );
    }

    /*
    ============================================================
    10. PREVENT DUPLICATE SUBMISSIONS
    ============================================================
    */

    if (existingPayment && existingPayment.status !== "rejected") {
      switch (existingPayment.status) {
        case "pending":
          console.timeEnd("academy-receipt");

          return NextResponse.json(
            {
              error: "Payment is already under review.",
              code: "PAYMENT_UNDER_REVIEW",
            },
            {
              status: 409,
            },
          );

        case "approved":
          console.timeEnd("academy-receipt");

          return NextResponse.json(
            {
              error: "This payment has already been approved.",
              code: "PAYMENT_ALREADY_APPROVED",
            },
            {
              status: 409,
            },
          );

        default:
          break;
      }
    }

    /*
    ============================================================
    11. UPLOAD RECEIPT
    ============================================================
    */

    const extension = receipt.name?.split(".").pop()?.toLowerCase() || "file";

    const filePath = `academy/${enrollment.id}-${actualPaymentType}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(filePath, receipt, {
        upsert: false,
        contentType: receipt.type,
      });

    if (uploadError) {
      console.error("Academy receipt upload failed:", uploadError);

      console.timeEnd("academy-receipt");

      return NextResponse.json(
        {
          error:
            "Receipt upload failed. Please check your internet connection and try again.",
          code: "RECEIPT_UPLOAD_FAILED",
          retryable: true,
        },
        {
          status: 503,
        },
      );
    }

    /*
    ============================================================
    12. REJECTED PAYMENT → RESUBMISSION
    ============================================================
    */

    if (existingPayment?.status === "rejected") {
      const { error: updateError } = await supabase
        .from("academy_enrollment_payments")
        .update({
          amount,
          payment_method: "bank_transfer",
          receipt_url: filePath,
          receipt_filename: receipt.name,
          status: "pending",
          rejection_reason: null,
          reviewed_by: null,
          reviewed_at: null,
          admin_note: null,
        })
        .eq("id", existingPayment.id);

      if (updateError) {
        console.error("Academy payment resubmission failed:", updateError);

        await supabase.storage.from("receipts").remove([filePath]);

        console.timeEnd("academy-receipt");

        return NextResponse.json(
          {
            error: "Failed to resubmit your payment.",
          },
          {
            status: 500,
          },
        );
      }

      /*
      ----------------------------------------------------------
      Update linked transaction
      ----------------------------------------------------------
      */

      if (existingPayment.payment_transaction_id) {
        const { error: transactionUpdateError } = await supabase
          .from("payment_transactions")
          .update({
            amount,
            payment_type: actualPaymentType,
            payment_method: "bank_transfer",
            status: "pending",
            updated_at: new Date().toISOString(),
            metadata: {
              uploadedReceipt: true,
              resubmitted: true,
              receipt_url: filePath,
              receipt_filename: receipt.name,
              enrollment_number: enrollment.enrollment_number,
            },
          })
          .eq("id", existingPayment.payment_transaction_id);

        if (transactionUpdateError) {
          console.error(
            "Academy transaction resubmission failed:",
            transactionUpdateError,
          );

          await supabase.storage.from("receipts").remove([filePath]);

          return NextResponse.json(
            {
              error: "Failed to update the payment transaction.",
            },
            {
              status: 500,
            },
          );
        }
      }

      /*
      ----------------------------------------------------------
      Notify admin
      ----------------------------------------------------------
      */

      await supabase.from("admin_notifications").insert({
        type: "academy_receipt_uploaded",
        message: `Academy ${actualPaymentType} receipt resubmitted for enrollment ${
          enrollment.enrollment_number || enrollment.id
        }`,
      });

      console.timeEnd("academy-receipt");

      return NextResponse.json({
        success: true,
        resubmitted: true,
        paymentType: actualPaymentType,
        amount,
        receipt_url: filePath,
      });
    }

    /*
    ============================================================
    13. CREATE ACADEMY PAYMENT
    ============================================================
    */

    const { data: payment, error: paymentError } = await supabase
      .from("academy_enrollment_payments")
      .insert({
        enrollment_id: enrollment.id,
        amount,
        payment_method: "bank_transfer",
        payment_type: actualPaymentType,
        status: "pending",
        receipt_url: filePath,
        receipt_filename: receipt.name,
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Academy payment insert failed:", paymentError);

      await supabase.storage.from("receipts").remove([filePath]);

      console.timeEnd("academy-receipt");

      return NextResponse.json(
        {
          error: "Failed to save your payment.",
        },
        {
          status: 500,
        },
      );
    }

    /*
    ============================================================
    14. CREATE PAYMENT TRANSACTION
    ============================================================
    */

    const { data: transaction, error: transactionError } = await supabase
      .from("payment_transactions")
      .insert({
        provider: "bank_transfer",

        provider_reference: crypto.randomUUID(),

        entity_type: "academy_enrollment",

        entity_id: enrollment.id,

        payment_type: actualPaymentType,

        user_id: session.user.id,

        amount,

        currency: "NGN",

        payment_method: "bank_transfer",

        status: "pending",

        email: enrollment.email,

        source_record_id: payment.id,

        metadata: {
          uploadedReceipt: true,
          receipt_url: filePath,
          receipt_filename: receipt.name,
          enrollment_number: enrollment.enrollment_number,
        },
      })
      .select()
      .single();

    if (transactionError) {
      console.error("Academy transaction insert failed:", transactionError);

      /*
      Roll back payment
      */

      await supabase
        .from("academy_enrollment_payments")
        .delete()
        .eq("id", payment.id);

      await supabase.storage.from("receipts").remove([filePath]);

      console.timeEnd("academy-receipt");

      return NextResponse.json(
        {
          error: "Failed to record the payment transaction.",
        },
        {
          status: 500,
        },
      );
    }

    /*
    ============================================================
    15. LINK TRANSACTION TO ACADEMY PAYMENT
    ============================================================
    */

    const { error: paymentLinkError } = await supabase
      .from("academy_enrollment_payments")
      .update({
        payment_transaction_id: transaction.id,
      })
      .eq("id", payment.id);

    if (paymentLinkError) {
      console.error(
        "Failed to link academy payment transaction:",
        paymentLinkError,
      );

      /*
      Roll back both records
      */

      await supabase
        .from("payment_transactions")
        .delete()
        .eq("id", transaction.id);

      await supabase
        .from("academy_enrollment_payments")
        .delete()
        .eq("id", payment.id);

      await supabase.storage.from("receipts").remove([filePath]);

      console.timeEnd("academy-receipt");

      return NextResponse.json(
        {
          error: "Failed to link the payment transaction.",
        },
        {
          status: 500,
        },
      );
    }

    /*
    ============================================================
    16. ADMIN NOTIFICATION
    ============================================================
    */

    await supabase.from("admin_notifications").insert({
      type: "academy_receipt_uploaded",
      message: `Academy ${actualPaymentType} receipt uploaded for enrollment ${
        enrollment.enrollment_number || enrollment.id
      }`,
    });

    /*
    ============================================================
    17. SUCCESS
    ============================================================
    */

    console.timeEnd("academy-receipt");

    return NextResponse.json({
      success: true,

      payment: {
        id: payment.id,
        enrollmentId: enrollment.id,
        amount,
        paymentType: actualPaymentType,
        status: "pending",
        receipt_url: filePath,
      },

      transaction: {
        id: transaction.id,
        provider: "bank_transfer",
        status: "pending",
      },

      message:
        "Your payment receipt has been submitted and is awaiting academy verification.",
    });
  } catch (error) {
    console.error("Academy receipt handler crashed:", error);

    console.timeEnd("academy-receipt");

    return NextResponse.json(
      {
        error:
          "Unable to submit your payment receipt right now. Please try again.",
        code: "ACADEMY_RECEIPT_ERROR",
        retryable: true,
      },
      {
        status: 500,
      },
    );
  }
}
