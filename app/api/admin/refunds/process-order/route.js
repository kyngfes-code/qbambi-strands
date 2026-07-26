import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const {
      refundRequestId,
      approvedAmount,
      adminNote,
      refundMethod,
      refundReference,
    } = await req.json();

    // -----------------------------
    // Validation
    // -----------------------------

    if (!refundRequestId) {
      return NextResponse.json(
        { error: "Refund request is required." },
        { status: 400 },
      );
    }

    if (
      approvedAmount === undefined ||
      approvedAmount === null ||
      Number(approvedAmount) <= 0
    ) {
      return NextResponse.json(
        { error: "Approved amount is required." },
        { status: 400 },
      );
    }

    if (!refundMethod) {
      return NextResponse.json(
        { error: "Refund method is required." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase.rpc("process_order_refund", {
      p_refund_request_id: refundRequestId,
      p_admin_id: session.user.id,
      p_approved_amount: Number(approvedAmount),
      p_admin_note: adminNote?.trim() || null,
      p_refund_method: refundMethod,
      p_refund_reference: refundReference?.trim() || null,
    });

    if (error) {
      console.error("process_order_refund RPC Error:", error);

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Process Order Refund Error:", err);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
