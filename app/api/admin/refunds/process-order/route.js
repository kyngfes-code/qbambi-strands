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
      action,
      approvedAmount,
      adminNote,
      refundMethod,
      refundReference,
    } = await req.json();

    if (!refundRequestId) {
      return NextResponse.json(
        { error: "Refund request is required." },
        { status: 400 },
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();

    let rpcResult;

    if (action === "approve") {
      if (!refundMethod) {
        return NextResponse.json(
          { error: "Refund method is required." },
          { status: 400 },
        );
      }

      const { data, error } = await supabase.rpc("process_order_refund", {
        p_refund_request_id: refundRequestId,
        p_admin_id: session.user.id,
        p_approved_amount: approvedAmount ?? null,
        p_admin_note: adminNote ?? null,
        p_refund_method: refundMethod,
        p_refund_reference: refundReference ?? null,
      });

      if (error) {
        console.error(error);

        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      rpcResult = data;
    } else {
      const { data, error } = await supabase.rpc("reject_order_refund", {
        p_refund_request_id: refundRequestId,
        p_admin_id: session.user.id,
        p_admin_note: adminNote || null,
      });

      if (error) {
        console.error(error);

        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      rpcResult = data;
    }

    return NextResponse.json(rpcResult);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
