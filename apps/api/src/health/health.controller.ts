import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { SkipInternalKey } from '../common/internal-key.guard.js';

// Render's health check calls the API directly, without the web's key.
@SkipInternalKey()
@Controller('health')
export class HealthController {
  // GET /health — used by the hosting provider to know the API is up. It also
  // returns the IP the API sees for the caller, to check that TRUST_PROXY is
  // right behind the web's /api proxy (it is the caller's own IP: nothing
  // private). No database access, so it answers even if the database is down.
  // forwardedFor is the raw proxy chain (the caller's own IP and the proxies'),
  // to count how many proxies there are.
  @Get()
  check(@Req() req: Request) {
    return {
      status: 'ok',
      ip: req.ip,
      forwardedFor: req.headers['x-forwarded-for'] ?? null,
    };
  }
}
