import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import buildAcademyConfirmationEmail from "@/lib/email/templates/AcademyConfirmationEmail";
import buildAcademyRejectionEmail from "@/lib/email/templates/AcademyRejectionEmail";
import buildAcademyStudentActivationEmail from "@/lib/email/templates/AcademyStudentActivationEmail";
import buildAcademyExistingStudentEnrollmentEmail from "@/lib/email/templates/AcademyExistingStudentEnrollmentEmail";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_ATTEMPTS = 5;
const BATCH_SIZE = 10;

const PROCESSING_TIMEOUT_MINUTES = 15;
const BASE_RETRY_MINUTES = 5;

// ============================================================
// EMAIL TEST MODE
// ============================================================

const EMAIL_TEST_MODE =
  String(process.env.EMAIL_TEST_MODE || "").toLowerCase() === "true";

const EMAIL_TEST_RECIPIENT =
  process.env.EMAIL_TEST_RECIPIENT?.trim() || "oviefestus@gmail.com";

// ============================================================
// POST
// ============================================================

export async function POST(req) {
  try {
    const workerSecret = process.env.EMAIL_WORKER_SECRET;

    if (!workerSecret) {
      console.error("Email worker: EMAIL_WORKER_SECRET is not configured.");

      return NextResponse.json(
        {
          success: false,
          error: "Email worker is not configured.",
        },
        { status: 500 },
      );
    }

    const authorization = req.headers.get("authorization");

    if (authorization !== `Bearer ${workerSecret}`) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const result = await runEmailWorker();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Email worker fatal error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Email worker failed.",
      },
      { status: 500 },
    );
  }
}

// ============================================================
// EMAIL WORKER
// ============================================================

export async function runEmailWorker() {
  const startedAt = Date.now();

  if (!process.env.RESEND_API_KEY) {
    throw new Error("Email sending service is not configured.");
  }

  const supabase = createSupabaseAdmin();

  const now = new Date();
  const nowIso = now.toISOString();

  // ==========================================================
  // 1. RECOVER STALE PROCESSING EMAILS
  // ==========================================================

  const staleProcessingBefore = new Date(
    now.getTime() - PROCESSING_TIMEOUT_MINUTES * 60 * 1000,
  ).toISOString();

  const { data: recoveredEmails, error: recoveryError } = await supabase
    .from("email_outbox")
    .update({
      status: "pending",
      next_attempt_at: nowIso,
      updated_at: nowIso,
    })
    .eq("status", "processing")
    .lt("updated_at", staleProcessingBefore)
    .select("id");

  if (recoveryError) {
    console.error(
      "Email worker: unable to recover stale emails:",
      recoveryError,
    );
  }

  const recoveredCount = recoveredEmails?.length ?? 0;

  // ==========================================================
  // 2. LOAD PENDING EMAILS
  // ==========================================================

  const { data: pendingEmails, error: pendingError } = await supabase
    .from("email_outbox")
    .select("*")
    .eq("status", "pending")
    .or(`next_attempt_at.is.null,next_attempt_at.lte.${nowIso}`)
    .order("created_at", {
      ascending: true,
    })
    .limit(BATCH_SIZE);

  if (pendingError) {
    throw new Error(`Unable to load email queue: ${pendingError.message}`);
  }

  if (!pendingEmails?.length) {
    return {
      success: true,
      message: "No emails waiting to be processed.",
      processed: 0,
      claimed: 0,
      sent: 0,
      retried: 0,
      failed: 0,
      skipped: 0,
      recovered: recoveredCount,
      testMode: EMAIL_TEST_MODE,
      testRecipient: EMAIL_TEST_MODE ? EMAIL_TEST_RECIPIENT : null,
      durationMs: Date.now() - startedAt,
      results: [],
    };
  }

  let processed = 0;
  let claimed = 0;
  let sent = 0;
  let retried = 0;
  let failed = 0;
  let skipped = 0;

  const results = [];

  // ==========================================================
  // 3. PROCESS EMAIL QUEUE
  // ==========================================================

  for (const email of pendingEmails) {
    processed++;

    if (!email?.id) {
      skipped++;

      results.push({
        id: null,
        status: "invalid_queue_record",
      });

      continue;
    }

    const currentAttempts = Number(email.attempts ?? 0);

    // ========================================================
    // MAX ATTEMPTS
    // ========================================================

    if (currentAttempts >= MAX_ATTEMPTS) {
      const { error } = await supabase
        .from("email_outbox")
        .update({
          status: "failed",
          last_error: "Maximum email attempts reached.",
          next_attempt_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", email.id)
        .eq("status", "pending");

      if (error) {
        console.error(
          "Unable to mark maximum-attempt email failed:",
          email.id,
          error,
        );
      }

      failed++;

      results.push({
        id: email.id,
        status: "failed",
        attempts: currentAttempts,
        reason: "maximum_attempts_reached",
      });

      continue;
    }

    // ========================================================
    // CLAIM EMAIL
    // ========================================================

    const claimedAttempts = currentAttempts + 1;

    const { data: claimedEmail, error: claimError } = await supabase
      .from("email_outbox")
      .update({
        status: "processing",
        attempts: claimedAttempts,
        updated_at: new Date().toISOString(),
        last_error: null,
      })
      .eq("id", email.id)
      .eq("status", "pending")
      .select("*")
      .maybeSingle();

    if (claimError) {
      console.error("Email worker: claim failed:", email.id, claimError);

      results.push({
        id: email.id,
        status: "claim_failed",
        error: claimError.message,
      });

      continue;
    }

    if (!claimedEmail) {
      skipped++;

      results.push({
        id: email.id,
        status: "already_claimed",
      });

      continue;
    }

    claimed++;

    // ========================================================
    // VALIDATE RECIPIENT
    // ========================================================

    if (!claimedEmail.to_email?.trim()) {
      const errorMessage = "Queued email does not contain a recipient.";

      await markEmailFailed({
        supabase,
        emailId: claimedEmail.id,
        errorMessage,
        permanentlyFailed: true,
      });

      failed++;

      results.push({
        id: claimedEmail.id,
        status: "failed",
        attempts: claimedAttempts,
        error: errorMessage,
      });

      continue;
    }

    // ========================================================
    // VALIDATE SUBJECT
    // ========================================================

    if (!claimedEmail.subject?.trim()) {
      const errorMessage = "Queued email does not contain a subject.";

      await markEmailFailed({
        supabase,
        emailId: claimedEmail.id,
        errorMessage,
        permanentlyFailed: true,
      });

      failed++;

      results.push({
        id: claimedEmail.id,
        status: "failed",
        attempts: claimedAttempts,
        error: errorMessage,
      });

      continue;
    }

    // ========================================================
    // SEND
    // ========================================================

    try {
      console.log("Email worker: sending email", claimedEmail.id);

      const resendResult = await sendEmailWithResend(claimedEmail);

      // ======================================================
      // MARK SENT
      // ======================================================

      const { error: sentError } = await supabase
        .from("email_outbox")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          last_error: null,
          next_attempt_at: null,
          updated_at: new Date().toISOString(),
          provider_message_id: resendResult?.id ?? null,
        })
        .eq("id", claimedEmail.id)
        .eq("status", "processing");

      if (sentError) {
        console.error(
          "Email worker: Resend succeeded but database update failed:",
          claimedEmail.id,
          sentError,
        );

        results.push({
          id: claimedEmail.id,
          status: "sent_but_status_update_failed",
          resendId: resendResult?.id ?? null,
          error: sentError.message,
        });

        continue;
      }

      sent++;

      results.push({
        id: claimedEmail.id,
        status: "sent",
        resendId: resendResult?.id ?? null,
        attempts: claimedAttempts,
        emailType: claimedEmail.email_type,
        actualStudentEmail: claimedEmail.to_email,
        resendRecipient: getResendRecipient(claimedEmail),
      });
    } catch (sendError) {
      const errorMessage = sendError?.message || "Unknown email sending error.";

      const permanentlyFailed = claimedAttempts >= MAX_ATTEMPTS;

      const retryMinutes =
        BASE_RETRY_MINUTES * Math.pow(2, Math.max(claimedAttempts - 1, 0));

      const nextAttemptAt = permanentlyFailed
        ? null
        : new Date(Date.now() + retryMinutes * 60 * 1000).toISOString();

      const nextStatus = permanentlyFailed ? "failed" : "pending";

      const { error: failureUpdateError } = await supabase
        .from("email_outbox")
        .update({
          status: nextStatus,
          last_error: errorMessage,
          next_attempt_at: nextAttemptAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", claimedEmail.id)
        .eq("status", "processing");

      if (failureUpdateError) {
        console.error(
          "Email worker: failed to update email after send failure:",
          claimedEmail.id,
          failureUpdateError,
        );
      }

      if (permanentlyFailed) {
        failed++;
      } else {
        retried++;
      }

      results.push({
        id: claimedEmail.id,
        status: permanentlyFailed ? "failed" : "retry_scheduled",
        attempts: claimedAttempts,
        nextAttemptAt,
        error: errorMessage,
      });
    }
  }

  // ==========================================================
  // RESULT
  // ==========================================================

  return {
    success: true,
    processed,
    claimed,
    sent,
    retried,
    failed,
    skipped,
    recovered: recoveredCount,
    testMode: EMAIL_TEST_MODE,
    testRecipient: EMAIL_TEST_MODE ? EMAIL_TEST_RECIPIENT : null,
    durationMs: Date.now() - startedAt,
    results,
  };
}

// ============================================================
// RESEND
// ============================================================

async function sendEmailWithResend(email) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const defaultFrom =
    process.env.EMAIL_FROM || "Qbambi Strands <onboarding@resend.dev>";

  // ==========================================================
  // PAYLOAD
  // ==========================================================

  const payload =
    email.payload &&
    typeof email.payload === "object" &&
    !Array.isArray(email.payload)
      ? email.payload
      : {};

  // ==========================================================
  // EMAIL TYPE
  // ==========================================================

  const emailType = String(email.email_type || payload.email_type || "").trim();

  // ==========================================================
  // ACTUAL RECIPIENT
  // ==========================================================

  const actualStudentEmail = String(
    email.to_email || payload.email || "",
  ).trim();

  if (!actualStudentEmail) {
    throw new Error("Email does not contain a student recipient.");
  }

  const resendRecipient = getResendRecipient(email);

  // ==========================================================
  // BUILD TEMPLATE
  // ==========================================================

  const message = await buildEmailTemplate(emailType, payload);

  if (!message?.subject) {
    throw new Error(`Email template "${emailType}" did not return a subject.`);
  }

  if (!message?.html) {
    throw new Error(`Email template "${emailType}" did not return HTML.`);
  }

  // ==========================================================
  // FROM
  // ==========================================================

  const from =
    typeof payload.from === "string" && payload.from.trim()
      ? payload.from.trim()
      : defaultFrom;

  // ==========================================================
  // DEBUG
  // ==========================================================

  console.log("Email worker sending email:", {
    outboxId: email.id,
    emailType,
    actualStudentEmail,
    resendRecipient,
    testMode: EMAIL_TEST_MODE,
    subject: message.subject,
  });

  // ==========================================================
  // RESEND REQUEST
  // ==========================================================

  const requestBody = {
    from,
    to: [resendRecipient],
    subject: message.subject,
    html: message.html,
    text: message.text || "",
  };

  let response;

  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",

      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify(requestBody),
    });
  } catch (networkError) {
    throw new Error(
      `Unable to reach Resend: ${
        networkError?.message || "network request failed"
      }`,
    );
  }

  // ==========================================================
  // PARSE RESPONSE
  // ==========================================================

  const responseText = await response.text();

  let result = null;

  if (responseText) {
    try {
      result = JSON.parse(responseText);
    } catch {
      result = {
        raw: responseText,
      };
    }
  }

  // ==========================================================
  // RESEND ERROR
  // ==========================================================

  if (!response.ok) {
    const resendMessage =
      result?.message ||
      result?.error ||
      result?.name ||
      `Resend returned HTTP ${response.status}.`;

    throw new Error(`Resend error (${response.status}): ${resendMessage}`);
  }

  return result || {};
}

// ============================================================
// TEMPLATE ROUTER
// ============================================================

async function buildEmailTemplate(emailType, payload) {
  switch (emailType) {
    // ========================================================
    // ACADEMY FIRST ENROLLMENT CONFIRMATION
    // ========================================================

    case "academy_enrollment_confirmation":
      return buildAcademyConfirmationEmail({
        ...payload,

        // Academy uses enrollment_number.
        enrollmentNumber:
          payload.enrollment_number ||
          payload.enrollmentNumber ||
          payload.student_number ||
          "—",
      });

    // ========================================================
    // ACADEMY ADDITIONAL ENROLLMENT APPROVED
    //
    // Used when an existing Academy student applies for
    // another enrollment.
    //
    // IMPORTANT:
    // This must NOT create another password setup flow.
    // The student already has an Academy account.
    // ========================================================

    case "academy_additional_enrollment_approved":
      return buildAcademyExistingStudentEnrollmentEmail({
        ...payload,

        // Each enrollment has its own enrollment number.
        enrollment_number:
          payload.enrollment_number || payload.enrollmentNumber || "—",

        // Existing student already has login credentials.
        login_url:
          payload.login_url ||
          payload.loginUrl ||
          `${process.env.NEXT_PUBLIC_SITE_URL || ""}/account`,

        academy_url:
          payload.academy_url ||
          payload.academyUrl ||
          `${process.env.NEXT_PUBLIC_SITE_URL || ""}/academy`,
      });

    // ========================================================
    // ACADEMY REJECTION
    // ========================================================

    case "academy_enrollment_rejection":
      return buildAcademyRejectionEmail({
        ...payload,

        enrollmentNumber:
          payload.enrollment_number ||
          payload.enrollmentNumber ||
          payload.student_number ||
          "—",
      });

    // ========================================================
    // ACADEMY STUDENT ACTIVATION
    // ========================================================

    case "academy_student_activation":
      return buildAcademyStudentActivationEmail({
        ...payload,

        enrollmentNumber:
          payload.enrollment_number ||
          payload.enrollmentNumber ||
          payload.student_number ||
          "—",
      });

    // ========================================================
    // UNKNOWN
    // ========================================================

    default:
      throw new Error(`Unsupported email type: ${emailType || "unknown"}`);
  }
}

// ============================================================
// RESEND RECIPIENT
// ============================================================

function getResendRecipient(email) {
  if (EMAIL_TEST_MODE) {
    return EMAIL_TEST_RECIPIENT;
  }

  return String(email?.to_email || "").trim();
}

// ============================================================
// MARK EMAIL FAILED
// ============================================================

async function markEmailFailed({
  supabase,
  emailId,
  errorMessage,
  permanentlyFailed,
}) {
  const attemptsQuery = await supabase
    .from("email_outbox")
    .select("attempts")
    .eq("id", emailId)
    .maybeSingle();

  const attempts = Number(attemptsQuery.data?.attempts ?? MAX_ATTEMPTS);

  const retryMinutes =
    BASE_RETRY_MINUTES * Math.pow(2, Math.max(attempts - 1, 0));

  const nextAttemptAt = permanentlyFailed
    ? null
    : new Date(Date.now() + retryMinutes * 60 * 1000).toISOString();

  await supabase
    .from("email_outbox")
    .update({
      status: permanentlyFailed ? "failed" : "pending",

      last_error: errorMessage,

      next_attempt_at: nextAttemptAt,

      updated_at: new Date().toISOString(),
    })
    .eq("id", emailId)
    .eq("status", "processing");
}
