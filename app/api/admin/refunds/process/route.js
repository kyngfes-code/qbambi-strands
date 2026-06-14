import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request) {
  try {
    /*
    ─────────────────────────────────────────────
    Authenticate Admin
    ─────────────────────────────────────────────
    */
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /*
    ─────────────────────────────────────────────
    Parse Request
    ─────────────────────────────────────────────
    */
    const { adjustmentId, refundMethod, adminNote } = await request.json();

    if (!adjustmentId) {
      return NextResponse.json(
        { error: "Refund ID is required." },
        { status: 400 },
      );
    }

    if (!refundMethod) {
      return NextResponse.json(
        { error: "Refund method is required." },
        { status: 400 },
      );
    }

    const allowedMethods = ["bank_transfer", "cash", "pos", "other"];

    if (!allowedMethods.includes(refundMethod)) {
      return NextResponse.json(
        { error: "Invalid refund method." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    /*
    ─────────────────────────────────────────────
    Fetch Refund
    ─────────────────────────────────────────────
    */
    const { data: refund, error: fetchError } = await supabase
      .from("appointment_payment_adjustments")
      .select(
        `
        *,
        appointment:appointments!appointment_payment_adjustments_appointment_id_fkey (
          id,
          service_name,
          appointment_date,
          appointment_time,

          user:users!appointments_user_id_fkey (
            id,
            name,
            email
          )
        )
      `,
      )
      .eq("id", adjustmentId)
      .single();

    if (fetchError || !refund) {
      return NextResponse.json({ error: "Refund not found." }, { status: 404 });
    }

    /*
    ─────────────────────────────────────────────
    Validate Refund
    ─────────────────────────────────────────────
    */
    if (refund.adjustment_type !== "refund") {
      return NextResponse.json(
        { error: "Adjustment is not a refund." },
        { status: 400 },
      );
    }

    if (refund.refund_status !== "pending") {
      return NextResponse.json(
        {
          error: `Refund is already ${refund.refund_status}.`,
        },
        { status: 409 },
      );
    }

    /*
    ─────────────────────────────────────────────
    Process Refund
    ─────────────────────────────────────────────
    */
    const { data: processedRefund, error: updateError } = await supabase
      .from("appointment_payment_adjustments")
      .update({
        refund_status: "completed",
        refund_method: refundMethod,
        refunded_at: new Date().toISOString(),
        refund_processed_by: session.user.id,

        /*
          Optional:
          Append admin processing note.
          */
        note: adminNote?.trim()
          ? refund.note
            ? `${refund.note}\n\nProcessed: ${adminNote.trim()}`
            : adminNote.trim()
          : refund.note,
      })
      .eq("id", adjustmentId)
      .select(
        `
          *,
          appointment:appointments!appointment_payment_adjustments_appointment_id_fkey (
            id,
            service_name,
            appointment_date,
            appointment_time,

            user:users!appointments_user_id_fkey (
              id,
              name,
              email
            )
          ),

          processor:users!appointment_payment_adjustments_refund_processed_by_fkey (
            id,
            name
          )
        `,
      )
      .single();

    if (updateError) {
      console.error("Refund processing error:", updateError);

      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    /*
    ─────────────────────────────────────────────
    Success
    ─────────────────────────────────────────────
    */
    return NextResponse.json({
      message: "Refund processed successfully.",
      refund: processedRefund,
    });
  } catch (error) {
    console.error("POST /api/admin/refunds/process:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
