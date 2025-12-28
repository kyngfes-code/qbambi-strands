import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req) {
  try {
    /* =====================
       AUTH
    ====================== */
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* =====================
       INPUT
    ====================== */
    const body = await req.json();
    const { orderId, months } = body;

    if (!orderId || typeof months !== "number") {
      return NextResponse.json(
        { error: "Missing or invalid orderId or months" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();

    /* =====================
       FETCH ORDER
    ====================== */
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, total_amount")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    /* =====================
       CREATE PAYMENT PLAN
    ====================== */
    const planMeta = {
      1: {
        payment_plan: "two_installments",
        plan_type: "2_instalments",
        chargePercent: 5,
      },
      2: {
        payment_plan: "three_installments",
        plan_type: "3_instalments",
        chargePercent: 7,
      },
    };

    const meta = planMeta[months];
    if (!meta) {
      return NextResponse.json(
        { error: "Invalid payment plan" },
        { status: 400 }
      );
    }

    const originalPrice = Number(order.total_amount);

    const chargePercent = meta.chargePercent;
    const chargeAmount = originalPrice * (chargePercent / 100);
    const totalAmount = originalPrice + chargeAmount;

    if (!Number.isFinite(totalAmount)) {
      console.error("Invalid totalAmount", {
        originalPrice,
        chargePercent,
        chargeAmount,
        totalAmount,
      });
      return NextResponse.json(
        { error: "Invalid payment plan calculation" },
        { status: 400 }
      );
    }

    const instalmentCount = months + 1;
    const instalmentAmount = totalAmount / instalmentCount;

    const start = new Date();

    const dueDates = Array.from({ length: instalmentCount }).map((_, i) => {
      const d = new Date(start);
      d.setMonth(d.getMonth() + i + 1);
      return d.toISOString().split("T")[0];
    });

    const { data: plan, error: planError } = await supabase
      .from("payment_plans")
      .insert({
        order_id: order.id,
        user_id: session.user.id,

        original_price: originalPrice,
        total_amount: totalAmount,
        instalment_amount: instalmentAmount,
        outstanding_balance: totalAmount,

        payment_plan: meta.payment_plan,
        plan_type: meta.plan_type,

        instalment_count: instalmentCount,
        due_dates: dueDates,

        status: "active",
      })
      .select()
      .single();

    if (planError || !plan) {
      console.error("Payment plan creation failed:", planError);
      return NextResponse.json(
        { error: "Failed to create payment plan" },
        { status: 500 }
      );
    }

    /* =====================
       CREATE INSTALMENTS
    ====================== */
    const instalments = Array.from({ length: instalmentCount }).map(
      (_, index) => {
        const due = new Date(start);

        if (index > 0) {
          due.setDate(due.getDate() + index * 30);
        }

        return {
          payment_plan_id: plan.id,
          due_date: due.toISOString().split("T")[0],
          amount: instalmentAmount,
          status: "pending",
        };
      }
    );

    const { error: instalmentsError } = await supabase
      .from("instalments")
      .insert(instalments);

    if (instalmentsError) {
      console.error("Instalments creation failed:", instalmentsError);
      return NextResponse.json(
        { error: "Failed to create instalments" },
        { status: 500 }
      );
    }

    /* =====================
       UPDATE ORDER STATUS
    ====================== */
    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({ status: "payment_plan_active" })
      .eq("id", orderId);

    if (orderUpdateError) {
      console.error("Order status update failed:", orderUpdateError);
      return NextResponse.json(
        { error: "Failed to update order status" },
        { status: 500 }
      );
    }

    /* =====================
       SUCCESS
    ====================== */
    return NextResponse.json({ success: true, plan });
  } catch (err) {
    console.error("Unhandled error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
