import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";

export async function POST(req) {
  try {
    console.time("appointment-receipt");

    /*
    ==========================================
    1️⃣ Authenticate User
    ==========================================
    */

    const session = await auth();

    if (!session?.user?.id) {
      console.timeEnd("appointment-receipt");

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /*
    ==========================================
    2️⃣ Read Form Data
    ==========================================
    */

    const formData = await req.formData();

    const appointmentId = formData.get("appointmentId");
    const receipt = formData.get("receipt");
    const amount = formData.get("amount");
    const customerMessage = formData.get("customerMessage");
    let paymentType;

    if (!appointmentId || !receipt || !amount) {
      console.timeEnd("appointment-receipt");

      return NextResponse.json(
        {
          error: "appointmentId, receipt and amount are required",
        },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    /*
    ==========================================
    3️⃣ Verify Appointment Ownership
    ==========================================
    */

    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select(
        `
  id,
  status,
  user_id,
  deposit_required,
  amount_paid,
  service_amount,
  balance_due,
  user:users!appointments_user_id_fkey(
  email
)
`,
      )
      .eq("id", appointmentId)
      .single();

    if (
      appointmentError ||
      !appointment ||
      appointment.user_id !== session.user.id
    ) {
      console.timeEnd("appointment-receipt");

      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );
    }

    if (
      appointment.status === "pending" ||
      appointment.status === "pending_confirmation"
    ) {
      // Initial deposit
      paymentType = "deposit";
    } else if (appointment.status === "completed") {
      // Remaining balance after service
      paymentType = "outstanding_payment";
    } else if (appointment.status === "confirmed") {
      return NextResponse.json(
        {
          error:
            "Your deposit has already been confirmed. Any remaining balance can only be paid after your appointment has been completed.",
        },
        { status: 409 },
      );
    } else {
      return NextResponse.json(
        {
          error: "Payments are not accepted for this appointment.",
        },
        { status: 400 },
      );
    }

    /*
    ==========================================
    4️⃣ Check Existing Payment
    ==========================================
    */

    const { data: existing, error: existingError } = await supabase
      .from("appointment_payments")
      .select("*")
      .eq("appointment_id", appointmentId)
      .eq("payment_type", paymentType)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingError) {
      console.error(existingError);

      console.timeEnd("appointment-receipt");

      return NextResponse.json(
        { error: "Failed to check existing payments" },
        { status: 500 },
      );
    }

    /*
    Prevent duplicate submissions
    */

    if (existing) {
      switch (existing.status) {
        case "pending":
          return NextResponse.json(
            {
              error: "Payment is already under review.",
            },
            { status: 409 },
          );

        case "confirmed":
          return NextResponse.json(
            {
              error: "This payment has already been confirmed.",
            },
            { status: 409 },
          );

        case "cancelled":
          return NextResponse.json(
            {
              error: "This payment has been cancelled.",
            },
            { status: 400 },
          );
      }
    }

    /*
    ==========================================
    5️⃣ Upload Receipt
    ==========================================
    */

    const extension = receipt.name?.split(".").pop()?.toLowerCase() || "file";

    const filePath = `appointments/${appointmentId}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(filePath, receipt, {
        upsert: false,
      });

    if (uploadError) {
      console.error(uploadError);

      console.timeEnd("appointment-receipt");

      return NextResponse.json(
        { error: "Receipt upload failed" },
        { status: 500 },
      );
    }

    /*
    ==========================================
    6️⃣ Generate Signed URL
    ==========================================
    */

    const { data: signed, error: signedError } = await supabase.storage
      .from("receipts")
      .createSignedUrl(
        filePath,
        60 * 60 * 24 * 30, // 30 days
      );

    if (signedError || !signed?.signedUrl) {
      console.error(signedError);

      console.timeEnd("appointment-receipt");

      return NextResponse.json(
        {
          error: "Failed to generate receipt URL",
        },
        { status: 500 },
      );
    }

    /*
    ==========================================
    7️⃣ Handle Rejected Resubmissions
    ==========================================
    */

    if (existing?.status === "rejected") {
      const { error: updateError } = await supabase
        .from("appointment_payments")
        .update({
          receipt_url: signed.signedUrl,
          amount: Number(amount),
          payment_type: paymentType,
          status: "pending",
          rejection_reason: null,
          customer_message: customerMessage || null,
          resubmitted_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error(updateError);

        console.timeEnd("appointment-receipt");

        return NextResponse.json(
          { error: "Failed to update payment" },
          { status: 500 },
        );
      }

      await supabase
        .from("payment_transactions")
        .update({
          status: "pending",
          amount: Number(amount),
          updated_at: new Date().toISOString(),
          metadata: {
            uploadedReceipt: true,
            resubmitted: true,
          },
        })
        .eq("source_record_id", existing.id);

      /*
      Notify Admin
      */

      await supabase.from("admin_notifications").insert({
        type: "appointment_receipt_uploaded",
        message: "Appointment payment receipt resubmitted",
      });

      console.timeEnd("appointment-receipt");

      return NextResponse.json({
        success: true,
        receipt_url: signed.signedUrl,
      });
    }

    /*
    ==========================================
    8️⃣ Create New Payment
    ==========================================
    */

    const { data: payment, error: paymentError } = await supabase
      .from("appointment_payments")
      .insert({
        appointment_id: appointmentId,
        user_id: session.user.id,

        amount: Number(amount),

        payment_type: paymentType,

        payment_method: "bank_transfer",
        payment_channel: "offline",

        receipt_url: signed.signedUrl,

        customer_message: customerMessage || null,

        status: "pending",
      })
      .select()
      .single();

    if (paymentError) {
      console.error(paymentError);

      console.timeEnd("appointment-receipt");

      return NextResponse.json(
        {
          error: "Failed to save payment",
        },
        { status: 500 },
      );
    }

    const { error: transactionError } = await supabase
      .from("payment_transactions")
      .insert({
        provider: "bank_transfer",
        provider_reference: crypto.randomUUID(),

        entity_type: "appointment",
        entity_id: appointmentId,

        source_record_id: payment.id,

        payment_type: paymentType,

        user_id: session.user.id,

        email: appointment.user.email,

        amount: Number(amount),

        currency: "NGN",

        payment_method: "bank_transfer",

        status: "pending",

        metadata: {
          uploadedReceipt: true,
          receipt_url: signed.signedUrl,
          customerMessage,
        },
      });

    if (transactionError) {
      throw transactionError;
    }

    /*
    ==========================================
    9️⃣ Notify Admin
    ==========================================
    */

    await supabase.from("admin_notifications").insert({
      type: "appointment_receipt_uploaded",
      message: "Appointment payment receipt uploaded",
    });

    console.timeEnd("appointment-receipt");

    /*
    ==========================================
    🔟 Success Response
    ==========================================
    */

    return NextResponse.json({
      success: true,
      receipt_url: signed.signedUrl,
    });
  } catch (err) {
    console.error("Appointment receipt handler crashed:", err);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
