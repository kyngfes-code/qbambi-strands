import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { z } from "zod";

export async function GET(req, { params }) {
  try {
    //////////////////////////////////////////////////////
    // Authentication
    //////////////////////////////////////////////////////

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    //////////////////////////////////////////////////////
    // Params
    //////////////////////////////////////////////////////

    const { paymentId } = await params;

    const schema = z.string().uuid();

    const parsed = schema.safeParse(paymentId);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payment." }, { status: 400 });
    }

    //////////////////////////////////////////////////////
    // Supabase
    //////////////////////////////////////////////////////

    const supabase = createSupabaseAdmin();

    //////////////////////////////////////////////////////
    // Verify ownership
    //////////////////////////////////////////////////////

    const { data: payment, error } = await supabase
      .from("appointment_payments")
      .select(
        `
        id,
        user_id,
        receipt_path
      `,
      )
      .eq("id", paymentId)
      .single();

    if (error || !payment) {
      return NextResponse.json(
        { error: "Payment not found." },
        { status: 404 },
      );
    }

    if (payment.user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    //////////////////////////////////////////////////////
    // Generate signed URL
    //////////////////////////////////////////////////////

    const { data: signed, error: signedError } = await supabase.storage
      .from("receipts")
      .createSignedUrl(payment.receipt_path, 600);

    if (signedError || !signed?.signedUrl) {
      throw signedError;
    }

    //////////////////////////////////////////////////////
    // Success
    //////////////////////////////////////////////////////

    return NextResponse.json({
      success: true,
      receiptUrl: signed.signedUrl,
    });
  } catch (error) {
    console.error("GET RECEIPT:", error);

    return NextResponse.json(
      {
        error: "Unable to load receipt.",
      },
      {
        status: 500,
      },
    );
  }
}
