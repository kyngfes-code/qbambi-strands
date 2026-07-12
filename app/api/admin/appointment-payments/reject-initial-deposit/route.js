import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req) {
  try {
    const session = await auth();

    // Must be logged in
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Must be admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { paymentId, rejectionReason, customerMessage } = await req.json();

    // Validation
    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 },
      );
    }

    if (!rejectionReason) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
        { status: 400 },
      );
    }

    const supabaseAdmin = createSupabaseAdmin();

    /*
      STEP 1:
      Fetch payment
    */
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("appointment_payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: "Appointment payment not found" },
        { status: 404 },
      );
    }

    /*
      Prevent rejecting confirmed payments
    */
    if (payment.status === "confirmed") {
      return NextResponse.json(
        {
          error: "Confirmed payments cannot be rejected",
        },
        { status: 400 },
      );
    }

    /*
      Prevent rejecting already rejected payments
    */
    if (payment.status === "rejected") {
      return NextResponse.json(
        {
          error: "This payment has already been rejected",
        },
        { status: 400 },
      );
    }

    /*
      STEP 2:
      Reject payment
    */
    const { error: updateError } = await supabaseAdmin
      .from("appointment_payments")
      .update({
        status: "rejected",
        rejection_reason: rejectionReason,
        customer_message:
          customerMessage ||
          "Your payment could not be verified. Please review the reason and submit a new payment.",
      })
      .eq("id", paymentId);

    if (updateError) {
      console.error(updateError);

      return NextResponse.json(
        {
          error: "Failed to reject payment",
          details: updateError.message,
        },
        { status: 500 },
      );
    }

    /*
      NOTE:
      Appointment remains pending.
      Customer can retry payment.
    */

    return NextResponse.json({
      success: true,
      message: "Appointment payment rejected successfully.",
    });
  } catch (error) {
    console.error("Appointment payment rejection error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
