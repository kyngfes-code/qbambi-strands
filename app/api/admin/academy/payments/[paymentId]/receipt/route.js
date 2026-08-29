import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { z } from "zod";

const paymentIdSchema = z.string().uuid();

// Signed URL lifetime.
// 5 minutes is enough for an admin to open/view/download the receipt.
const SIGNED_URL_EXPIRY = 5 * 60;

export async function GET(req, { params }) {
  try {
    /*
    ============================================================
    1. AUTHENTICATION
    ============================================================
    */

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
          code: "UNAUTHORIZED",
        },
        {
          status: 401,
        },
      );
    }

    /*
    ============================================================
    2. VERIFY ADMIN
    ============================================================

    Adjust this check if your NextAuth session uses a different
    property for admin users.
    */

    const isAdmin =
      session.user.role === "admin" ||
      session.user.isAdmin === true ||
      session.user.accountType === "admin";

    if (!isAdmin) {
      return NextResponse.json(
        {
          error: "Admin access required.",
          code: "ADMIN_ACCESS_REQUIRED",
        },
        {
          status: 403,
        },
      );
    }

    /*
    ============================================================
    3. PAYMENT ID
    ============================================================
    */

    const { paymentId } = await params;

    const parsedPaymentId = paymentIdSchema.safeParse(paymentId);

    if (!parsedPaymentId.success) {
      return NextResponse.json(
        {
          error: "Invalid payment ID.",
          code: "INVALID_PAYMENT_ID",
        },
        {
          status: 400,
        },
      );
    }

    const id = parsedPaymentId.data;

    /*
    ============================================================
    4. SUPABASE ADMIN
    ============================================================
    */

    const supabase = createSupabaseAdmin();

    /*
    ============================================================
    5. GET PAYMENT
    ============================================================
    */

    const { data: payment, error: paymentError } = await supabase
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
          payment_type,
          payment_transaction_id,
          created_at,
          enrollment:academy_enrollments(
            id,
            enrollment_number,
            first_name,
            last_name,
            email,
            status
          )
        `,
      )
      .eq("id", id)
      .maybeSingle();

    if (paymentError) {
      console.error("Academy payment receipt query failed:", paymentError);

      return NextResponse.json(
        {
          error: "Unable to retrieve the payment.",
          code: "PAYMENT_QUERY_FAILED",
        },
        {
          status: 500,
        },
      );
    }

    if (!payment) {
      return NextResponse.json(
        {
          error: "Payment not found.",
          code: "PAYMENT_NOT_FOUND",
        },
        {
          status: 404,
        },
      );
    }

    /*
    ============================================================
    6. VERIFY RECEIPT EXISTS
    ============================================================
    */

    if (!payment.receipt_url) {
      return NextResponse.json(
        {
          error: "No receipt has been uploaded for this payment.",
          code: "RECEIPT_NOT_FOUND",
        },
        {
          status: 404,
        },
      );
    }

    /*
    ============================================================
    7. CREATE SIGNED URL
    ============================================================

    receipt_url contains the Storage object path, for example:

      academy/uuid-initial_payment-123456789.jpg

    It is NOT a public URL.

    We generate a fresh temporary URL whenever the admin
    requests the receipt.
    */

    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from("receipts")
        .createSignedUrl(payment.receipt_url, SIGNED_URL_EXPIRY);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error(
        "Academy receipt signed URL generation failed:",
        signedUrlError,
      );

      return NextResponse.json(
        {
          error: "Unable to generate a secure receipt URL.",
          code: "SIGNED_URL_FAILED",
        },
        {
          status: 500,
        },
      );
    }

    /*
    ============================================================
    8. SUCCESS
    ============================================================
    */

    return NextResponse.json({
      success: true,

      receipt: {
        paymentId: payment.id,
        enrollmentId: payment.enrollment_id,

        enrollmentNumber: payment.enrollment?.enrollment_number || null,

        studentName: payment.enrollment
          ? [payment.enrollment.first_name, payment.enrollment.last_name]
              .filter(Boolean)
              .join(" ")
          : null,

        filename: payment.receipt_filename || null,

        paymentType: payment.payment_type || null,

        amount: Number(payment.amount || 0),

        paymentStatus: payment.status,

        receiptPath: payment.receipt_url,

        url: signedUrlData.signedUrl,

        expiresIn: SIGNED_URL_EXPIRY,
      },
    });
  } catch (error) {
    console.error("Academy receipt view handler crashed:", error);

    return NextResponse.json(
      {
        error: "Unable to view the payment receipt right now.",
        code: "ACADEMY_RECEIPT_VIEW_ERROR",
      },
      {
        status: 500,
      },
    );
  }
}
