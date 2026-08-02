// lib/admin/paymentTimeline.js

/**
 * Payment Timeline Helpers
 *
 * Builds a unified chronological timeline from:
 *
 * - academy_enrollment_payments
 * - academy_payment_adjustments
 * - academy_enrollment_notes (optional)
 * - academy_enrollment_timeline (optional)
 */

//////////////////////////////////////////////////////////////
// Helpers
//////////////////////////////////////////////////////////////

function formatActor(actor) {
  if (!actor) return "System";

  return [actor.first_name, actor.last_name].filter(Boolean).join(" ");
}

//////////////////////////////////////////////////////////////
// Payment Event
//////////////////////////////////////////////////////////////

export function paymentEvent(payment) {
  return {
    id: `payment-${payment.id}`,

    type: "payment",

    title: "Payment Recorded",

    description: `${payment.payment_method ?? "Payment"} • ${payment.reference ?? "No reference"}`,

    amount: Number(payment.amount || 0),

    status: payment.status,

    created_at: payment.payment_date || payment.created_at,

    created_by: formatActor(payment.received_by_user),

    raw: payment,
  };
}

//////////////////////////////////////////////////////////////
// Adjustment Event
//////////////////////////////////////////////////////////////

export function adjustmentEvent(adjustment) {
  const titles = {
    refund: "Refund Issued",

    partial_refund: "Partial Refund",

    write_off: "Balance Written Off",

    correction: "Payment Corrected",

    adjustment: "Payment Adjustment",
  };

  return {
    id: `adjustment-${adjustment.id}`,

    type: "adjustment",

    title: titles[adjustment.adjustment_type] || "Adjustment",

    description: adjustment.reason || "",

    amount: Number(adjustment.amount || 0),

    created_at: adjustment.created_at,

    created_by: formatActor(adjustment.created_by_user),

    raw: adjustment,
  };
}

//////////////////////////////////////////////////////////////
// Enrollment Note Event
//////////////////////////////////////////////////////////////

export function noteEvent(note) {
  return {
    id: `note-${note.id}`,

    type: "note",

    title: "Admin Note",

    description: note.note,

    created_at: note.created_at,

    created_by: formatActor(note.created_by_user),

    raw: note,
  };
}

//////////////////////////////////////////////////////////////
// Timeline Event
//////////////////////////////////////////////////////////////

export function timelineEvent(event) {
  return {
    id: `timeline-${event.id}`,

    type: "timeline",

    title: event.title || event.event_type,

    description: event.description || "",

    created_at: event.created_at,

    created_by: formatActor(event.created_by_user),

    raw: event,
  };
}

//////////////////////////////////////////////////////////////
// Build Timeline
//////////////////////////////////////////////////////////////

export function buildPaymentTimeline({
  payments = [],

  adjustments = [],

  notes = [],

  timeline = [],
}) {
  const events = [];

  //----------------------------------------

  payments.forEach((payment) => {
    events.push(paymentEvent(payment));
  });

  //----------------------------------------

  adjustments.forEach((adjustment) => {
    events.push(adjustmentEvent(adjustment));
  });

  //----------------------------------------

  notes.forEach((note) => {
    events.push(noteEvent(note));
  });

  //----------------------------------------

  timeline.forEach((event) => {
    events.push(timelineEvent(event));
  });

  //----------------------------------------
  // Newest first
  //----------------------------------------

  events.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return events;
}

//////////////////////////////////////////////////////////////
// Payment History Summary
//////////////////////////////////////////////////////////////

export function summarizePaymentHistory(payments = [], adjustments = []) {
  const totalPaid = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0,
  );

  const totalRefunded = adjustments
    .filter((a) => ["refund", "partial_refund"].includes(a.adjustment_type))
    .reduce((sum, adjustment) => sum + Number(adjustment.amount || 0), 0);

  const totalWrittenOff = adjustments
    .filter((a) => a.adjustment_type === "write_off")
    .reduce((sum, adjustment) => sum + Number(adjustment.amount || 0), 0);

  return {
    totalPaid,

    totalRefunded,

    totalWrittenOff,

    netCollected: totalPaid - totalRefunded,

    paymentCount: payments.length,

    adjustmentCount: adjustments.length,
  };
}
