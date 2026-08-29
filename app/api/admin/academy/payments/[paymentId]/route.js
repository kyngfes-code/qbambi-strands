import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

import {
  getPaymentById,
  getPaymentAdjustments,
} from "@/lib/admin/paymentQueries";

import { updateEnrollmentFinancials } from "@/lib/admin/paymentAdjustments";

import { buildPaymentTimeline } from "@/lib/admin/paymentTimeline";

//////////////////////////////////////////////////////////////
// Helpers
//////////////////////////////////////////////////////////////

async function authorize() {
  const session = await auth();

  if (!session?.user) {
    return {
      error: NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      ),
    };
  }

  if (session.user.role !== "admin") {
    return {
      error: NextResponse.json(
        {
          error: "Forbidden",
        },
        {
          status: 403,
        },
      ),
    };
  }

  return {
    session,

    supabase: createSupabaseAdmin(),
  };
}

//////////////////////////////////////////////////////////////
// GET
//////////////////////////////////////////////////////////////

export async function GET(req, { params }) {
  const authResult = await authorize();

  if (authResult.error) {
    return authResult.error;
  }

  const { supabase } = authResult;

  const { id } = await params;

  try {
    //////////////////////////////////////////////////////////

    const { data: payment, error } = await getPaymentById(supabase, id);

    if (error || !payment) {
      return NextResponse.json(
        {
          error: "Payment not found.",
        },
        {
          status: 404,
        },
      );
    }

    //////////////////////////////////////////////////////////

    const { data: adjustments } = await getPaymentAdjustments(supabase, id);

    //////////////////////////////////////////////////////////

    const { data: notes } = await supabase
      .from("academy_enrollment_notes")
      .select(
        `
          *,
          created_by_user:users(
            id,
            first_name,
            last_name
          )
          `,
      )
      .eq("enrollment_id", payment.enrollment_id)
      .order("created_at", {
        ascending: false,
      });

    //////////////////////////////////////////////////////////

    const { data: timeline } = await supabase
      .from("academy_enrollment_timeline")
      .select(
        `
          *,
          created_by_user:users(
            id,
            first_name,
            last_name
          )
          `,
      )
      .eq("enrollment_id", payment.enrollment_id)
      .order("created_at", {
        ascending: false,
      });

    //////////////////////////////////////////////////////////

    const history = buildPaymentTimeline({
      payments: [payment],

      adjustments: adjustments || [],

      notes: notes || [],

      timeline: timeline || [],
    });

    //////////////////////////////////////////////////////////

    return NextResponse.json({
      payment,

      adjustments: adjustments || [],

      notes: notes || [],

      timeline: timeline || [],

      history,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Unable to load payment.",
      },
      {
        status: 500,
      },
    );
  }
}

//////////////////////////////////////////////////////////////
// PATCH
//////////////////////////////////////////////////////////////

export async function PATCH(req, { params }) {
  const authResult = await authorize();

  if (authResult.error) {
    return authResult.error;
  }

  const { supabase } = authResult;

  const { id } = await params;

  try {
    const body = await req.json();

    //////////////////////////////////////////////////////////

    const updates = {};

    //////////////////////////////////////////////////////////
    // Editable Fields
    //////////////////////////////////////////////////////////

    const editableFields = [
      "payment_method",

      "payment_date",

      "reference",

      "payment_reference",

      "receipt_number",

      "notes",
    ];

    editableFields.forEach((field) => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    updates.updated_at = new Date().toISOString();

    //////////////////////////////////////////////////////////

    const { data, error } = await supabase
      .from("academy_enrollment_payments")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    //////////////////////////////////////////////////////////

    return NextResponse.json({
      success: true,

      payment: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Unable to update payment.",
      },
      {
        status: 500,
      },
    );
  }
}

//////////////////////////////////////////////////////////////
// DELETE
//////////////////////////////////////////////////////////////

export async function DELETE(req, { params }) {
  const authResult = await authorize();

  if (authResult.error) {
    return authResult.error;
  }

  const { supabase } = authResult;

  const { id } = await params;

  try {
    //////////////////////////////////////////////////////////

    const { data: payment, error } = await supabase
      .from("academy_enrollment_payments")
      .select("id,enrollment_id")
      .eq("id", id)
      .single();

    if (error || !payment) {
      return NextResponse.json(
        {
          error: "Payment not found.",
        },
        {
          status: 404,
        },
      );
    }

    //////////////////////////////////////////////////////////
    // Prevent deleting adjusted payments
    //////////////////////////////////////////////////////////

    const { count } = await supabase
      .from("academy_payment_adjustments")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("payment_id", id);

    if (Number(count) > 0) {
      return NextResponse.json(
        {
          error: "Payments with adjustments cannot be deleted.",
        },
        {
          status: 409,
        },
      );
    }

    //////////////////////////////////////////////////////////

    const { error: deleteError } = await supabase
      .from("academy_enrollment_payments")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw deleteError;
    }

    //////////////////////////////////////////////////////////

    await supabase.from("academy_enrollment_timeline").insert({
      enrollment_id: payment.enrollment_id,

      event_type: "payment_deleted",

      title: "Payment Deleted",

      description: "Payment removed by administrator.",

      created_by: authResult.session.user.id,
    });

    //////////////////////////////////////////////////////////

    await updateEnrollmentFinancials(supabase, payment.enrollment_id);

    //////////////////////////////////////////////////////////

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Unable to delete payment.",
      },
      {
        status: 500,
      },
    );
  }
}
