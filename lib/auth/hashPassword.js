import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hash a plain text password.
 *
 * @param {string} password
 * @returns {Promise<string>}
 */
export async function hashPassword(password) {
  if (!password || typeof password !== "string") {
    throw new Error("A valid password is required.");
  }

  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a stored hash.
 *
 * @param {string} password
 * @param {string} passwordHash
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, passwordHash) {
  if (!password || !passwordHash) {
    return false;
  }

  return bcrypt.compare(password, passwordHash);
}
