import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req) {
  try {
    /*
    ==========================================
    Authenticate User
    ==========================================
    */

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    /*
    ==========================================
    Parse Request
    ==========================================
    */

    const {
      appointmentId,
      requestedAmount,
      reason,
      customerMessage = null,
    } = await req.json();

    if (!appointmentId) {
      return NextResponse.json(
        {
          error: "Appointment ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!requestedAmount || Number(requestedAmount) <= 0) {
      return NextResponse.json(
        {
          error: "Requested amount must be greater than zero.",
        },
        {
          status: 400,
        },
      );
    }

    if (!reason?.trim()) {
      return NextResponse.json(
        {
          error: "Reason is required.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    ==========================================
    Supabase
    ==========================================
    */

    const supabase = createSupabaseAdmin();

    /*
    ==========================================
    Verify Appointment Ownership
    ==========================================
    */

    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select(
        `
  id,
  service_name,
  user_id,
  status,
  amount_paid,
  refunded_amount
`,
      )
      .eq("id", appointmentId)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        {
          error: "Appointment not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (appointment.user_id !== session.user.id) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to request a refund for this appointment.",
        },
        {
          status: 403,
        },
      );
    }

    /*
    ==========================================
    Prevent Duplicate Pending Request
    ==========================================
    */

    const { data: existing } = await supabase
      .from("appointment_refund_requests")
      .select("id")
      .eq("appointment_id", appointmentId)
      .eq("status", "pending")
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          error: "A refund request is already pending.",
        },
        {
          status: 409,
        },
      );
    }

    /*
    ==========================================
    Calculate Maximum Refundable
    ==========================================
    */

    const amountPaid = Number(appointment.amount_paid || 0);
    const refunded = Number(appointment.refunded_amount || 0);

    const refundable = Math.max(amountPaid - refunded, 0);

    if (refundable <= 0) {
      return NextResponse.json(
        {
          error: "No refundable balance is available.",
        },
        {
          status: 400,
        },
      );
    }

    if (Number(requestedAmount) > refundable) {
      return NextResponse.json(
        {
          error: `Maximum refundable amount is ₦${refundable.toLocaleString()}.`,
        },
        {
          status: 400,
        },
      );
    }

    /*
    ==========================================
    Create Refund Request
    ==========================================
    */

    const { data, error } = await supabase
      .from("appointment_refund_requests")
      .insert({
        appointment_id: appointmentId,
        requested_by: session.user.id,
        requested_amount: Number(requestedAmount),
        reason,
        customer_message: customerMessage,
      })
      .select()
      .single();

    if (error) {
      console.error(error);

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 400,
        },
      );
    }

    /*
==========================================
Create Admin Notification
==========================================
*/

    await supabase.from("admin_notifications").insert({
      type: "appointment_refund_request",
      title: "Appointment Refund Request",
      message: `A customer requested a refund for ${appointment.service_name}.`,
      reference_id: data.id,
    });

    /*
    ==========================================
    Success
    ==========================================
    */

    return NextResponse.json({
      success: true,
      message: "Refund request submitted successfully.",
      refundRequest: data,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Internal server error.",
      },
      {
        status: 500,
      },
    );
  }
}
