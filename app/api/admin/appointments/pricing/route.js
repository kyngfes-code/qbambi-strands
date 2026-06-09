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

    const {
      appointmentId,
      serviceAmount,
      depositRequired,
      paymentType,
      adminNotes,
    } = await req.json();

    /*
      Validation
    */

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 },
      );
    }

    if (
      serviceAmount === undefined ||
      serviceAmount === null ||
      Number(serviceAmount) <= 0
    ) {
      return NextResponse.json(
        { error: "Valid service amount is required" },
        { status: 400 },
      );
    }

    const totalAmount = Number(serviceAmount);

    const deposit = Number(depositRequired || 0);

    const paymentOption = paymentType || "deposit";

    if (paymentOption !== "deposit" && paymentOption !== "full") {
      return NextResponse.json(
        {
          error: "Payment type must be either 'deposit' or 'full'",
        },
        { status: 400 },
      );
    }

    /*
      Full payment means entire amount required
    */

    let requiredDeposit = deposit;

    if (paymentOption === "full") {
      requiredDeposit = totalAmount;
    }

    /*
      Deposit cannot exceed service amount
    */

    if (requiredDeposit > totalAmount) {
      return NextResponse.json(
        {
          error: "Deposit required cannot exceed service amount",
        },
        { status: 400 },
      );
    }

    const supabaseAdmin = createSupabaseAdmin();

    /*
      Fetch appointment
    */

    const { data: appointment, error: fetchError } = await supabaseAdmin
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .single();

    if (fetchError || !appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );
    }

    /*
      Prevent pricing completed/cancelled appointments
    */

    if (
      appointment.status === "completed" ||
      appointment.status === "cancelled"
    ) {
      return NextResponse.json(
        {
          error: "Pricing cannot be updated for this appointment",
        },
        { status: 400 },
      );
    }

    /*
      Update appointment pricing
    */

    const { data: updatedAppointment, error: updateError } = await supabaseAdmin
      .from("appointments")
      .update({
        service_amount: totalAmount,
        deposit_required: requiredDeposit,
        balance_due: totalAmount - Number(appointment.amount_paid || 0),
        payment_type: paymentOption,
        admin_notes: adminNotes || null,
      })
      .eq("id", appointmentId)
      .select()
      .single();

    if (updateError) {
      console.error(updateError);

      return NextResponse.json(
        {
          error: "Failed to set appointment pricing",
          details: updateError.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Appointment pricing updated successfully.",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Appointment pricing error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
