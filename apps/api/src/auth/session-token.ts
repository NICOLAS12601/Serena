import { createHash, randomBytes } from 'node:crypto';

/** Name of the cookie that carries the admin session token. */
export const SESSION_COOKIE = 'serena_session';

/** Sessions last a week; logging out or changing the password ends them earlier. */
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** 32 random bytes: impossible to guess, safe to put in a cookie. */
export function generateSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Only the hash is stored. A fast hash is enough here (unlike passwords):
 * the token is random and long, so it cannot be brute-forced.
 */
export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Reads one cookie from a raw `Cookie` header without extra dependencies. */
export function readCookie(
  header: string | undefined,
  name: string,
): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return decodeURIComponent(value.join('='));
  }
  return null;
}
