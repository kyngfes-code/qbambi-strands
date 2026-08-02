import crypto from "crypto";

/**
 * Generates a secure email verification token.
 *
 * @param {number} expiresInHours
 * @returns {{
 *   token: string,
 *   expiresAt: Date,
 * }}
 */
export function generateVerificationToken(expiresInHours = 24) {
  const token = crypto.randomBytes(32).toString("hex");

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);

  return {
    token,
    expiresAt,
  };
}
