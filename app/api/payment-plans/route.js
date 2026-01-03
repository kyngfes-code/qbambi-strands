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
      .select("id, total_amount, user_id, payment_plan_id")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.payment_plan_id) {
      return NextResponse.json(
        { error: "Payment plan already exists for this order" },
        { status: 400 }
      );
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

    const baseDate = new Date();

    const dueDates = Array.from({ length: instalmentCount }).map((_, index) => {
      const d = new Date(baseDate);

      if (index === 0) {
        // First instalment: now
        return d.toISOString().split("T")[0];
      }

      if (index === 1) {
        // Second instalment: 30 days from now
        d.setDate(d.getDate() + 30);
        return d.toISOString().split("T")[0];
      }

      // Third (and beyond): +1 month from previous
      d.setDate(d.getDate() + 30 * index);
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
    const instalmentRatios =
      instalmentCount === 2 ? [0.5, 0.5] : [0.4, 0.3, 0.3];

    if (instalmentRatios.length !== instalmentCount) {
      return NextResponse.json(
        { error: "Instalment configuration mismatch" },
        { status: 500 }
      );
    }
    const instalments = instalmentRatios.map((ratio, index) => {
      return {
        payment_plan_id: plan.id,
        order_id: order.id,
        instalment_number: index + 1,
        due_date: dueDates[index],
        amount: Math.round(totalAmount * ratio),
        paid: false,
      };
    });

    const { data: createdInstalments, error: instalmentsError } = await supabase
      .from("instalments")
      .insert(instalments)
      .select();

    if (instalmentsError || !createdInstalments?.length) {
      return NextResponse.json(
        { error: "Failed to create instalments" },
        { status: 500 }
      );
    }

    const nextInstalment = createdInstalments.sort(
      (a, b) => new Date(a.due_date) - new Date(b.due_date)
    )[0];

    /* =====================
       UPDATE ORDER STATUS
    ====================== */
    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({ payment_plan_id: plan.id, status: "payment_plan_active" })
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
    return NextResponse.json({
      success: true,
      payment_plan_id: plan.id,
      next_instalment_id: nextInstalment.id,
      next_instalment_due_date: nextInstalment.due_date,
      next_instalment_amount: nextInstalment.amount,
    });
  } catch (err) {
    console.error("Unhandled error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
