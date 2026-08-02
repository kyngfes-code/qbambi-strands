import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

import parseAdminFilters from "@/lib/admin/parseAdminFilters";

import {
  buildPaymentListQuery,
  normalizePayments,
  getPaymentCourses,
  getPaymentAdmins,
} from "@/lib/admin/paymentQueries";

import {
  calculatePaymentStats,
  emptyPaymentStats,
} from "@/lib/admin/paymentStats";

//////////////////////////////////////////////////////////////
// GET
//////////////////////////////////////////////////////////////

export async function GET(req) {
  try {
    //////////////////////////////////////////////////////////
    // Authentication
    //////////////////////////////////////////////////////////

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        {
          error: "Forbidden",
        },
        {
          status: 403,
        },
      );
    }

    //////////////////////////////////////////////////////////
    // Supabase
    //////////////////////////////////////////////////////////

    const supabase = createSupabaseAdmin();

    //////////////////////////////////////////////////////////
    // Parse Filters
    //////////////////////////////////////////////////////////

    const { searchParams } = new URL(req.url);

    const filters = parseAdminFilters(searchParams);

    //////////////////////////////////////////////////////////
    // Payments Query
    //////////////////////////////////////////////////////////

    const paymentQuery = buildPaymentListQuery(supabase, filters);

    const { data: rawPayments, count, error } = paymentQuery;

    if (error) {
      throw error;
    }

    //////////////////////////////////////////////////////////
    // Normalize Payments
    //////////////////////////////////////////////////////////

    const payments = normalizePayments(rawPayments ?? []);

    //////////////////////////////////////////////////////////
    // Supporting Data
    //////////////////////////////////////////////////////////

    const [{ data: courses }, { data: admins }] = await Promise.all([
      getPaymentCourses(supabase),
      getPaymentAdmins(supabase),
    ]);

    //////////////////////////////////////////////////////////
    // Statistics
    //////////////////////////////////////////////////////////

    const stats =
      payments.length > 0
        ? calculatePaymentStats(payments)
        : emptyPaymentStats();

    //////////////////////////////////////////////////////////
    // Pagination
    //////////////////////////////////////////////////////////

    const total = Number(count ?? 0);

    const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));

    //////////////////////////////////////////////////////////
    // Response
    //////////////////////////////////////////////////////////

    return NextResponse.json({
      payments,

      stats,

      courses: courses ?? [],

      admins: admins ?? [],

      pagination: {
        page: filters.page,

        pageSize: filters.pageSize,

        total,

        totalPages,
      },
    });
  } catch (error) {
    console.error("Academy Payments:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to load academy payments.",
      },
      {
        status: 500,
      },
    );
  }
}
