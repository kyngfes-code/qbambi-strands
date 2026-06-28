import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      user_id,
      total_amount,
      payment_method,
      delivered_at,
       customer:users!orders_user_id_fkey (
      id,
      name,
      email,
      phone
    )
    `,
    )
    .eq("status", "delivered")
    .order("delivered_at", { ascending: false });

  if (error) {
    console.error("Delivered Orders API Error:", error);

    return NextResponse.json(
      {
        error: error.message,
        details: error,
      },
      { status: 500 },
    );
  }

  return NextResponse.json(data);
}
