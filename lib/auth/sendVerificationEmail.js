import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Qbambi";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const FROM_EMAIL =
  process.env.EMAIL_FROM || `${APP_NAME} <noreply@yourdomain.com>`;

/**
 * Sends an email verification email.
 *
 * @param {{
 *   email: string;
 *   firstName?: string;
 *   token: string;
 * }} params
 */
export async function sendVerificationEmail({ email, firstName, token }) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  const name = firstName?.trim() || "there";

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Verify your ${APP_NAME} account`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:40px;">
        <h2 style="margin-bottom:16px;">
          Welcome to ${APP_NAME}
        </h2>

        <p>Hello <strong>${name}</strong>,</p>

        <p>
          Thank you for creating your account.
        </p>

        <p>
          Please verify your email address by clicking the button below.
        </p>

        <p style="margin:35px 0;">
          <a
            href="${verifyUrl}"
            style="
              background:#000;
              color:#fff;
              text-decoration:none;
              padding:14px 24px;
              border-radius:8px;
              display:inline-block;
              font-weight:600;
            "
          >
            Verify Email
          </a>
        </p>

        <p>
          Or copy and paste this link into your browser:
        </p>

        <p style="word-break:break-all;">
          ${verifyUrl}
        </p>

        <hr style="margin:40px 0;" />

        <p style="font-size:13px;color:#777;">
          This verification link expires in 24 hours.
        </p>

        <p style="font-size:13px;color:#777;">
          If you didn't create this account, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Verification email failed:", error);

    throw new Error("Unable to send verification email.");
  }

  return true;
}
