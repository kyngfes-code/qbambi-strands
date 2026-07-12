import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { orderId, reason, message, adminNote } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    if (!reason) {
      return NextResponse.json(
        { error: "Rejection reason is required." },
        { status: 400 },
      );
    }

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Customer message is required." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase.rpc(
      "reject_order_bank_transfer_payment",
      {
        p_order_id: orderId,
        p_admin_id: session.user.id,
        p_rejection_reason: reason,
        p_customer_message: message,
        p_admin_note: adminNote ?? null,
      },
    );

    if (error) {
      console.error("RPC Error:", error);

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      rejectionId: data,
    });
  } catch (error) {
    console.error("Reject payment error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
