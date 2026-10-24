import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, normalizeIp } from '@nestjs/throttler';
import type { Request } from 'express';
import {
  INTERNAL_KEY_HEADER,
  isValidInternalKey,
} from './internal-key.guard.js';

/** Header where the web puts the visitor's IP (apps/web/src/proxy.ts). */
export const CLIENT_IP_HEADER = 'x-client-ip';

/**
 * The visitor's IP. The web reads it from its hosting (Netlify writes it on
 * its first server, where the visitor cannot fake it) and sends it in
 * x-client-ip. That header is believed only when the same request carries the
 * shared key, i.e. it really comes from the web (ADR-016), so it does not
 * matter how many proxies sit in between.
 * Otherwise (local development, or the web could not read it) it falls back
 * to Express' req.ip, which counts proxies with TRUST_PROXY.
 */
export function clientIp(req: Request): string {
  const expected = process.env['INTERNAL_API_KEY'];
  const fromWeb = req.headers[CLIENT_IP_HEADER];
  if (
    expected &&
    typeof fromWeb === 'string' &&
    fromWeb &&
    isValidInternalKey(expected, req.headers[INTERNAL_KEY_HEADER] as string)
  ) {
    return fromWeb;
  }
  return req.ip ?? '';
}

/** ThrottlerGuard that counts attempts per visitor with clientIp(). */
@Injectable()
export class ClientIpThrottlerGuard extends ThrottlerGuard {
  protected override getTracker(req: Record<string, any>): Promise<string> {
    return Promise.resolve(
      normalizeIp(clientIp(req as Request), this.ipv6SubnetPrefix),
    );
  }
}
