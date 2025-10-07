import * as crypto from 'node:crypto';

/**
 * Generates a cryptographically secure, URL-safe token and its SHA256 hash.
 * @returns An object containing the raw token (to be sent to the user) and its hash (to be stored in the database).
 */
export function generateSecureToken(): {
  rawToken: string;
  hashedToken: string;
} {
  const rawToken = crypto.randomBytes(32).toString('base64url');
  const hashedToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');

  return { rawToken, hashedToken };
}

/**
 * Hashes a raw token using SHA256.
 * @param rawToken The raw token received from the user.
 * @returns The SHA256 hash of the token.
 */
export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}
