import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createHash, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';

/** Header the web adds to every call to the API (apps/web/src/proxy.ts). */
export const INTERNAL_KEY_HEADER = 'x-internal-api-key';

const SKIP_INTERNAL_KEY = 'skipInternalKey';

/** Routes the hosting provider calls directly (e.g. its health check). */
export const SkipInternalKey = () => SetMetadata(SKIP_INTERNAL_KEY, true);

/**
 * Constant-time comparison: how long it takes does not reveal how many
 * characters were right. Both sides are hashed first so their lengths match.
 */
export function isValidInternalKey(
  expected: string,
  received: string | undefined,
): boolean {
  if (!received) return false;
  const digest = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(digest(expected), digest(received));
}

/**
 * Global guard: the API only serves the web. Requests without the shared key
 * (INTERNAL_API_KEY, the same value in the web and the API) are rejected
 * before anything else runs, rate limits included, so calling the API
 * directly cannot fake the visitor's IP to dodge them.
 * Without INTERNAL_API_KEY (local development) every request passes; in
 * production main.ts refuses to start without it.
 */
@Injectable()
export class InternalKeyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = process.env['INTERNAL_API_KEY'];
    if (!expected) return true;
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_INTERNAL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;
    const received = context.switchToHttp().getRequest<Request>().headers[
      INTERNAL_KEY_HEADER
    ];
    if (!isValidInternalKey(expected, received as string | undefined)) {
      throw new ForbiddenException();
    }
    return true;
  }
}
