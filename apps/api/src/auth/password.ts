import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keyLength: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/**
 * Hashes a password with scrypt (built into Node, memory-hard).
 * Stored format: `scrypt$<salt hex>$<hash hex>`. A random salt per password
 * means two users with the same password get different hashes.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const hash = await scryptAsync(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [algorithm, saltHex, hashHex] = stored.split('$');
  if (algorithm !== 'scrypt' || !saltHex || !hashHex) {
    return false;
  }
  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scryptAsync(
    password,
    Buffer.from(saltHex, 'hex'),
    expected.length,
  );
  // Constant-time comparison, so response time does not leak how many
  // characters matched.
  return timingSafeEqual(actual, expected);
}
