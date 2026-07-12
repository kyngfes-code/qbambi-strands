import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req) {
  try {
    const session = await auth();

    // Must be logged in
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Must be admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabaseAdmin = createSupabaseAdmin();

    const body = await req.json();

    const { appointmentId, serviceAmount, depositRequired, adminNotes } = body;

    // Validate input
    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required." },
        { status: 400 },
      );
    }

    if (
      serviceAmount === undefined ||
      serviceAmount === null ||
      Number.isNaN(Number(serviceAmount))
    ) {
      return NextResponse.json(
        { error: "A valid service amount is required." },
        { status: 400 },
      );
    }

    if (
      depositRequired === undefined ||
      depositRequired === null ||
      Number.isNaN(Number(depositRequired))
    ) {
      return NextResponse.json(
        { error: "A valid deposit amount is required." },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin.rpc("set_appointment_pricing", {
      p_appointment_id: appointmentId,
      p_service_amount: Number(serviceAmount),
      p_deposit_required: Number(depositRequired),
      p_changed_by: session.user.id,
      p_reason: adminNotes?.trim() || null,
    });

    if (error) {
      console.error("RPC Error:", error);

      const message = error.message || "Unable to update appointment pricing.";

      // Appointment not found
      if (message.toLowerCase().includes("not found")) {
        return NextResponse.json({ error: message }, { status: 404 });
      }

      // Completed appointment
      if (
        message.toLowerCase().includes("completed") ||
        message.toLowerCase().includes("cannot have their pricing changed")
      ) {
        return NextResponse.json({ error: message }, { status: 409 });
      }

      // Validation errors from RPC
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Appointment pricing updated successfully.",
      appointment: data,
    });
  } catch (error) {
    console.error("POST /api/admin/appointments/set-pricing:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
