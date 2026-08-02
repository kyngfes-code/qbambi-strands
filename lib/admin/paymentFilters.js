// lib/admin/paymentFilters.js

/**
 * Applies server-side payment filters to a Supabase query.
 *
 * Usage:
 *
 * query = applyPaymentFilters(query, filters);
 */

export function applyPaymentFilters(query, filters = {}) {
  if (!query) return query;

  const {
    search,

    status,

    method,

    learningMode,

    course,

    recordedBy,

    period,
  } = filters;

  //------------------------------------------------------------
  // Search
  //------------------------------------------------------------

  if (search?.trim()) {
    const term = search.trim();

    query = query.or(
      [
        `reference.ilike.%${term}%`,
        `payment_reference.ilike.%${term}%`,
        `receipt_number.ilike.%${term}%`,
      ].join(","),
    );
  }

  //------------------------------------------------------------
  // Payment Status
  //------------------------------------------------------------

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  //------------------------------------------------------------
  // Payment Method
  //------------------------------------------------------------

  if (method && method !== "all") {
    query = query.eq("payment_method", method);
  }

  //------------------------------------------------------------
  // Recorded By
  //------------------------------------------------------------

  if (recordedBy && recordedBy !== "all") {
    query = query.eq("received_by", recordedBy);
  }

  //------------------------------------------------------------
  // Learning Mode
  //
  // Requires joined enrollment relation.
  //------------------------------------------------------------

  // if (learningMode && learningMode !== "all") {
  //   query = query.eq("enrollment.learning_mode", learningMode);
  // }

  //------------------------------------------------------------
  // Course
  //
  // Requires joined academy_enrollment_courses relation.
  //------------------------------------------------------------

  // if (course && course !== "all") {
  //   query = query.eq("enrollment.academy_enrollment_courses.course_id", course);
  // }

  //------------------------------------------------------------
  // Date Filters
  //------------------------------------------------------------

  if (period && period !== "all") {
    const now = new Date();

    let from = new Date();

    switch (period) {
      case "today":
        from.setHours(0, 0, 0, 0);
        break;

      case "week":
        from.setDate(now.getDate() - 7);
        break;

      case "month":
        from.setMonth(now.getMonth() - 1);
        break;

      case "year":
        from.setFullYear(now.getFullYear() - 1);
        break;

      default:
        from = null;
    }

    if (from) {
      query = query.gte("payment_date", from.toISOString());
    }
  }

  //------------------------------------------------------------

  return query;
}
