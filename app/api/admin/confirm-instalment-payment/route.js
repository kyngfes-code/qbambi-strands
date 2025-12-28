import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req) {
  try {
    /* =====================
       AUTH
    ====================== */
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* =====================
       INPUT
    ====================== */
    const { instalmentId } = await req.json();

    if (!instalmentId) {
      return NextResponse.json(
        { error: "Missing instalmentId" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();

    /* =====================
       FETCH INSTALMENT
    ====================== */
    const { data: instalment, error: instErr } = await supabase
      .from("instalments")
      .select("id, paid")
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

    /* =====================
       MARK INSTALMENT AS PAID
       (TRIGGER DOES THE REST)
    ====================== */
    const { error: updateErr } = await supabase
      .from("instalments")
      .update({
        paid: true,
        paid_at: new Date().toISOString(),
      })
      .eq("id", instalmentId);

    if (updateErr) {
      console.error("Failed to update instalment:", updateErr);
      return NextResponse.json(
        { error: "Failed to confirm instalment" },
        { status: 500 }
      );
    }

    /* =====================
       OPTIONAL: MARK NOTIFICATION READ
    ====================== */
    await supabase
      .from("admin_notifications")
      .update({ is_read: true })
      .eq("instalment_id", instalmentId)
      .eq("type", "receipt_uploaded");

    /* =====================
       SUCCESS
    ====================== */
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin confirm payment error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
