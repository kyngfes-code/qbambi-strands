import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req, { params }) {
  try {
    //-----------------------------------------------------
    // Auth
    //-----------------------------------------------------

    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    //-----------------------------------------------------
    // Params
    //-----------------------------------------------------

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Payment ID is required." },
        { status: 400 },
      );
    }

    //-----------------------------------------------------
    // Body
    //-----------------------------------------------------

    const { action, adminNote, rejectionReason } = await req.json();

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    if (action === "reject" && !rejectionReason?.trim()) {
      return NextResponse.json(
        {
          error: "Rejection reason is required.",
        },
        {
          status: 400,
        },
      );
    }

    //-----------------------------------------------------
    // RPC
    //-----------------------------------------------------

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase.rpc("review_academy_payment", {
      p_payment_id: id,
      p_action: action,
      p_admin_id: session.user.id,
      p_admin_note: adminNote ?? null,
      p_rejection_reason: rejectionReason ?? null,
    });

    if (error) throw error;

    //-----------------------------------------------------
    // Success
    //-----------------------------------------------------

    return NextResponse.json({
      success: true,
      result: data,
    });
  } catch (err) {
    console.error("Review Academy Payment:", err);

    return NextResponse.json(
      {
        error: err.message || "Unable to review payment.",
      },
      {
        status: 500,
      },
    );
  }
}
