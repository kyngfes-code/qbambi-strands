import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseAdmin();

    /*
    ==========================================
    Appointment Refunds
    ==========================================
    */

    const { data: appointmentRefunds, error: appointmentError } = await supabase
      .from("appointment_payment_adjustments")
      .select(
        `
        *,
        appointment:appointments!inner(
          id,
          user_id,
          service_name,
          appointment_date,
          appointment_time
        )
      `,
      )
      .in("adjustment_type", ["refund_pending", "refund"])
      .eq("appointment.user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (appointmentError) {
      console.error(appointmentError);

      return NextResponse.json(
        { error: "Failed to load appointment refunds." },
        { status: 500 },
      );
    }

    /*
    ==========================================
    Order Refunds
    ==========================================
    */

    const { data: orderRefunds, error: orderError } = await supabase
      .from("order_refund_requests")
      .select(
        `
        *,
        order:orders!inner(
          id,
          user_id,
          created_at
        )
      `,
      )
      .eq("order.user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (orderError) {
      console.error(orderError);

      return NextResponse.json(
        { error: "Failed to load order refunds." },
        { status: 500 },
      );
    }

    /*
    ==========================================
    Normalize Appointment Refunds
    ==========================================
    */

    const normalizedAppointments = (appointmentRefunds || []).map((refund) => ({
      ...refund,
      type: "appointment",

      // normalize workflow status
      status:
        refund.refund_status === "completed"
          ? "approved"
          : refund.refund_status === "cancelled"
            ? "rejected"
            : refund.refund_status,
    }));

    /*
    ==========================================
    Normalize Order Refunds
    ==========================================
    */

    const normalizedOrders = (orderRefunds || []).map((r) => ({
      ...r,
      type: "order",

      // already uses workflow status
      status: r.status,
    }));

    /*
    ==========================================
    Combine
    ==========================================
    */

    const refunds = [...normalizedAppointments, ...normalizedOrders].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );

    /*
    ==========================================
    Split
    ==========================================
    */

    const pendingRefunds = refunds.filter(
      (r) => r.status === "pending" || r.status === "processing",
    );

    const approvedRefunds = refunds.filter((r) => r.status === "approved");

    const rejectedRefunds = refunds.filter((r) => r.status === "rejected");

    return NextResponse.json({
      pendingRefunds,
      approvedRefunds,
      rejectedRefunds,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
