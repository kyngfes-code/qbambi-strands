// lib/admin/paymentQueries.js

import buildPaginationQuery from "./buildPaginationQuery";
import { applyPaymentFilters } from "./paymentFilters";

/**
 * Base SELECT shared across academy payment endpoints.
 */
export const PAYMENT_SELECT = `
  *,
  enrollment:academy_enrollments(
    id,
    enrollment_number,
    first_name,
    last_name,
    other_name,
    email,
    phone,
    learning_mode,
    total_course_fee,
    amount_paid,
    balance_due,
    payment_status,
    status,
    academy_enrollment_courses(
      id,
      course_id,
      pricing_id,
      course:academy_courses(
        id,
        title,
        level
      ),
      pricing:academy_course_pricing(
        id,
        learning_mode,
        duration_months,
        price
      )
    )
  ),
  received_by_user:users!academy_enrollment_payments_received_by_fkey(
    id,
    first_name,
    last_name,
    email
  )
`;

/**
 * Create the base academy payment query.
 */
export function createPaymentQuery(supabase, { count = true } = {}) {
  return supabase.from("academy_enrollment_payments").select(PAYMENT_SELECT, {
    count: count ? "exact" : undefined,
  });
}

/**
 * Build academy payment list query
 * (filters + sorting + pagination).
 */
export function buildPaymentListQuery(supabase, filters) {
  let query = createPaymentQuery(supabase, {
    count: true,
  });

  //----------------------------------------------------
  // Filters
  //----------------------------------------------------

  query = applyPaymentFilters(query, filters);

  //----------------------------------------------------
  // Sorting
  //----------------------------------------------------

  query = query.order(filters.sortBy || "payment_date", {
    ascending: filters.sortOrder === "asc",
  });

  //----------------------------------------------------
  // Pagination
  //----------------------------------------------------

  query = buildPaginationQuery(query, filters.page, filters.pageSize);

  return query;
}

/**
 * Fetch a single payment.
 */
export async function getPaymentById(supabase, paymentId) {
  return supabase
    .from("academy_enrollment_payments")
    .select(PAYMENT_SELECT)
    .eq("id", paymentId)
    .single();
}

/**
 * Fetch payment adjustments.
 */
export async function getPaymentAdjustments(supabase, paymentId) {
  return supabase
    .from("academy_payment_adjustments")
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
    .eq("payment_id", paymentId)
    .order("created_at", {
      ascending: false,
    });
}

/**
 * Fetch all payments belonging to one enrollment.
 */
export async function getEnrollmentPayments(supabase, enrollmentId) {
  return supabase
    .from("academy_enrollment_payments")
    .select(PAYMENT_SELECT)
    .eq("enrollment_id", enrollmentId)
    .order("payment_date", {
      ascending: false,
    });
}

/**
 * Fetch active academy courses.
 */
export async function getPaymentCourses(supabase) {
  return supabase
    .from("academy_courses")
    .select(
      `
      id,
      title,
      level,
      sort_order
    `,
    )
    .eq("active", true)
    .order("sort_order");
}

/**
 * Fetch admin users.
 */
export async function getPaymentAdmins(supabase) {
  return supabase
    .from("users")
    .select(
      `
      id,
      first_name,
      last_name
    `,
    )
    .eq("role", "admin")
    .order("first_name");
}

/**
 * Normalize nested payment data for frontend.
 */
export function normalizePayments(payments = []) {
  return payments.map((payment) => ({
    ...payment,

    enrollment: {
      ...payment.enrollment,

      courses:
        payment.enrollment?.academy_enrollment_courses?.map((item) => ({
          ...item.course,
          pricing: item.pricing,
        })) ?? [],
    },
  }));
}
