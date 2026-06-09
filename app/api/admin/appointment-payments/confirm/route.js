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

    const { paymentId } = await req.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 },
      );
    }

    const supabaseAdmin = createSupabaseAdmin();

    /*
      STEP 1:
      Fetch payment details
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
      Prevent confirming twice
    */
    if (payment.status === "confirmed") {
      return NextResponse.json(
        { error: "Payment already confirmed" },
        { status: 400 },
      );
    }

    /*
      STEP 2:
      Fetch appointment
    */
    const { data: appointment, error: appointmentError } = await supabaseAdmin
      .from("appointments")
      .select("*")
      .eq("id", payment.appointment_id)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: "Associated appointment not found" },
        { status: 404 },
      );
    }

    /*
      STEP 3:
      Confirm payment
    */
    const { error: confirmPaymentError } = await supabaseAdmin
      .from("appointment_payments")
      .update({
        status: "confirmed",
        confirmed_by: session.user.id,
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", paymentId);

    if (confirmPaymentError) {
      console.error(confirmPaymentError);

      return NextResponse.json(
        {
          error: "Failed to confirm payment",
          details: confirmPaymentError.message,
        },
        { status: 500 },
      );
    }

    /*
      STEP 4:
      Update appointment financials
    */
    const currentAmountPaid = Number(appointment.amount_paid || 0);

    const serviceAmount = Number(appointment.service_amount || 0);

    const depositRequired = Number(appointment.deposit_required || 0);

    const paymentAmount = Number(payment.amount || 0);

    const newAmountPaid = currentAmountPaid + paymentAmount;

    const newBalanceDue = Math.max(serviceAmount - newAmountPaid, 0);

    /*
      STEP 5:
      Determine appointment status
    */
    const appointmentUpdates = {
      amount_paid: newAmountPaid,
      balance_due: newBalanceDue,
    };

    /*
      Automatically confirm appointment
      once required deposit has been met
    */
    if (appointment.status === "pending" && newAmountPaid >= depositRequired) {
      appointmentUpdates.status = "confirmed";
      appointmentUpdates.confirmed_at = new Date().toISOString();
      appointmentUpdates.confirmed_by = session.user.id;
    }

    const { error: appointmentUpdateError } = await supabaseAdmin
      .from("appointments")
      .update(appointmentUpdates)
      .eq("id", appointment.id);

    if (appointmentUpdateError) {
      console.error(appointmentUpdateError);

      return NextResponse.json(
        {
          error: "Payment confirmed but appointment update failed",
          details: appointmentUpdateError.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        appointmentUpdates.status === "confirmed"
          ? "Payment confirmed and appointment confirmed."
          : "Payment confirmed successfully.",
    });
  } catch (error) {
    console.error("Appointment payment confirmation error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
