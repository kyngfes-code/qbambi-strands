import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { instalmentId } = await req.json();
    if (!instalmentId) {
      return NextResponse.json(
        { error: "Missing instalmentId" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();

    /* 1️⃣ Fetch instalment */
    const { data: instalment, error: instErr } = await supabase
      .from("instalments")
      .select("id, paid, amount, payment_plan_id")
      .eq("id", instalmentId)
      .single();

    if (instErr || !instalment) {
      return NextResponse.json(
        { error: "Instalment not found" },
        { status: 404 }
      );
    }

    if (instalment.paid) {
      return NextResponse.json(
        { error: "Instalment already confirmed" },
        { status: 400 }
      );
    }

    /* 2️⃣ Mark instalment paid */
    const { error: updateErr } = await supabase
      .from("instalments")
      .update({
        paid: true,
        paid_at: new Date().toISOString(),
      })
      .eq("id", instalmentId);

    if (updateErr) {
      console.error(updateErr);
      return NextResponse.json(
        { error: "Failed to confirm instalment" },
        { status: 500 }
      );
    }

    /* 3️⃣ Fetch payment plan (SAFE) */
    const { data: plan, error: planErr } = await supabase
      .from("payment_plans")
      .select("id, order_id, total_amount, outstanding_balance")
      .eq("id", instalment.payment_plan_id)
      .single();

    if (planErr || !plan) {
      return NextResponse.json(
        { error: "Payment plan not found" },
        { status: 404 }
      );
    }

    /* 4️⃣ Recalculate outstanding balance */
    const { data: paidInstalments } = await supabase
      .from("instalments")
      .select("amount")
      .eq("payment_plan_id", plan.id)
      .eq("paid", true);

    const paidTotal = (paidInstalments ?? []).reduce(
      (sum, i) => sum + i.amount,
      0
    );

    const outstanding = plan.total_amount - paidTotal;

    await supabase
      .from("payment_plans")
      .update({
        outstanding_balance: outstanding,
        status: outstanding <= 0 ? "completed" : "active",
      })
      .eq("id", plan.id);

    /* 5️⃣ Update order status (CORRECT LOGIC) */
    // if (outstanding <= 0) {
    //   // Fully paid
    //   await supabase
    //     .from("orders")
    //     .update({ status: "paid" })
    //     .eq("id", plan.order_id);
    // } else {
    //   // First or partial instalment
    //   await supabase
    //     .from("orders")
    //     .update({ status: "payment_plan_active" })
    //     .eq("id", plan.order_id);
    // }

    /* 6️⃣ Mark admin notification read */
    await supabase
      .from("admin_notifications")
      .update({ is_read: true })
      .eq("instalment_id", instalmentId)
      .eq("type", "receipt_uploaded");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Confirm instalment error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
