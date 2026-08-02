// lib/admin/paymentStats.js

/**
 * Calculate payment dashboard statistics.
 *
 * Works with academy_enrollment_payments joined to academy_enrollments.
 */

export function calculatePaymentStats(payments = []) {
  const stats = {
    totalRevenue: 0,

    totalPayments: payments.length,

    outstandingBalance: 0,

    refunds: 0,

    completedPayments: 0,

    pendingPayments: 0,

    refundedPayments: 0,

    partialRefunds: 0,

    writtenOffPayments: 0,

    averagePayment: 0,
  };

  const processedEnrollments = new Set();

  //----------------------------------------------------
  // Calculate
  //----------------------------------------------------

  payments.forEach((payment) => {
    const amount = Number(payment.amount || 0);

    stats.totalRevenue += amount;

    //--------------------------------------------------
    // Status Counters
    //--------------------------------------------------

    switch (payment.status) {
      case "completed":
        stats.completedPayments++;
        break;

      case "pending":
        stats.pendingPayments++;
        break;

      case "refunded":
        stats.refundedPayments++;
        stats.refunds += amount;
        break;

      case "partially_refunded":
        stats.partialRefunds++;
        stats.refunds += amount;
        break;

      case "written_off":
        stats.writtenOffPayments++;
        break;

      default:
        break;
    }

    //--------------------------------------------------
    // Outstanding Balance
    //
    // Prevent duplicate balances when an enrollment
    // has multiple payment records.
    //--------------------------------------------------

    const enrollment = payment.enrollment;

    if (
      enrollment &&
      enrollment.id &&
      !processedEnrollments.has(enrollment.id)
    ) {
      processedEnrollments.add(enrollment.id);

      stats.outstandingBalance += Number(enrollment.balance_due || 0);
    }
  });

  //----------------------------------------------------
  // Average Payment
  //----------------------------------------------------

  if (stats.totalPayments > 0) {
    stats.averagePayment = stats.totalRevenue / stats.totalPayments;
  }

  //----------------------------------------------------

  return stats;
}

/**
 * Empty stats object
 */
export function emptyPaymentStats() {
  return {
    totalRevenue: 0,

    totalPayments: 0,

    outstandingBalance: 0,

    refunds: 0,

    completedPayments: 0,

    pendingPayments: 0,

    refundedPayments: 0,

    partialRefunds: 0,

    writtenOffPayments: 0,

    averagePayment: 0,
  };
}
