import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { appointmentId, amount, paymentMethod, adminNote } =
      await req.json();

    /*
Convert everything to kobo to avoid floating point errors
*/

    const settlementAmountKobo = Math.round(Number(amount) * 100);

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required." },
        { status: 400 },
      );
    }

    if (settlementAmountKobo <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than zero." },
        { status: 400 },
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method is required." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    /*
    Fetch appointment
    */

    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: "Appointment not found." },
        { status: 404 },
      );
    }

    if (appointment.status !== "completed") {
      return NextResponse.json(
        {
          error: "Only completed appointments can be settled.",
        },
        { status: 400 },
      );
    }

    const currentBalanceKobo = Math.round(
      Number(appointment.balance_due || 0) * 100,
    );

    const currentPaidKobo = Math.round(
      Number(appointment.amount_paid || 0) * 100,
    );

    if (currentBalanceKobo <= 0) {
      return NextResponse.json(
        {
          error: "This appointment has already been fully settled.",
        },
        { status: 409 },
      );
    }

    if (settlementAmountKobo > currentBalanceKobo) {
      return NextResponse.json(
        {
          error: "Settlement amount exceeds outstanding balance.",
        },
        { status: 400 },
      );
    }

    const newAmountPaidKobo = currentPaidKobo + settlementAmountKobo;

    const newBalanceKobo = currentBalanceKobo - settlementAmountKobo;

    /*
    Record adjustment
    */

    const { error: adjustmentError } = await supabase
      .from("appointment_payment_adjustments")
      .insert({
        appointment_id: appointmentId,
        adjustment_type: "outstanding_payment",
        amount: settlementAmountKobo / 100,
        payment_method: paymentMethod,
        reason: adminNote || null,
        recorded_by: session.user.id,
        affects_balance: true,
        impact_direction: "decrease",
      });

    if (adjustmentError) {
      throw adjustmentError;
    }

    /*
    Update appointment
    */

    const updatePayload = {
      amount_paid: newAmountPaidKobo / 100,
      balance_due: newBalanceKobo / 100,
    };

    /*
    Fully settled
    */

    if (newBalanceKobo === 0) {
      updatePayload.settled_at = new Date().toISOString();

      updatePayload.settled_by = session.user.id;
    }

    const { data: updatedAppointment, error: updateError } = await supabase
      .from("appointments")
      .update(updatePayload)
      .eq("id", appointmentId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      fullySettled: newBalanceKobo === 0,
      updatedAppointment,
    });
  } catch (error) {
    console.error("Settle outstanding error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to settle outstanding balance.",
      },
      { status: 500 },
    );
  }
}
